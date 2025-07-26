import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Download,
  Filter,
  Clock
} from "lucide-react";
import { useState } from "react";

// Mock log data
const mockLogs = [
  { 
    id: 1, 
    timestamp: "2024-01-15 09:15:23", 
    type: "success", 
    source: "RSS Parser",
    message: "Successfully processed 45 jobs from Jobbing Feed", 
    details: "Found 12 new positions, 33 duplicates filtered"
  },
  { 
    id: 2, 
    timestamp: "2024-01-15 09:14:55", 
    type: "info", 
    source: "AI Filter",
    message: "Ollama processing completed for batch #1247", 
    details: "Processed 12 jobs in 2.3 seconds"
  },
  { 
    id: 3, 
    timestamp: "2024-01-15 09:10:01", 
    type: "info", 
    source: "Scheduler",
    message: "Started daily job hunting automation", 
    details: "Triggered by schedule: 09:00 daily"
  },
  { 
    id: 4, 
    timestamp: "2024-01-15 09:05:12", 
    type: "warning", 
    source: "RSS Parser",
    message: "Remote Work feed returned no new jobs", 
    details: "Feed accessible but no new content since last check"
  },
  { 
    id: 5, 
    timestamp: "2024-01-15 08:45:33", 
    type: "success", 
    source: "Email Service",
    message: "Email sent with 7 job recommendations", 
    details: "Delivered to user@example.com successfully"
  },
  { 
    id: 6, 
    timestamp: "2024-01-15 08:30:15", 
    type: "error", 
    source: "RSS Parser",
    message: "Failed to connect to Remote Work RSS feed", 
    details: "Timeout after 30 seconds, will retry on next cycle"
  },
  { 
    id: 7, 
    timestamp: "2024-01-15 07:22:44", 
    type: "success", 
    source: "AI Filter",
    message: "OpenAI analysis completed for 3 approved jobs", 
    details: "Generated detailed recommendations"
  },
  { 
    id: 8, 
    timestamp: "2024-01-15 07:20:12", 
    type: "info", 
    source: "Database",
    message: "Updated job status for 15 processed positions", 
    details: "Google Sheets sync completed"
  }
];

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

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

  const getLogBadgeVariant = (type: string) => {
    switch (type) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || log.type === selectedType;
    return matchesSearch && matchesType;
  });

  const logCounts = {
    all: mockLogs.length,
    success: mockLogs.filter(log => log.type === "success").length,
    error: mockLogs.filter(log => log.type === "error").length,
    warning: mockLogs.filter(log => log.type === "warning").length,
    info: mockLogs.filter(log => log.type === "info").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Activity Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor system activity and automation logs
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filter Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("all")}
              >
                All ({logCounts.all})
              </Button>
              <Button
                variant={selectedType === "success" ? "success" : "outline"}
                size="sm"
                onClick={() => setSelectedType("success")}
              >
                Success ({logCounts.success})
              </Button>
              <Button
                variant={selectedType === "error" ? "destructive" : "outline"}
                size="sm"
                onClick={() => setSelectedType("error")}
              >
                Error ({logCounts.error})
              </Button>
              <Button
                variant={selectedType === "warning" ? "warning" : "outline"}
                size="sm"
                onClick={() => setSelectedType("warning")}
              >
                Warning ({logCounts.warning})
              </Button>
              <Button
                variant={selectedType === "info" ? "info" : "outline"}
                size="sm"
                onClick={() => setSelectedType("info")}
              >
                Info ({logCounts.info})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            System Logs
          </CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {mockLogs.length} log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                {getLogIcon(log.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant={getLogBadgeVariant(log.type)} className="text-xs">
                          {log.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {log.source}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{log.message}</p>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No logs found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}