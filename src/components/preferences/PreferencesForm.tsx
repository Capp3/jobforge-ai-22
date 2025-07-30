// PreferencesForm Component
// Allows users to configure their job filtering preferences for the algorithm

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  X, 
  Save, 
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  Activity
} from 'lucide-react'
import { UserPreferences, PreferencesCreate } from '@/types/algorithm'
import { PreferencesService } from '@/services/preferencesService'
import { toast } from '@/hooks/use-toast'

// Validation schema
const preferencesSchema = z.object({
  preferred_locations: z.array(z.string()).min(1, 'At least one location is required'),
  work_mode: z.array(z.string()).min(1, 'At least one work mode is required'),
  travel_willingness: z.enum(['limited', 'moderate', 'extensive']),
  salary_range: z.string().regex(/^\d+(-\d+)?$/, 'Format: "min-max" or "amount"'),
  career_level: z.array(z.string()).min(1, 'At least one career level is required'),
  tech_stack: z.array(z.string()).min(1, 'At least one technology is required'),
  company_size: z.array(z.string()).min(1, 'At least one company size is required'),
})

type PreferencesFormData = z.infer<typeof preferencesSchema>

interface PreferencesFormProps {
  onSave?: (preferences: UserPreferences) => void
  showActions?: boolean
}

