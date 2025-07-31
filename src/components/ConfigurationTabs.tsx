import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Rss, 
  Bot, 
  FileText, 
  User, 
  MessageSquare, 
  Plus, 
  Trash2,
  MapPin,
  Briefcase,
  Wifi,
  DollarSign,
  Save,
  Database,
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TestTube2,
  Loader2,
  Check,
  X
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { LLMConfigurationSection } from "@/components/LLMConfigurationSection";
import type { LLMConfiguration } from "@/services/llmIntegrationService";

export function ConfigurationTabs() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basics");

  // Mock configuration state
  const [config, setConfig] = useState({
    basics: {
      locations: ["Belfast", "Northern Ireland", "UK", "Remote"],
      jobTitles: ["Broadcast Engineer", "Video Engineer", "Systems Engineer"],
      remotePreference: "hybrid",
      salaryRange: { min: 40000, max: 80000 },
      currency: "GBP",
      frequency: "daily",
      allowNoSalary: false,
      smtp: {
        host: "",
        port: 587,
        secure: false,
        username: "",
        password: "",
        from: ""
      }
    },
    rssFeeds: [
      { id: 1, url: "https://rss.app/feeds/_dut10XITtqVqfwp1.xml", name: "Jobbing Feed", enabled: true },
      { id: 2, url: "https://example.com/jobs/feed.xml", name: "Tech Jobs", enabled: true }
    ],
    aiAgents: {
      llm1: { 
        provider: "ollama", 
        name: "Primary LLM",
        enabled: true,
        configs: {
          ollama: { endpoint: "http://192.168.1.17:11434", model: "llama3.1:8b" },
          openai: { apiKey: "", model: "gpt-4" },
          anthropic: { apiKey: "", model: "claude-3-sonnet-20240229" },
          gemini: { apiKey: "", model: "gemini-pro" },
          grok: { apiKey: "", model: "grok-beta" }
        }
      },
      llm2: { 
        provider: "openai", 
        name: "Secondary LLM",
        enabled: false,
        configs: {
          ollama: { endpoint: "http://192.168.1.17:11434", model: "llama3.1:8b" },
          openai: { apiKey: "", model: "gpt-4" },
          anthropic: { apiKey: "", model: "claude-3-sonnet-20240229" },
          gemini: { apiKey: "", model: "gemini-pro" },
          grok: { apiKey: "", model: "grok-beta" }
        }
      }
    } as LLMConfiguration,
    cv: `# John Doe - Broadcast Engineer

## Experience
- 10+ years in broadcast engineering
- Systems integration specialist
- Project management experience

## Skills
- Video/Audio systems
- IP networking
- Live production
- System design`,
    biography: `Experienced broadcast engineer with a passion for cutting-edge technology and systems integration. Specialized in live production environments and large-scale media infrastructure.`,
    prompt1: `You are a job filtering assistant. Review this job listing against the candidate's profile.

CANDIDATE PROFILE:
{{biography}}

JOB LISTING:
Title: {{job_title}}
Company: {{company}}
Location: {{location}}
Description: {{job_description}}

Rate as: REJECT, MAYBE, or APPROVE`,
    prompt2: `Provide detailed analysis of this job opportunity:

JOB DETAILS:
{{job_title}} at {{company}}
Location: {{location}}
Description: {{job_description}}

Analyze:
1. Technical challenges
2. Career growth potential
3. Company assessment
4. Application strategy`,
    jobs: [
      {
        id: "job-1",
        title: "Senior Broadcast Engineer",
        company: "BBC",
        location: "Belfast, UK",
        status: "approved",
        processedDate: "2024-01-15",
        aiRating: "APPROVE",
        url: "https://example.com/job/1",
        source: "RSS Feed 1"
      },
      {
        id: "job-2", 
        title: "Video Systems Engineer",
        company: "ITV",
        location: "London, UK",
        status: "filtered",
        processedDate: "2024-01-14",
        aiRating: "REJECT",
        url: "https://example.com/job/2",
        source: "RSS Feed 1"
      },
      {
        id: "job-3",
        title: "Technical Project Manager",
        company: "Sky",
        location: "Remote, UK",
        status: "pending",
        processedDate: "2024-01-16",
        aiRating: "MAYBE",
        url: "https://example.com/job/3",
        source: "RSS Feed 2"
      }
    ]
  });

  const handleSave = () => {
    toast({
      title: "Configuration Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const addRSSFeed = () => {
    const newFeed = {
      id: Date.now(),
      url: "",
      name: "New Feed",
      enabled: true
    };
    setConfig(prev => ({
      ...prev,
      rssFeeds: [...prev.rssFeeds, newFeed]
    }));
  };

  const removeRSSFeed = (id: number) => {
    setConfig(prev => ({
      ...prev,
      rssFeeds: prev.rssFeeds.filter(feed => feed.id !== id)
    }));
  };



  const getAvailableVariables = () => {
    return [
      "{{biography}}", "{{job_title}}", "{{company}}", "{{location}}", 
      "{{job_description}}", "{{salary_range}}", "{{remote_preference}}", 
      "{{target_locations}}", "{{target_job_titles}}", "{{min_salary}}", 
      "{{max_salary}}", "{{currency}}", "{{requirements}}", "{{source}}"
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your job hunting automation settings
          </p>
        </div>
        <Button onClick={handleSave} variant="gradient">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="basics" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Basics</span>
          </TabsTrigger>
          <TabsTrigger value="feeds" className="flex items-center space-x-2">
            <Rss className="h-4 w-4" />
            <span className="hidden sm:inline">RSS</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="cv" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">CV</span>
          </TabsTrigger>
          <TabsTrigger value="bio" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Bio</span>
          </TabsTrigger>
          <TabsTrigger value="prompt1" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">P1</span>
          </TabsTrigger>
          <TabsTrigger value="prompt2" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">P2</span>
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Jobs</span>
          </TabsTrigger>
        </TabsList>

        {/* Basics Tab */}
        <TabsContent value="basics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Location Settings
                </CardTitle>
                <CardDescription>
                  Configure your preferred work locations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="locations">Acceptable Locations</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.basics.locations.map((location, index) => (
                      <Badge key={index} variant="secondary">
                        {location}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    id="locations"
                    placeholder="Add new location..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="remote">Remote Work Preference</Label>
                  <Select value={config.basics.remotePreference}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote Only</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Job Preferences
                </CardTitle>
                <CardDescription>
                  Define your target job titles and roles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jobTitles">Target Job Titles</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.basics.jobTitles.map((title, index) => (
                      <Badge key={index} variant="outline">
                        {title}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    id="jobTitles"
                    placeholder="Add job title..."
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minSalary">Min Salary (£)</Label>
                    <Input
                      id="minSalary"
                      type="number"
                      value={config.basics.salaryRange.min}
                      placeholder="40000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxSalary">Max Salary (£)</Label>
                    <Input
                      id="maxSalary"
                      type="number"
                      value={config.basics.salaryRange.max}
                      placeholder="80000"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="allowNoSalary"
                    checked={config.basics.allowNoSalary}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      basics: { ...prev.basics, allowNoSalary: !!checked }
                    }))}
                  />
                  <Label htmlFor="allowNoSalary">Include jobs with no salary listed</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Automation Settings
                </CardTitle>
                <CardDescription>
                  Configure frequency and email settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="frequency">Check Frequency</Label>
                  <Select 
                    value={config.basics.frequency}
                    onValueChange={(value) => setConfig(prev => ({
                      ...prev,
                      basics: { ...prev.basics, frequency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice-daily">Twice Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  SMTP Configuration
                </CardTitle>
                <CardDescription>
                  Configure email server settings for sending job alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input
                      id="smtp-host"
                      value={config.basics.smtp.host}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        basics: {
                          ...prev.basics,
                          smtp: { ...prev.basics.smtp, host: e.target.value }
                        }
                      }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">Port</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      value={config.basics.smtp.port}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        basics: {
                          ...prev.basics,
                          smtp: { ...prev.basics.smtp, port: parseInt(e.target.value) || 587 }
                        }
                      }))}
                      placeholder="587"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="smtp-tls"
                    checked={config.basics.smtp.secure}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      basics: {
                        ...prev.basics,
                        smtp: { ...prev.basics.smtp, secure: checked }
                      }
                    }))}
                  />
                  <Label htmlFor="smtp-tls">Use TLS/SSL</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-username">Username</Label>
                    <Input
                      id="smtp-username"
                      value={config.basics.smtp.username}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        basics: {
                          ...prev.basics,
                          smtp: { ...prev.basics.smtp, username: e.target.value }
                        }
                      }))}
                      placeholder="your-email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-password">Password</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      value={config.basics.smtp.password}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        basics: {
                          ...prev.basics,
                          smtp: { ...prev.basics.smtp, password: e.target.value }
                        }
                      }))}
                      placeholder="App password or email password"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="smtp-from">From Email</Label>
                  <Input
                    id="smtp-from"
                    value={config.basics.smtp.from}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      basics: {
                        ...prev.basics,
                        smtp: { ...prev.basics.smtp, from: e.target.value }
                      }
                    }))}
                    placeholder="Job Hunter <jobs@example.com>"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RSS Feeds Tab */}
        <TabsContent value="feeds" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Rss className="mr-2 h-5 w-5" />
                    RSS Feed Configuration
                  </CardTitle>
                  <CardDescription>
                    Manage your job board RSS feeds
                  </CardDescription>
                </div>
                <Button onClick={addRSSFeed} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feed
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.rssFeeds.map((feed) => (
                <div key={feed.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Switch checked={feed.enabled} />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={feed.name}
                      placeholder="Feed name"
                      className="font-medium"
                    />
                    <Input
                      value={feed.url}
                      placeholder="RSS feed URL"
                      className="text-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRSSFeed(feed.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Agents Tab */}
        <TabsContent value="ai" className="space-y-6">
          <LLMConfigurationSection 
            config={config.aiAgents}
            onChange={(newConfig) => setConfig(prev => ({
              ...prev,
              aiAgents: newConfig
            }))}
          />
        </TabsContent>

        {/* CV Tab */}
        <TabsContent value="cv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Curriculum Vitae
              </CardTitle>
              <CardDescription>
                Your CV in Markdown format for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={config.cv}
                onChange={(e) => setConfig(prev => ({ ...prev, cv: e.target.value }))}
                placeholder="Enter your CV in Markdown format..."
                className="min-h-[400px] font-mono"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biography Tab */}
        <TabsContent value="bio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Professional Biography
              </CardTitle>
              <CardDescription>
                Brief professional summary for job matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={config.biography}
                onChange={(e) => setConfig(prev => ({ ...prev, biography: e.target.value }))}
                placeholder="Enter your professional biography..."
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompt 1 Tab */}
        <TabsContent value="prompt1" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Initial Filtering Prompt
              </CardTitle>
              <CardDescription>
                AI prompt for initial job filtering (Ollama)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableVariables().map((variable, index) => (
                      <Badge key={index} variant="outline">{variable}</Badge>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={config.prompt1}
                  onChange={(e) => setConfig(prev => ({ ...prev, prompt1: e.target.value }))}
                  placeholder="Enter your initial filtering prompt..."
                  className="min-h-[300px] font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompt 2 Tab */}
        <TabsContent value="prompt2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Detailed Analysis Prompt
              </CardTitle>
              <CardDescription>
                AI prompt for detailed job analysis (Advanced AI)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableVariables().map((variable, index) => (
                      <Badge key={index} variant="outline">{variable}</Badge>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={config.prompt2}
                  onChange={(e) => setConfig(prev => ({ ...prev, prompt2: e.target.value }))}
                  placeholder="Enter your detailed analysis prompt..."
                  className="min-h-[300px] font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Database Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Processed Jobs Database
              </CardTitle>
              <CardDescription>
                View all processed job listings and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AI Rating</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <Badge variant={
                          job.status === 'approved' ? 'default' :
                          job.status === 'filtered' ? 'destructive' :
                          'secondary'
                        }>
                          {job.status === 'approved' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {job.status === 'filtered' && <XCircle className="mr-1 h-3 w-3" />}
                          {job.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {job.aiRating}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {job.processedDate}
                      </TableCell>
                      <TableCell>{job.source}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <a 
                            href={job.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View Job
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}