// JobForge Main Application Component
// Integrates all components for the complete job filtering algorithm experience

import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Activity,
  List,
  BarChart3,
  HelpCircle,
} from 'lucide-react'

// Component imports
import { AlgorithmDashboard } from '@/components/dashboard'
import { JobsList } from '@/components/jobs'
import { PreferencesForm } from '@/components/preferences'

// Hooks
import { useJobStatusCounts } from '@/hooks/useJobs'

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

interface JobForgeAppProps {
  className?: string
}

function JobForgeAppContent({ className }: JobForgeAppProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  // Get job status counts for badges
  const { data: statusCounts } = useJobStatusCounts()

  const newJobsCount = statusCounts?.new || 0
  const needsReviewCount = statusCounts?.needs_review || 0

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JF</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">JobForge AI</h1>
                  <p className="text-xs text-muted-foreground">Intelligent Job Filtering</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification badges */}
              {newJobsCount > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {newJobsCount} New
                </Badge>
              )}
              {needsReviewCount > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  {needsReviewCount} Review
                </Badge>
              )}

              {/* Preferences Dialog */}
              <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Job Filtering Preferences</DialogTitle>
                  </DialogHeader>
                  <PreferencesForm
                    onSave={() => {
                      setIsPreferencesOpen(false)
                    }}
                  />
                </DialogContent>
              </Dialog>

              {/* Help Button */}
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Jobs
              {(newJobsCount + needsReviewCount) > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {newJobsCount + needsReviewCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <AlgorithmDashboard
              onOpenPreferences={() => setIsPreferencesOpen(true)}
            />
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Job Listings</h2>
                <p className="text-muted-foreground">
                  View and manage your filtered job opportunities
                </p>
              </div>
              <JobsList />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Analytics & Insights</h2>
                <p className="text-muted-foreground">
                  Detailed analysis of your job filtering algorithm performance
                </p>
              </div>
              
              {/* Placeholder for future analytics components */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Job Trends</h3>
                  <p className="text-gray-500 text-sm">
                    Analyze job market trends and filtering patterns over time
                  </p>
                  <Badge variant="outline" className="mt-4">Coming Soon</Badge>
                </div>
                
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Performance</h3>
                  <p className="text-gray-500 text-sm">
                    Monitor AI filtering accuracy and recommendation quality
                  </p>
                  <Badge variant="outline" className="mt-4">Coming Soon</Badge>
                </div>
                
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Optimization</h3>
                  <p className="text-gray-500 text-sm">
                    Suggestions for improving your filtering preferences
                  </p>
                  <Badge variant="outline" className="mt-4">Coming Soon</Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

export function JobForgeApp(props: JobForgeAppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <JobForgeAppContent {...props} />
    </QueryClientProvider>
  )
} 