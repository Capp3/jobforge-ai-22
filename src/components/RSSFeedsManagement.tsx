// RSS Feeds Management Component
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Rss,
    Plus,
    Trash2,
    RefreshCw,
    Globe,
    AlertCircle,
    CheckCircle,
    Loader2,
    ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RSSService, type RSSFeed } from '@/services/rssService';

interface RSSFeedsManagementProps {
    feeds: RSSFeed[];
    onAddFeed: (name: string, url: string, category?: string) => Promise<void>;
    onUpdateFeed: (id: string, updates: Partial<RSSFeed>) => Promise<void>;
    onDeleteFeed: (id: string) => Promise<void>;
    onProcessAllFeeds: () => Promise<void>;
    onProcessFeed: (feedId: string) => Promise<void>;
    isProcessing: boolean;
}

export function RSSFeedsManagement({
    feeds,
    onAddFeed,
    onUpdateFeed,
    onDeleteFeed,
    onProcessAllFeeds,
    onProcessFeed,
    isProcessing
}: RSSFeedsManagementProps) {
    const { toast } = useToast();
    const [newFeedName, setNewFeedName] = useState('');
    const [newFeedUrl, setNewFeedUrl] = useState('');
    const [newFeedCategory, setNewFeedCategory] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddFeed = async () => {
        if (!newFeedName.trim() || !newFeedUrl.trim()) {
            toast({
                title: 'Error',
                description: 'Name and URL are required',
                variant: 'destructive',
            });
            return;
        }

        if (!RSSService.validateFeedUrl(newFeedUrl)) {
            toast({
                title: 'Error',
                description: 'Please enter a valid RSS feed URL',
                variant: 'destructive',
            });
            return;
        }

        setIsAdding(true);
        try {
            await onAddFeed(newFeedName, newFeedUrl, newFeedCategory || undefined);
            setNewFeedName('');
            setNewFeedUrl('');
            setNewFeedCategory('');
        } catch (error) {
            console.error('Error adding feed:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const getStatusIcon = (feed: RSSFeed) => {
        if (!feed.last_fetched) {
            return <Globe className="w-4 h-4 text-gray-400" />;
        }

        if (feed.last_fetch_status === 'success') {
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        } else {
            return <AlertCircle className="w-4 h-4 text-red-500" />;
        }
    };

    const formatLastFetched = (dateString?: string) => {
        if (!dateString) return 'Never';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            return 'Recently';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Rss className="mr-2 h-5 w-5" />
                        RSS Feed Management
                    </CardTitle>
                    <CardDescription>
                        Manage RSS feeds for automated job discovery. Feeds are processed automatically and jobs go through the normal LLM analysis pipeline.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-muted-foreground">
                                Total Feeds: <span className="font-medium">{feeds.length}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Active: <span className="font-medium">{feeds.filter(f => f.enabled).length}</span>
                            </div>
                        </div>
                        <Button
                            onClick={onProcessAllFeeds}
                            disabled={isProcessing || feeds.filter(f => f.enabled).length === 0}
                            variant="outline"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Process All Feeds
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Add New Feed */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Plus className="mr-2 h-5 w-5" />
                        Add RSS Feed
                    </CardTitle>
                    <CardDescription>
                        Add a new RSS feed for job discovery. Supports standard RSS/XML formats.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="feed-name">Feed Name</Label>
                            <Input
                                id="feed-name"
                                value={newFeedName}
                                onChange={(e) => setNewFeedName(e.target.value)}
                                placeholder="e.g., Remote Tech Jobs"
                            />
                        </div>
                        <div>
                            <Label htmlFor="feed-category">Category (Optional)</Label>
                            <Select value={newFeedCategory} onValueChange={setNewFeedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RSSService.getFeedCategories().map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="feed-url">RSS Feed URL</Label>
                        <Input
                            id="feed-url"
                            value={newFeedUrl}
                            onChange={(e) => setNewFeedUrl(e.target.value)}
                            placeholder="https://rss.app/feeds/example.xml"
                            type="url"
                        />
                    </div>

                    <Button onClick={handleAddFeed} disabled={isAdding}>
                        {isAdding ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        Add Feed
                    </Button>
                </CardContent>
            </Card>

            {/* Feed List */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Feeds</CardTitle>
                    <CardDescription>
                        Manage your RSS feeds. Toggle feeds on/off or process individual feeds manually.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {feeds.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Rss className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No RSS feeds configured yet.</p>
                            <p className="text-sm">Add your first feed above to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {feeds.map((feed) => (
                                <div
                                    key={feed.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        {getStatusIcon(feed)}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium">{feed.name}</h4>
                                                {feed.category && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {feed.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                                <span className="flex items-center">
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    {feed.url.length > 50 ? `${feed.url.substring(0, 50)}...` : feed.url}
                                                </span>
                                                <span>Last: {formatLastFetched(feed.last_fetched)}</span>
                                                {feed.job_count !== undefined && (
                                                    <span>Jobs: {feed.job_count}</span>
                                                )}
                                            </div>
                                            {feed.last_error && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    Error: {feed.last_error}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={feed.enabled}
                                            onCheckedChange={(enabled) =>
                                                feed.id && onUpdateFeed(feed.id, { enabled })
                                            }
                                        />

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => feed.id && onProcessFeed(feed.id)}
                                            disabled={!feed.enabled}
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => feed.id && onDeleteFeed(feed.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}