// RSS Feed Processing Service
import Parser from 'rss-parser';
import { db } from '../database.js';
import { updateFeedStats } from '../routes/rssFeeds.js';

interface RSSFeed {
    id: string;
    name: string;
    url: string;
    enabled: boolean;
    category?: string;
}

interface ParsedJob {
    title: string;
    company: string;
    description: string;
    link: string;
    location?: string;
    published_date?: string;
    source_feed_id: string;
    source_feed_name: string;
}

export class RSSProcessor {
    private parser: Parser;

    constructor() {
        this.parser = new Parser({
            customFields: {
                item: ['location', 'company', 'jobTitle', 'pubDate']
            }
        });
    }

    // Get all enabled RSS feeds
    private getEnabledFeeds(): RSSFeed[] {
        try {
            const stmt = db.prepare('SELECT * FROM rss_feeds WHERE enabled = 1');
            return stmt.all() as RSSFeed[];
        } catch (error) {
            console.error('Error fetching RSS feeds:', error);
            return [];
        }
    }

    // Parse RSS feed and extract job information
    private async parseFeed(feed: RSSFeed): Promise<ParsedJob[]> {
        try {
            console.log(`Parsing RSS feed: ${feed.name} (${feed.url})`);

            const rssContent = await this.parser.parseURL(feed.url);
            const jobs: ParsedJob[] = [];

            for (const item of rssContent.items) {
                // Extract job information from RSS item
                const job: ParsedJob = {
                    title: this.extractJobTitle(item),
                    company: this.extractCompany(item),
                    description: this.cleanDescription(item.contentSnippet || item.content || ''),
                    link: item.link || '',
                    location: this.extractLocation(item),
                    published_date: item.pubDate || item.isoDate || new Date().toISOString(),
                    source_feed_id: feed.id,
                    source_feed_name: feed.name
                };

                // Only add if we have minimum required information
                if (job.title && job.company && job.link) {
                    jobs.push(job);
                }
            }

            console.log(`Extracted ${jobs.length} jobs from ${feed.name}`);
            return jobs;

        } catch (error) {
            console.error(`Error parsing RSS feed ${feed.name}:`, error);
            updateFeedStats(feed.id, 'error', 0, error.message);
            return [];
        }
    }

    // Extract job title from RSS item
    private extractJobTitle(item: Record<string, unknown>): string {
        // Try different common fields for job title
        return String(item.title ||
            item.jobTitle ||
            item['job-title'] ||
            item.summary ||
            '');
    }

    // Extract company name from RSS item
    private extractCompany(item: Record<string, unknown>): string {
        // Try different common fields for company
        return String(item.company ||
            item.creator ||
            item['dc:creator'] ||
            item.author ||
            this.extractCompanyFromTitle(String(item.title || '')) ||
            'Unknown Company');
    }

    // Extract company from job title (fallback method)
    private extractCompanyFromTitle(title: string): string {
        // Look for patterns like "Job Title at Company" or "Company - Job Title"
        const atPattern = /at\s+([^-]+?)(?:\s*[-|]|$)/i;
        const dashPattern = /^([^-]+?)\s*-\s*.+/;

        let match = title.match(atPattern);
        if (match) return match[1].trim();

        match = title.match(dashPattern);
        if (match) return match[1].trim();

        return '';
    }

    // Extract location from RSS item
    private extractLocation(item: Record<string, unknown>): string {
        return String(item.location ||
            item['job-location'] ||
            item.region ||
            this.extractLocationFromContent(String(item.contentSnippet || item.content || '')) ||
            '');
    }

    // Extract location from content (fallback method)
    private extractLocationFromContent(content: string): string {
        // Look for common location patterns
        const locationPatterns = [
            /Location:\s*([^\n,]+)/i,
            /Based in\s*([^\n,]+)/i,
            /([A-Z][a-z]+,?\s*[A-Z]{2,})/g // City, State/Country pattern
        ];

        for (const pattern of locationPatterns) {
            const match = content.match(pattern);
            if (match) return match[1].trim();
        }

        return '';
    }

