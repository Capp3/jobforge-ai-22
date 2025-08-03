import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  AlertCircle,
  Calendar,
  Users,
  BarChart3,
  Kanban,
  List,
  Layout
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData, useDashboardStats } from "@/hooks/useDashboardData";
import { useRunPipeline } from "@/hooks/useJobs";
import { StatisticsPanel, ApplicationKanbanBoard, EnhancedJobsList } from "@/components/dashboard";
import { format } from "date-fns";

export function Dashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  
  // Real data hooks
  const { data: dashboardData, isLoading, isError } = useDashboardData();
  const stats = useDashboardStats();
  const runPipeline = useRunPipeline();

  const handleManualRun = async () => {
    setIsRunning(true);
    try {
      await runPipeline.mutateAsync();
      toast({
        title: "Job Search Started",
        description: "Manual job search automation has been initiated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start job search automation.",
        variant: "destructive",
      });
    } finally {
      // Simulate processing time for better UX
      setTimeout(() => {
        setIsRunning(false);
      }, 3000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "scheduled":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success":
      case "application_submitted":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
      case "application_rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
      case "interview_scheduled":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Activity className="h-4 w-4 text-info" />;
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Job Hunting Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor your automated job search and manage configurations
            </p>
          </div>
        </div>
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <p>Failed to load dashboard data. Please check your connection and try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          disabled={isRunning || runPipeline.isPending}
          variant="gradient"
          size="lg"
        >
          {isRunning || runPipeline.isPending ? (
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

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Job Listings
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="w-4 h-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary-glow/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs Processed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {isLoading ? "..." : `+${stats.thisWeekJobs} this week`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{isLoading ? "..." : stats.approvedJobs}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "..." : `${stats.approvalRate}% approval rate`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-info/5 to-info/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{isLoading ? "..." : stats.upcomingInterviews}</div>
            <p className="text-xs text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1" />
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
            <Users className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{isLoading ? "..." : stats.pendingFollowUps}</div>
            <p className="text-xs text-muted-foreground">
              Due in next 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Interviews */}
      {dashboardData?.upcoming_interviews && dashboardData.upcoming_interviews.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Interviews
            </CardTitle>
            <CardDescription>
              Scheduled interviews for the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.upcoming_interviews.slice(0, 5).map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-info" />
                    <div>
                      <p className="font-medium">{interview.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {interview.company} • {format(new Date(interview.scheduled_date), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {interview.interview_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Follow-ups */}
      {dashboardData?.pending_follow_ups && dashboardData.pending_follow_ups.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Pending Follow-ups
            </CardTitle>
            <CardDescription>
              Actions that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.pending_follow_ups.slice(0, 5).map((followUp) => (
                <div key={followUp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-warning" />
                    <div>
                      <p className="font-medium">{followUp.action_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {followUp.company} • Due: {format(new Date(followUp.due_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Logs */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest application events and system activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center space-x-3 p-3">
                <Clock className="h-4 w-4 animate-spin" />
                <p>Loading recent activity...</p>
              </div>
            ) : dashboardData?.recent_events && dashboardData.recent_events.length > 0 ? (
              dashboardData.recent_events.slice(0, 8).map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  {getLogIcon(event.event_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.company} • {format(new Date(event.created_at), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-3 p-3">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Job Listings Tab */}
        <TabsContent value="jobs">
          <EnhancedJobsList />
        </TabsContent>

        {/* Kanban Pipeline Tab */}
        <TabsContent value="kanban">
          <ApplicationKanbanBoard />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <StatisticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}