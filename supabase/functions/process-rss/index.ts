// RSS Processing Edge Function
// Implements the RSS feed processing algorithm from the project brief

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1'
import { corsHeaders } from '../_shared/cors.ts'

// Types for RSS processing
interface RSSItem {
  title: string
  link: string
  guid?: string
  pubDate: string
  description: string
}

interface ProcessedJob {
  uniqueId: string
  title: string
  company: string
  location?: string
  url: string
  description: string
  publishedDate: Date
  source: string
}

interface ProcessingResult {
  success: boolean
  jobs_found: number
  jobs_new: number
  jobs_duplicate: number
  errors: string[]
  message: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Starting RSS processing...')
    
    // Get active RSS feeds from database
    const { data: rssFeeds, error: feedsError } = await supabase
      .from('rss_feeds')
      .select('*')
      .eq('active', true)

    if (feedsError) {
      throw new Error(`Failed to fetch RSS feeds: ${feedsError.message}`)
    }

    if (!rssFeeds || rssFeeds.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No active RSS feeds found',
        data: { jobs_found: 0, jobs_new: 0, jobs_duplicate: 0, errors: [] }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    let totalJobsFound = 0
    let totalJobsNew = 0
    let totalJobsDuplicate = 0
    const allErrors: string[] = []

    // Process each RSS feed
    for (const feed of rssFeeds) {
      try {
        console.log(`Processing feed: ${feed.name} (${feed.url})`)
        
        // Fetch RSS feed with timeout and error handling
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        const response = await fetch(feed.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'JobForge-AI-RSS-Processor/1.0'
          }
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`RSS feed request failed: ${response.status} ${response.statusText}`)
        }

        const xmlText = await response.text()
        console.log(`Fetched ${xmlText.length} characters from RSS feed`)

        // Parse RSS XML
        const jobs = parseRSSFeed(xmlText, feed.name)
        totalJobsFound += jobs.length
        
        console.log(`Parsed ${jobs.length} jobs from RSS feed`)

        // Process each job for duplicate detection and insertion
        for (const job of jobs) {
          try {
            // Check for duplicate by unique_id
            const { data: existingJob, error: duplicateCheckError } = await supabase
              .from('jobs')
              .select('id')
              .eq('unique_id', job.uniqueId)
              .maybeSingle()

            if (duplicateCheckError) {
              throw new Error(`Duplicate check failed: ${duplicateCheckError.message}`)
            }

            if (existingJob) {
              console.log(`Duplicate job found: ${job.title} (${job.uniqueId})`)
              totalJobsDuplicate++
              continue
            }

            // Insert new job
            const { error: insertError } = await supabase
              .from('jobs')
              .insert({
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description,
                job_url: job.url,
                unique_id: job.uniqueId,
                published_date: job.publishedDate.toISOString(),
                source: job.source,
                status: 'new',
                emailed: false,
                date_processed: new Date().toISOString()
              })

            if (insertError) {
              throw new Error(`Job insertion failed: ${insertError.message}`)
            }

            console.log(`New job inserted: ${job.title} (${job.uniqueId})`)
            totalJobsNew++

          } catch (jobError) {
            const errorMsg = `Error processing job "${job.title}": ${jobError.message}`
            console.error(errorMsg)
            allErrors.push(errorMsg)
          }
        }

        // Update feed's last_processed timestamp
        await supabase
          .from('rss_feeds')
          .update({ 
            last_processed: new Date().toISOString(),
            processing_error: null 
          })
          .eq('id', feed.id)

      } catch (feedError) {
        const errorMsg = `Error processing feed "${feed.name}": ${feedError.message}`
        console.error(errorMsg)
        allErrors.push(errorMsg)

        // Update feed with error
        await supabase
          .from('rss_feeds')
          .update({ 
            processing_error: feedError.message,
            last_processed: new Date().toISOString()
          })
          .eq('id', feed.id)
      }
    }

    // Update processing statistics
    const today = new Date().toISOString().split('T')[0]
    const { error: statsError } = await supabase
      .from('processing_stats')
      .upsert({
        run_date: today,
        total_jobs_processed: totalJobsFound,
        jobs_approved: 0, // Will be updated by AI filtering
        jobs_filtered: 0, // Will be updated by AI filtering
        jobs_emailed: 0, // Will be updated by email delivery
        errors_count: allErrors.length
      }, {
        onConflict: 'run_date'
      })

    if (statsError) {
      console.error('Failed to update processing stats:', statsError.message)
    }

    const result: ProcessingResult = {
      success: true,
      jobs_found: totalJobsFound,
      jobs_new: totalJobsNew,
      jobs_duplicate: totalJobsDuplicate,
      errors: allErrors,
      message: `Processing complete. Found ${totalJobsFound} jobs, ${totalJobsNew} new, ${totalJobsDuplicate} duplicates.`
    }

    console.log('RSS processing complete:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('RSS processing failed:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'RSS processing failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// Parse RSS feed XML and extract job data
function parseRSSFeed(xmlText: string, feedName: string): ProcessedJob[] {
  const jobs: ProcessedJob[] = []
  
  try {
    // Basic XML parsing for RSS items
    // In a production environment, you might want to use a proper XML parser
    const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/g)
    
    if (!itemMatches) {
      console.log('No RSS items found in feed')
      return jobs
    }

    for (const itemXml of itemMatches) {
      try {
        const job = parseRSSItem(itemXml, feedName)
        if (job) {
          jobs.push(job)
        }
      } catch (itemError) {
        console.error('Error parsing RSS item:', itemError.message)
      }
    }

  } catch (parseError) {
    console.error('Error parsing RSS XML:', parseError.message)
  }

  return jobs
}

