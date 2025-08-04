// RSS Processing API Routes
import { Router } from 'express';
import { rssProcessor } from '../services/rssProcessor.js';

const router = Router();

// Process all RSS feeds manually
router.post('/process', async (req, res) => {
    try {
        console.log('Manual RSS processing triggered');
        const result = await rssProcessor.processAllFeeds();

        res.json({
            message: 'RSS processing completed',
            ...result
        });
    } catch (error) {
        console.error('Error in manual RSS processing:', error);
        res.status(500).json({
            error: 'RSS processing failed',
            message: error.message
        });
    }
});

// Process single RSS feed
router.post('/process/:feedId', async (req, res) => {
    try {
        const { feedId } = req.params;
        console.log(`Manual processing of RSS feed: ${feedId}`);

        const result = await rssProcessor.processFeed(feedId);

        if (result.error) {
            return res.status(400).json({
                error: 'Feed processing failed',
                message: result.error
            });
        }

        res.json({
            message: 'Feed processed successfully',
            jobsFound: result.jobs
        });
    } catch (error) {
        console.error('Error processing single RSS feed:', error);
        res.status(500).json({
            error: 'Feed processing failed',
            message: error.message
        });
    }
});

// Get RSS processing status
router.get('/status', (req, res) => {
    // This could be enhanced with processing status tracking
    res.json({
        status: 'ready',
        message: 'RSS processor is ready'
    });
});

export default router;