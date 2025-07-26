import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Search, 
  Bot, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Zap,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with real data from your backend
const mockStats = {
  totalJobs: 1247,
  approvedJobs: 89,
  filteredJobs: 1158,
  emailsSent: 23,
  lastRun: "2024-01-15 09:00:00",
  rssFeeds: [
    { name: "Jobbing Feed", status: "active", lastChecked: "2 hours ago", jobCount: 45 },
    { name: "Tech Jobs", status: "active", lastChecked: "1 hour ago", jobCount: 23 },
    { name: "Remote Work", status: "error", lastChecked: "5 hours ago", jobCount: 0 },
    { name: "Local Jobs", status: "active", lastChecked: "30 min ago", jobCount: 12 }
  ]
};

const mockLogs = [
  { id: 1, time: "09:15", type: "success", message: "Successfully processed 45 jobs from Jobbing Feed" },
  { id: 2, time: "09:10", type: "info", message: "Started daily job hunting automation" },
  { id: 3, time: "09:05", type: "warning", message: "Remote Work feed returned no new jobs" },
  { id: 4, time: "08:45", type: "success", message: "Email sent with 7 job recommendations" },
  { id: 5, time: "08:30", type: "error", message: "Failed to connect to Remote Work RSS feed" }
];

export function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const handleManualRun = async () => {
    setIsRunning(true);
    toast({
      title: "Job Search Started",
      description: "Manual job search automation has been initiated.",
    });

    // Simulate processing time
    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: "Search Complete",
        description: "Found 12 new job opportunities. Check your email!",
      });
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Activity className="h-4 w-4 text-info" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Job Hunting Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your automated job search and manage configurations
          </p>
        </div>
        <Button 
          onClick={handleManualRun}
          disabled={isRunning}
          variant="gradient"
          size="lg"
        >
          {isRunning ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Manual Search
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary-glow/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs Processed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{mockStats.approvedJobs}</div>
            <p className="text-xs text-muted-foreground">
              {((mockStats.approvedJobs / mockStats.totalJobs) * 100).toFixed(1)}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-info/5 to-info/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Processing</CardTitle>
            <Bot className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{mockStats.filteredJobs}</div>
            <p className="text-xs text-muted-foreground">
              <Zap className="inline h-3 w-3 mr-1" />
              Avg 2.3s per job
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{mockStats.emailsSent}</div>
            <p className="text-xs text-muted-foreground">
              Last sent: {mockStats.lastRun}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RSS Feed Status */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            RSS Feed Status
          </CardTitle>
          <CardDescription>
            Monitor the status of your configured RSS feeds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockStats.rssFeeds.map((feed, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(feed.status)}
                  <div>
                    <p className="font-medium">{feed.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Last checked: {feed.lastChecked}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={feed.status === "active" ? "default" : "destructive"}>
                    {feed.jobCount} jobs
                  </Badge>
                  <Badge variant="outline">
                    {feed.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Logs */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest automation logs and system activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                {getLogIcon(log.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{log.message}</p>
                  <p className="text-xs text-muted-foreground">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}