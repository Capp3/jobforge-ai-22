// Integrated Configuration Component
// Merges PreferencesForm with ConfigurationTabs for unified settings management

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Settings, 
  User, 
  Mail, 
  Bot, 
  MapPin,
  Briefcase,
  DollarSign,
  Save,
  TestTube2,
  Loader2,
  Check,
  X,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LLMConfigurationSection } from "@/components/LLMConfigurationSection";
import { PreferencesService } from '@/services/preferencesService';
import { SettingsService, type SMTPConfig, type NotificationPreferences, type AIPrompts } from '@/services/settingsService';
import type { UserPreferences, PreferencesCreate } from '@/types/algorithm';
import type { LLMConfiguration } from '@/services/llmIntegrationService';

// Form schemas
const jobPreferencesSchema = z.object({
  preferred_locations: z.array(z.string()).min(1, 'At least one location is required'),
  work_mode: z.array(z.string()).min(1, 'At least one work mode is required'),
  travel_willingness: z.enum(['limited', 'moderate', 'extensive']),
  salary_range: z.string().min(1, 'Salary range is required'),
  career_level: z.array(z.string()).min(1, 'At least one career level is required'),
  tech_stack: z.array(z.string()).min(1, 'At least one technology is required'),
  company_size: z.array(z.string()).min(1, 'At least one company size is required'),
});

const profileSchema = z.object({
  cv_content: z.string().min(50, 'CV content should be at least 50 characters'),
  bio: z.string().min(20, 'Bio should be at least 20 characters'),
});

const promptsSchema = z.object({
  prompt1: z.string().min(10, 'Initial filtering prompt is required'),
  prompt2: z.string().min(10, 'Detailed analysis prompt is required'),
});

const smtpSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().min(1).max(65535),
  secure: z.boolean(),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  from: z.string().email('Valid email address required'),
});

const notificationSchema = z.object({
  email_enabled: z.boolean(),
  email_frequency: z.enum(['immediate', 'daily', 'weekly']),
  email_types: z.array(z.string()),
  digest_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
});

type JobPreferencesData = z.infer<typeof jobPreferencesSchema>;
type ProfileData = z.infer<typeof profileSchema>;
type PromptsData = z.infer<typeof promptsSchema>;
type SMTPData = z.infer<typeof smtpSchema>;
type NotificationData = z.infer<typeof notificationSchema>;