    // Clean and truncate description
    private cleanDescription(description: string): string {
        // Remove HTML tags
        const cleaned = description.replace(/<[^>]*>/g, '');

        // Decode HTML entities
        const decoded = cleaned
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

        // Truncate if too long
        const maxLength = 2000;
        if (decoded.length > maxLength) {
            return decoded.substring(0, maxLength) + '...';
        }

        return decoded.trim();
    }

    // Check for duplicate jobs
    private async isDuplicate(job: ParsedJob): Promise<boolean> {
        try {
            // Check for exact URL match first
            if (job.link) {
                const urlStmt = db.prepare('SELECT id FROM jobs WHERE original_url = ?');
                const urlMatch = urlStmt.get(job.link);
                if (urlMatch) return true;
            }

            // Check for similar title + company combination
            const titleCompanyStmt = db.prepare(`
        SELECT id FROM jobs 
        WHERE LOWER(title) = LOWER(?) 
        AND LOWER(company) = LOWER(?)
        AND created_at > datetime('now', '-30 days')
      `);
            const titleCompanyMatch = titleCompanyStmt.get(job.title, job.company);

            return !!titleCompanyMatch;
        } catch (error) {
            console.error('Error checking for duplicates:', error);
            return false; // Err on the side of keeping questionable matches
        }
    }

    // Save job to database
    private async saveJob(job: ParsedJob): Promise<string | null> {
        try {
            const isDupe = await this.isDuplicate(job);
            if (isDupe) {
                console.log(`Skipping duplicate job: ${job.title} at ${job.company}`);
                return null;
            }

            const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date().toISOString();

            const stmt = db.prepare(`
        INSERT INTO jobs (
          id, title, company, description, location, original_url,
          source, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

            stmt.run(
                jobId,
                job.title,
                job.company,
                job.description,
                job.location || '',
                job.link,
                `RSS: ${job.source_feed_name}`,
                'new', // Start with 'new' status for RSS jobs
                now,
                now
            );

            console.log(`Saved job: ${job.title} at ${job.company}`);
            return jobId;
        } catch (error) {
            console.error('Error saving job:', error);
            return null;
        }
    }

    // Process all enabled RSS feeds
    async processAllFeeds(): Promise<{ totalFeeds: number; totalJobs: number; errors: string[] }> {
        console.log('Starting RSS feed processing...');

        const feeds = this.getEnabledFeeds();
        let totalJobs = 0;
        const errors: string[] = [];

        for (const feed of feeds) {
            try {
                const jobs = await this.parseFeed(feed);
                let savedCount = 0;

                for (const job of jobs) {
                    const jobId = await this.saveJob(job);
                    if (jobId) savedCount++;
                }

                updateFeedStats(feed.id, 'success', savedCount);
                totalJobs += savedCount;

                console.log(`Processed ${feed.name}: ${savedCount} new jobs saved`);

                // Add delay between feeds to be respectful
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                const errorMsg = `Error processing feed ${feed.name}: ${error.message}`;
                console.error(errorMsg);
                errors.push(errorMsg);
                updateFeedStats(feed.id, 'error', 0, error.message);
            }
        }

        console.log(`RSS processing complete. Total: ${totalJobs} jobs from ${feeds.length} feeds`);

        return {
            totalFeeds: feeds.length,
            totalJobs,
            errors
        };
    }

    // Process single feed (for manual refresh)
    async processFeed(feedId: string): Promise<{ jobs: number; error?: string }> {
        try {
            const stmt = db.prepare('SELECT * FROM rss_feeds WHERE id = ? AND enabled = 1');
            const feed = stmt.get(feedId) as RSSFeed | undefined;

            if (!feed) {
                return { jobs: 0, error: 'Feed not found or disabled' };
            }

            const jobs = await this.parseFeed(feed);
            let savedCount = 0;

            for (const job of jobs) {
                const jobId = await this.saveJob(job);
                if (jobId) savedCount++;
            }

            updateFeedStats(feed.id, 'success', savedCount);

            return { jobs: savedCount };
        } catch (error) {
            return { jobs: 0, error: error.message };
        }
    }
}

// Export singleton instance
export const rssProcessor = new RSSProcessor();