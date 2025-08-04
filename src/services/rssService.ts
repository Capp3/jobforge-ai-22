// RSS Feed Management Service
export interface RSSFeed {
    id?: string;
    name: string;
    url: string;
    enabled: boolean;
    category?: string;
    last_fetched?: string;
    last_fetch_status?: 'success' | 'error';
    last_error?: string;
    job_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ProcessingResult {
    totalFeeds: number;
    totalJobs: number;
    errors: string[];
}

export class RSSService {
    private static BASE_URL = '/api/rss';
    private static PROCESSOR_URL = '/api/rss-processor';

    // === Feed Management ===

    static async getAllFeeds(): Promise<RSSFeed[]> {
        const response = await fetch(this.BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch RSS feeds');
        }
        return response.json();
    }

    static async getFeed(id: string): Promise<RSSFeed> {
        const response = await fetch(`${this.BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch RSS feed');
        }
        return response.json();
    }

    static async createFeed(feed: Omit<RSSFeed, 'id' | 'created_at' | 'updated_at'>): Promise<RSSFeed> {
        const response = await fetch(this.BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feed),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create RSS feed');
        }

        return response.json();
    }

    static async updateFeed(id: string, updates: Partial<RSSFeed>): Promise<RSSFeed> {
        const response = await fetch(`${this.BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update RSS feed');
        }

        return response.json();
    }

    static async deleteFeed(id: string): Promise<{ message: string }> {
        const response = await fetch(`${this.BASE_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete RSS feed');
        }

        return response.json();
    }

    // === Feed Processing ===

    static async processAllFeeds(): Promise<ProcessingResult> {
        const response = await fetch(`${this.PROCESSOR_URL}/process`, {
            method: 'POST',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to process RSS feeds');
        }

        return response.json();
    }

    static async processFeed(feedId: string): Promise<{ jobsFound: number }> {
        const response = await fetch(`${this.PROCESSOR_URL}/process/${feedId}`, {
            method: 'POST',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to process RSS feed');
        }

        return response.json();
    }

    static async getProcessorStatus(): Promise<{ status: string; message: string }> {
        const response = await fetch(`${this.PROCESSOR_URL}/status`);
        if (!response.ok) {
            throw new Error('Failed to get processor status');
        }
        return response.json();
    }

    // === Utility Methods ===

    static getDefaultFeeds(): Omit<RSSFeed, 'id' | 'created_at' | 'updated_at'>[] {
        return [
            {
                name: 'Remote Tech Jobs',
                url: 'https://rss.app/feeds/example-tech.xml',
                enabled: true,
                category: 'Technology'
            },
            {
                name: 'General Job Board',
                url: 'https://rss.app/feeds/example-general.xml',
                enabled: true,
                category: 'General'
            }
        ];
    }

    static validateFeedUrl(url: string): boolean {
        try {
            new URL(url);
            return url.includes('rss') || url.includes('feed') || url.includes('xml');
        } catch {
            return false;
        }
    }

    static getFeedCategories(): string[] {
        return [
            'Technology',
            'Remote',
            'Engineering',
            'Design',
            'Marketing',
            'Sales',
            'General'
        ];
    }
}