// Parse individual RSS item
function parseRSSItem(itemXml: string, feedName: string): ProcessedJob | null {
  try {
    // Extract fields using regex (basic XML parsing)
    const title = extractXMLContent(itemXml, 'title')
    const link = extractXMLContent(itemXml, 'link')
    const guid = extractXMLContent(itemXml, 'guid')
    const pubDate = extractXMLContent(itemXml, 'pubDate')
    const description = extractXMLContent(itemXml, 'description')

    if (!title || !link) {
      console.log('Skipping item: missing title or link')
      return null
    }

    // Generate unique ID using GUID or fallback to hash
    const uniqueId = guid || generateUniqueId(title, link, pubDate)

    // Extract company and location from title/description
    const company = extractCompanyFromTitle(title) || 'Unknown Company'
    const location = extractLocationFromDescription(description) || ''

    return {
      uniqueId,
      title: cleanText(title),
      company: cleanText(company),
      location: cleanText(location),
      url: link.trim(),
      description: cleanText(description),
      publishedDate: pubDate ? new Date(pubDate) : new Date(),
      source: feedName
    }

  } catch (error) {
    console.error('Error parsing RSS item:', error.message)
    return null
  }
}

// Extract content from XML tags
function extractXMLContent(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

// Clean text content (remove CDATA, HTML tags, extra whitespace)
function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Remove CDATA
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

// Generate unique ID as fallback when GUID is not available
function generateUniqueId(title: string, link: string, pubDate: string): string {
  const content = `${title}|${link}|${pubDate}`
  // Simple hash function for unique ID generation
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `hash_${Math.abs(hash).toString(36)}`
}

// Extract company name from job title
function extractCompanyFromTitle(title: string): string {
  // Look for common patterns: "Job Title at Company" or "Company - Job Title"
  const atMatch = title.match(/\s+at\s+(.+?)(?:\s*[-|]|$)/i)
  if (atMatch) {
    return atMatch[1].trim()
  }

  const dashMatch = title.match(/^(.+?)\s*[-|]\s*(.+)/)
  if (dashMatch) {
    // Assume the shorter part is the company
    const part1 = dashMatch[1].trim()
    const part2 = dashMatch[2].trim()
    return part1.length < part2.length ? part1 : part2
  }

  return 'Unknown Company'
}

// Extract location from job description
function extractLocationFromDescription(description: string): string {
  // Look for common location patterns
  const locationPatterns = [
    /Location:\s*([^,\n]+)/i,
    /Based in:\s*([^,\n]+)/i,
    /([A-Za-z\s]+,\s*[A-Z]{2,})/g, // City, State/Country pattern
  ]

  for (const pattern of locationPatterns) {
    const match = description.match(pattern)
    if (match) {
      return match[1]?.trim() || match[0]?.trim() || ''
    }
  }

  return ''
} 