export function IntegratedConfiguration() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("job-preferences");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testingSMTP, setTestingSMTP] = useState(false);

  // Current data states
  const [currentPreferences, setCurrentPreferences] = useState<UserPreferences | null>(null);
  const [currentSMTP, setCurrentSMTP] = useState<SMTPConfig | null>(null);
  const [currentNotifications, setCurrentNotifications] = useState<NotificationPreferences | null>(null);
  const [currentPrompts, setCurrentPrompts] = useState<PromptsData | null>(null);
  const [llmConfig, setLlmConfig] = useState<LLMConfiguration>({
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
  });

  // Forms
  const jobPreferencesForm = useForm<JobPreferencesData>({
    resolver: zodResolver(jobPreferencesSchema),
    defaultValues: {
      preferred_locations: [],
      work_mode: [],
      travel_willingness: 'moderate',
      salary_range: '',
      career_level: [],
      tech_stack: [],
      company_size: [],
    },
  });

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      cv_content: '',
      bio: '',
    },
  });

  const promptsForm = useForm<PromptsData>({
    resolver: zodResolver(promptsSchema),
    defaultValues: {
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
    },
  });

  const smtpForm = useForm<SMTPData>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      from: '',
    },
  });

  const notificationForm = useForm<NotificationData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_enabled: true,
      email_frequency: 'daily',
      email_types: ['new_jobs', 'status_changes'],
      digest_time: '09:00',
    },
  });

  // Field arrays for dynamic fields
  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray({
    control: jobPreferencesForm.control,
    name: 'preferred_locations',
  });

  const { fields: workModeFields, append: appendWorkMode, remove: removeWorkMode } = useFieldArray({
    control: jobPreferencesForm.control,
    name: 'work_mode',
  });

  const { fields: careerLevelFields, append: appendCareerLevel, remove: removeCareerLevel } = useFieldArray({
    control: jobPreferencesForm.control,
    name: 'career_level',
  });

  const { fields: techStackFields, append: appendTech, remove: removeTech } = useFieldArray({
    control: jobPreferencesForm.control,
    name: 'tech_stack',
  });

  const { fields: companySizeFields, append: appendCompanySize, remove: removeCompanySize } = useFieldArray({
    control: jobPreferencesForm.control,
    name: 'company_size',
  });

  // Load all configuration data
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        // Load job preferences
        const preferences = await PreferencesService.getUserPreferences();
        if (preferences) {
          setCurrentPreferences(preferences);
          jobPreferencesForm.reset({
            preferred_locations: preferences.preferred_locations,
            work_mode: preferences.work_mode,
            travel_willingness: preferences.travel_willingness as 'limited' | 'moderate' | 'extensive',
            salary_range: preferences.salary_range,
            career_level: preferences.career_level,
            tech_stack: preferences.tech_stack,
            company_size: preferences.company_size,
          });
        }

        // Load profile data (from preferences CV field)
        if (preferences?.cv_content || preferences?.bio) {
          profileForm.reset({
            cv_content: preferences.cv_content || '',
            bio: preferences.bio || '',
          });
        }

        // Load SMTP config
        try {
          const smtpConfig = await SettingsService.getSMTPConfig();
          setCurrentSMTP(smtpConfig);
          smtpForm.reset({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            username: smtpConfig.username,
            password: '', // Don't populate password for security
            from: smtpConfig.from,
          });
        } catch (error) {
          console.log('No SMTP config found, using defaults');
        }

        // Load notification preferences
        try {
          const notificationPrefs = await SettingsService.getNotificationPreferences();
          setCurrentNotifications(notificationPrefs);
          notificationForm.reset({
            email_enabled: notificationPrefs.email_enabled,
            email_frequency: notificationPrefs.email_frequency,
            email_types: notificationPrefs.email_types,
            digest_time: notificationPrefs.digest_time,
          });
        } catch (error) {
          console.log('No notification preferences found, using defaults');
        }

        // Load AI prompts
        try {
          const prompts = await SettingsService.getAIPrompts();
          setCurrentPrompts(prompts);
          promptsForm.reset({
            prompt1: prompts.prompt1,
            prompt2: prompts.prompt2,
          });
        } catch (error) {
          console.log('No AI prompts found, using defaults');
        }

      } catch (error) {
        console.error('Failed to load configuration data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load configuration data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Save job preferences
  const saveJobPreferences = async (data: JobPreferencesData) => {
    setIsSaving(true);
    try {
      let savedPreferences: UserPreferences;
      
      if (currentPreferences) {
        savedPreferences = await PreferencesService.updateUserPreferences(
          currentPreferences.id,
          data as any
        );
      } else {
        savedPreferences = await PreferencesService.createUserPreferences(data as PreferencesCreate);
      }

      setCurrentPreferences(savedPreferences);
      toast({
        title: 'Success',
        description: 'Job preferences saved successfully',
      });
    } catch (error) {
      console.error('Failed to save job preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save job preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save profile data
  const saveProfile = async (data: ProfileData) => {
    setIsSaving(true);
    try {
      const profileData = {
        cv_content: data.cv_content,
        bio: data.bio,
      };

      let savedPreferences: UserPreferences;
      
      if (currentPreferences) {
        savedPreferences = await PreferencesService.updateUserPreferences(
          currentPreferences.id,
          profileData as any
        );
      } else {
        // If no preferences exist, create with minimal required data
        const minimalPrefs = {
          ...profileData,
          preferred_locations: ['Remote'],
          work_mode: ['remote'],
          travel_willingness: 'limited' as const,
          salary_range: 'Competitive',
          career_level: ['mid'],
          tech_stack: ['JavaScript'],
          company_size: ['startup'],
        };
        savedPreferences = await PreferencesService.createUserPreferences(minimalPrefs);
      }

      setCurrentPreferences(savedPreferences);
      toast({
        title: 'Success',
        description: 'Profile saved successfully',
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save SMTP configuration
  const saveSMTP = async (data: SMTPData) => {
    setIsSaving(true);
    try {
      await SettingsService.saveSMTPConfig(data);
      setCurrentSMTP(data);
      toast({
        title: 'Success',
        description: 'SMTP configuration saved successfully',
      });
    } catch (error) {
      console.error('Failed to save SMTP config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save SMTP configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Test SMTP connection
  const testSMTP = async () => {
    const data = smtpForm.getValues();
    setTestingSMTP(true);
    try {
      const result = await SettingsService.testSMTPConnection(data);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test SMTP connection',
        variant: 'destructive',
      });
    } finally {
      setTestingSMTP(false);
    }
  };

  // Save notification preferences
  const saveNotifications = async (data: NotificationData) => {
    setIsSaving(true);
    try {
      await SettingsService.saveNotificationPreferences(data);
      setCurrentNotifications(data);
      toast({
        title: 'Success',
        description: 'Notification preferences saved successfully',
      });
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save AI prompts
  const savePrompts = async (data: PromptsData) => {
    setIsSaving(true);
    try {
      await SettingsService.saveAIPrompts(data);
      setCurrentPrompts(data);
      toast({
        title: 'Success',
        description: 'AI prompts saved successfully',
      });
    } catch (error) {
      console.error('Failed to save AI prompts:', error);
      toast({
        title: 'Error',
        description: 'Failed to save AI prompts',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">
          Manage your job search preferences, profile, and system settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="job-preferences" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Preferences
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="ai-prompts" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            AI Prompts
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="ai-agents" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Agents
          </TabsTrigger>
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Email Setup
          </TabsTrigger>
        </TabsList>

        {/* Job Preferences Tab */}
        <TabsContent value="job-preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Job Search Preferences
              </CardTitle>
              <CardDescription>
                Configure your job search criteria and filtering preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...jobPreferencesForm}>
                <form onSubmit={jobPreferencesForm.handleSubmit(saveJobPreferences)} className="space-y-6">
                  {/* Preferred Locations */}
                  <FormField
                    control={jobPreferencesForm.control}
                    name="preferred_locations"
                    render={() => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Preferred Locations
                        </FormLabel>
                        <FormDescription>
                          Add locations where you'd like to work
                        </FormDescription>
                        <div className="space-y-2">
                          {locationFields.map((field, index) => (
                            <div key={field.id} className="flex items-center space-x-2">
                              <Input
                                {...jobPreferencesForm.register(`preferred_locations.${index}`)}
                                placeholder="e.g., Belfast, Remote, London"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeLocation(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendLocation('')}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Location
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Work Mode */}
                  <FormField
                    control={jobPreferencesForm.control}
                    name="work_mode"
                    render={() => (
                      <FormItem>
                        <FormLabel>Work Mode Preferences</FormLabel>
                        <FormDescription>
                          Select your preferred working arrangements
                        </FormDescription>
                        <div className="space-y-2">
                          {workModeFields.map((field, index) => (
                            <div key={field.id} className="flex items-center space-x-2">
                              <Select
                                value={jobPreferencesForm.watch(`work_mode.${index}`)}
                                onValueChange={(value) => 
                                  jobPreferencesForm.setValue(`work_mode.${index}`, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select work mode" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="remote">Remote</SelectItem>
                                  <SelectItem value="hybrid">Hybrid</SelectItem>
                                  <SelectItem value="onsite">On-site</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeWorkMode(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendWorkMode('remote')}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Work Mode
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Travel Willingness */}
                  <FormField
                    control={jobPreferencesForm.control}
                    name="travel_willingness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Travel Willingness</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select travel willingness" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="limited">Limited (0-25%)</SelectItem>
                            <SelectItem value="moderate">Moderate (25-50%)</SelectItem>
                            <SelectItem value="extensive">Extensive (50%+)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Salary Range */}
                  <FormField
                    control={jobPreferencesForm.control}
                    name="salary_range"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Salary Range
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., £40,000 - £60,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Job Preferences
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Manage your CV and professional bio for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="cv_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CV / Resume Content</FormLabel>
                        <FormDescription>
                          Your complete CV content for AI analysis and job matching
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your CV content here..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
                        <FormDescription>
                          A brief professional summary for job applications
                        </FormDescription>
                        <FormControl>
                          <Textarea
                            placeholder="Brief professional summary..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Profile
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Prompts Tab */}
        <TabsContent value="ai-prompts">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Initial Filtering Prompt
                </CardTitle>
                <CardDescription>
                  AI prompt for initial job filtering (used by the first LLM tier)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...promptsForm}>
                  <form onSubmit={promptsForm.handleSubmit(savePrompts)} className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Available Variables:</p>
                      <div className="flex flex-wrap gap-2">
                        {SettingsService.getAvailableVariables().map((variable, index) => (
                          <Badge key={index} variant="outline">{variable}</Badge>
                        ))}
                      </div>
                    </div>
                    <FormField
                      control={promptsForm.control}
                      name="prompt1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prompt Template</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your initial filtering prompt..."
                              className="min-h-[300px] font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This prompt is used for initial job screening. Should result in REJECT, MAYBE, or APPROVE.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Detailed Analysis Prompt
                </CardTitle>
                <CardDescription>
                  AI prompt for detailed job analysis (used by the second LLM tier)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Available Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {SettingsService.getAvailableVariables().map((variable, index) => (
                        <Badge key={index} variant="outline">{variable}</Badge>
                      ))}
                    </div>
                  </div>
                  <FormField
                    control={promptsForm.control}
                    name="prompt2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prompt Template</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your detailed analysis prompt..."
                            className="min-h-[300px] font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This prompt is used for detailed job analysis and should provide comprehensive insights.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={promptsForm.handleSubmit(savePrompts)} 
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save AI Prompts
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure when and how you receive email notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(saveNotifications)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="email_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable Email Notifications
                          </FormLabel>
                          <FormDescription>
                            Receive email notifications for job updates
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="email_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SettingsService.getEmailFrequencyOptions().map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="digest_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Daily Digest Time
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SettingsService.getDigestTimeOptions().map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Time to receive daily digest emails
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="email_types"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Email Types</FormLabel>
                          <FormDescription>
                            Select which types of notifications you want to receive
                          </FormDescription>
                        </div>
                        {SettingsService.getEmailTypeOptions().map((item) => (
                          <FormField
                            key={item.value}
                            control={notificationForm.control}
                            name="email_types"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.value
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Notification Preferences
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Agents Tab */}
        <TabsContent value="ai-agents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-5 w-5" />
                AI Agent Configuration
              </CardTitle>
              <CardDescription>
                Configure your AI language models for job analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LLMConfigurationSection 
                config={llmConfig} 
                onChange={setLlmConfig} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMTP Tab */}
        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                SMTP Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email server settings for sending notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...smtpForm}>
                <form onSubmit={smtpForm.handleSubmit(saveSMTP)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={smtpForm.control}
                      name="host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input placeholder="smtp.gmail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smtpForm.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="587"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 587)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={smtpForm.control}
                    name="secure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Use TLS/SSL
                          </FormLabel>
                          <FormDescription>
                            Enable secure connection (recommended)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={smtpForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="your-email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smtpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="App password or email password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={smtpForm.control}
                    name="from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Email</FormLabel>
                        <FormControl>
                          <Input placeholder="notifications@yourdomain.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Email address that will appear as the sender
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={testSMTP}
                      disabled={testingSMTP}
                    >
                      {testingSMTP ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube2 className="w-4 h-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                    
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save SMTP Settings
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}