export function PreferencesForm({ onSave, showActions = true }: PreferencesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPreferences, setCurrentPreferences] = useState<UserPreferences | null>(null)
  
  // LLM Configuration state
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434')
  const [ollamaModel, setOllamaModel] = useState('')
  const [advancedAiModel, setAdvancedAiModel] = useState('gpt-4')
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  // Get preference options
  const options = PreferencesService.getPreferenceOptions()

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferred_locations: ['Belfast', 'Northern Ireland', 'UK', 'Remote'],
      work_mode: ['hybrid', 'remote'],
      travel_willingness: 'limited',
      salary_range: '40000-80000',
      career_level: ['senior', 'mid'],
      tech_stack: ['broadcast', 'media', 'production'],
      company_size: ['medium', 'large'],
    },
  })

  const {
    fields: locationFields,
    append: appendLocation,
    remove: removeLocation,
  } = useFieldArray({
    control: form.control,
    name: 'preferred_locations' as never,
  })

  const {
    fields: techFields,
    append: appendTech,
    remove: removeTech,
  } = useFieldArray({
    control: form.control,
    name: 'tech_stack' as never,
  })

  // Load current preferences
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true)
      try {
        const preferences = await PreferencesService.getUserPreferences()
        if (preferences) {
          setCurrentPreferences(preferences)
          form.reset({
            preferred_locations: preferences.preferred_locations,
            work_mode: preferences.work_mode,
            travel_willingness: preferences.travel_willingness as 'limited' | 'moderate' | 'extensive',
            salary_range: preferences.salary_range,
            career_level: preferences.career_level,
            tech_stack: preferences.tech_stack,
            company_size: preferences.company_size,
          })
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
        toast({
          title: 'Error',
          description: 'Failed to load current preferences',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [form])

  // Handle form submission
  const onSubmit = async (data: PreferencesFormData) => {
    setIsSaving(true)
    try {
      let savedPreferences: UserPreferences

      if (currentPreferences) {
        // Update existing preferences
        savedPreferences = await PreferencesService.updateUserPreferences(
          currentPreferences.id,
          data
        )
      } else {
        // Create new preferences
        savedPreferences = await PreferencesService.createUserPreferences(data as PreferencesCreate)
      }

      setCurrentPreferences(savedPreferences)
      onSave?.(savedPreferences)

      toast({
        title: 'Success',
        description: 'Preferences saved successfully',
      })
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle export
  const handleExport = async () => {
    try {
      const exportData = await PreferencesService.exportPreferences()
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'job-preferences.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: 'Preferences exported successfully',
      })
    } catch (error) {
      console.error('Failed to export preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to export preferences',
        variant: 'destructive',
      })
    }
  }

  // Handle import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string
        const importedPreferences = await PreferencesService.importPreferences(jsonData)
        setCurrentPreferences(importedPreferences)
        
        form.reset({
          preferred_locations: importedPreferences.preferred_locations,
          work_mode: importedPreferences.work_mode,
          travel_willingness: importedPreferences.travel_willingness as 'limited' | 'moderate' | 'extensive',
          salary_range: importedPreferences.salary_range,
          career_level: importedPreferences.career_level,
          tech_stack: importedPreferences.tech_stack,
          company_size: importedPreferences.company_size,
        })

        toast({
          title: 'Success',
          description: 'Preferences imported successfully',
        })
      } catch (error) {
        console.error('Failed to import preferences:', error)
        toast({
          title: 'Error',
          description: 'Failed to import preferences',
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ''
  }

  // Add quick location
  const addQuickLocation = (location: string) => {
    const current = form.getValues('preferred_locations')
    if (!current.includes(location)) {
      appendLocation(location)
    }
  }

  // Add quick tech
  const addQuickTech = (tech: string) => {
    const current = form.getValues('tech_stack')
    if (!current.includes(tech)) {
      appendTech(tech)
    }
  }

  // Fetch available Ollama models
  const fetchOllamaModels = async () => {
    setIsTestingConnection(true)
    try {
      const response = await fetch(`${ollamaEndpoint}/api/tags`)
      if (response.ok) {
        const data = await response.json()
        const models = data.models?.map((model: { name: string }) => model.name) || []
        setAvailableModels(models)
        toast({
          title: 'Connection Successful',
          description: `Found ${models.length} available models`,
        })
      } else {
        throw new Error('Failed to connect to Ollama')
      }
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error)
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to Ollama. Check the endpoint URL.',
        variant: 'destructive',
      })
      setAvailableModels([])
    } finally {
      setIsTestingConnection(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading preferences...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Filtering Preferences</CardTitle>
          <CardDescription>
            Configure your preferences to help the AI filter job opportunities that match your criteria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Preferred Locations */}
              <FormField
                control={form.control}
                name="preferred_locations"
                render={() => (
                  <FormItem>
                    <FormLabel>Preferred Locations</FormLabel>
                    <FormDescription>
                      Add locations where you'd like to work
                    </FormDescription>
                    <div className="space-y-3">
                      {locationFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="Enter location"
                              {...form.register(`preferred_locations.${index}`)}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLocation(index)}
                            disabled={locationFields.length <= 1}
                          >
                            <X className="w-4 h-4" />
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
                      
                      {/* Quick add common locations */}
                      <div className="flex flex-wrap gap-2">
                        {options.commonLocations.map((location) => (
                          <Badge
                            key={location}
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => addQuickLocation(location)}
                          >
                            + {location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Work Mode */}
              <FormField
                control={form.control}
                name="work_mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Mode Preferences</FormLabel>
                    <FormDescription>
                      Select your preferred work arrangements
                    </FormDescription>
                    <div className="grid grid-cols-3 gap-4">
                      {options.workModes.map((mode) => (
                        <div key={mode.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={mode.value}
                            checked={field.value?.includes(mode.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, mode.value])
                              } else {
                                field.onChange(current.filter((v) => v !== mode.value))
                              }
                            }}
                          />
                          <label htmlFor={mode.value} className="text-sm">
                            {mode.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Travel Willingness */}
              <FormField
                control={form.control}
                name="travel_willingness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel Willingness</FormLabel>
                    <FormDescription>
                      How much travel are you willing to do?
                    </FormDescription>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select travel preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.travelWillingness.map((option) => (
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

              {/* Salary Range */}
              <FormField
                control={form.control}
                name="salary_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Range (GBP)</FormLabel>
                    <FormDescription>
                      Enter as "min-max" (e.g., "40000-80000") or single amount
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="40000-80000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Career Level */}
              <FormField
                control={form.control}
                name="career_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Career Level</FormLabel>
                    <FormDescription>
                      Select your target career levels
                    </FormDescription>
                    <div className="grid grid-cols-3 gap-4">
                      {options.careerLevels.map((level) => (
                        <div key={level.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={level.value}
                            checked={field.value?.includes(level.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, level.value])
                              } else {
                                field.onChange(current.filter((v) => v !== level.value))
                              }
                            }}
                          />
                          <label htmlFor={level.value} className="text-sm">
                            {level.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tech Stack */}
              <FormField
                control={form.control}
                name="tech_stack"
                render={() => (
                  <FormItem>
                    <FormLabel>Technology Stack</FormLabel>
                    <FormDescription>
                      Add technologies and skills you work with
                    </FormDescription>
                    <div className="space-y-3">
                      {techFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="Enter technology or skill"
                              {...form.register(`tech_stack.${index}`)}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTech(index)}
                            disabled={techFields.length <= 1}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendTech('')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Technology
                      </Button>
                      
                      {/* Quick add common technologies */}
                      <div className="flex flex-wrap gap-2">
                        {options.commonTechStacks.map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => addQuickTech(tech)}
                          >
                            + {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Size */}
              <FormField
                control={form.control}
                name="company_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size Preferences</FormLabel>
                    <FormDescription>
                      Select your preferred company sizes
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-4">
                      {options.companySizes.map((size) => (
                        <div key={size.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={size.value}
                            checked={field.value?.includes(size.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, size.value])
                              } else {
                                field.onChange(current.filter((v) => v !== size.value))
                              }
                            }}
                          />
                          <label htmlFor={size.value} className="text-sm">
                            {size.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LLM Configuration */}
              <div className="space-y-4 border-t pt-6">
                <div>
                  <h3 className="text-lg font-medium">AI Model Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure the AI models used for job filtering and analysis
                  </p>
                </div>

                {/* Ollama Configuration */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ollama Endpoint */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ollama Endpoint</label>
                      <Input
                        value={ollamaEndpoint}
                        onChange={(e) => setOllamaEndpoint(e.target.value)}
                        placeholder="http://localhost:11434"
                      />
                      <p className="text-xs text-muted-foreground">
                        URL for your Ollama instance
                      </p>
                    </div>

                    {/* Test Connection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Test Connection</label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={fetchOllamaModels}
                        disabled={isTestingConnection || !ollamaEndpoint}
                        className="w-full"
                      >
                        {isTestingConnection ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Activity className="w-4 h-4 mr-2" />
                            Test & Fetch Models
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Test connection and load available models
                      </p>
                    </div>
                  </div>

                  {/* Ollama Model Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ollama Model</label>
                    <div className="flex gap-2">
                      {availableModels.length > 0 ? (
                        <Select value={ollamaModel} onValueChange={setOllamaModel}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a model..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModels.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={ollamaModel}
                          onChange={(e) => setOllamaModel(e.target.value)}
                          placeholder="Enter model name (e.g., llama2, mistral)"
                          className="flex-1"
                        />
                      )}
                      {availableModels.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAvailableModels([])}
                          title="Switch to manual input"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {availableModels.length > 0
                        ? `Choose from ${availableModels.length} available models`
                        : 'Manually enter model name or test connection to load available models'
                      }
                    </p>
                  </div>

                  {/* Advanced AI Model */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Advanced AI Model</label>
                    <Select value={advancedAiModel} onValueChange={setAdvancedAiModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select advanced AI model..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                        <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Model used for detailed job analysis and reasoning
                    </p>
                  </div>

                  {/* Model Status */}
                  {(ollamaModel || advancedAiModel) && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <h4 className="text-sm font-medium">Current Configuration</h4>
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="font-medium">Initial Filtering:</span>{' '}
                          {ollamaModel || 'Not configured'}
                        </div>
                        <div>
                          <span className="font-medium">Detailed Analysis:</span>{' '}
                          {advancedAiModel}
                        </div>
                        <div>
                          <span className="font-medium">Endpoint:</span>{' '}
                          {ollamaEndpoint}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {showActions && (
                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Current Preferences Summary */}
      {currentPreferences && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Current Preferences Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(PreferencesService.formatPreferencesForDisplay(currentPreferences)).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">{key}</span>
                  <span className="text-sm text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 