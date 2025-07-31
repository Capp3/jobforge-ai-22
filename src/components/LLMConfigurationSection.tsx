// Enhanced LLM Configuration Section with Dynamic Model Detection
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  TestTube2, 
  Loader2, 
  Check, 
  X, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { llmIntegrationService, type LLMAgent, type LLMConfiguration, type OllamaModel } from "@/services/llmIntegrationService";

interface LLMConfigurationSectionProps {
  config: LLMConfiguration;
  onChange: (config: LLMConfiguration) => void;
}

export function LLMConfigurationSection({ config, onChange }: LLMConfigurationSectionProps) {
  const { toast } = useToast();
  const [testingLLM, setTestingLLM] = useState<string | null>(null);
  const [loadingOllamaModels, setLoadingOllamaModels] = useState<string | null>(null);
  const [ollamaModels, setOllamaModels] = useState<Record<string, OllamaModel[]>>({});

  // Load Ollama models when endpoint changes
  const loadOllamaModels = async (endpoint: string, llmKey: string) => {
    setLoadingOllamaModels(llmKey);
    try {
      const models = await llmIntegrationService.getAvailableOllamaModels(endpoint);
      setOllamaModels(prev => ({ ...prev, [llmKey]: models }));
      
      if (models.length === 0) {
        // Don't show error toast for empty models - might be intentional
        console.warn(`No models found at ${endpoint}`);
      } else {
        // Show success message when models are found
        toast({
          title: "Models Loaded",
          description: `Found ${models.length} model(s) at ${endpoint}`,
        });
      }
    } catch (error) {
      console.error('Error loading Ollama models:', error);
      setOllamaModels(prev => ({ ...prev, [llmKey]: [] }));
      // Only show error toast on manual refresh, not on auto-load
      if (loadingOllamaModels === llmKey) {
        toast({
          title: "Connection Failed",
          description: `Unable to connect to Ollama at ${endpoint}. Check if Ollama is running and accessible.`,
          variant: "destructive",
        });
      }
    } finally {
      setLoadingOllamaModels(null);
    }
  };

  // Load Ollama models on component mount and endpoint changes
  useEffect(() => {
    if (config.llm1.provider === 'ollama') {
      loadOllamaModels(config.llm1.configs.ollama.endpoint, 'llm1');
    }
    if (config.llm2.provider === 'ollama') {
      loadOllamaModels(config.llm2.configs.ollama.endpoint, 'llm2');
    }
  }, [
    config.llm1.provider, 
    config.llm1.configs.ollama.endpoint,
    config.llm2.provider, 
    config.llm2.configs.ollama.endpoint
  ]);

  const testLLMConnection = async (llmKey: string) => {
    setTestingLLM(llmKey);
    const llmConfig = config[llmKey as keyof LLMConfiguration] as LLMAgent;
    
    try {
      const providerConfig = llmConfig.configs[llmConfig.provider];
      const success = await llmIntegrationService.testProviderConnection(llmConfig.provider, providerConfig);
      
      if (success) {
        toast({
          title: "Connection Successful",
          description: `${llmConfig.provider} LLM is working correctly.`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: `Unable to connect to ${llmConfig.provider} LLM.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Error testing ${llmConfig.provider} connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setTestingLLM(null);
    }
  };

  const updateLLMConfig = (llmKey: string, updates: Partial<LLMAgent>) => {
    onChange({
      ...config,
      [llmKey]: {
        ...config[llmKey as keyof LLMConfiguration],
        ...updates
      }
    });
  };

  const updateProviderConfig = (llmKey: string, provider: string, configUpdates: any) => {
    const llmConfig = config[llmKey as keyof LLMConfiguration] as LLMAgent;
    onChange({
      ...config,
      [llmKey]: {
        ...llmConfig,
        configs: {
          ...llmConfig.configs,
          [provider]: {
            ...llmConfig.configs[provider as keyof typeof llmConfig.configs],
            ...configUpdates
          }
        }
      }
    });
  };

  const renderProviderConfig = (llmKey: string, llmConfig: LLMAgent) => {
    const provider = llmConfig.provider;
    const providerConfig = llmConfig.configs[provider];

    if (provider === 'ollama') {
      const ollamaConfig = providerConfig as typeof config.llm1.configs.ollama;
      const models = ollamaModels[llmKey] || [];
      
      return (
        <>
          <div>
            <Label htmlFor={`${llmKey}-ollama-endpoint`}>Endpoint URL</Label>
            <div className="flex space-x-2">
              <Input
                id={`${llmKey}-ollama-endpoint`}
                value={ollamaConfig.endpoint}
                onChange={(e) => updateProviderConfig(llmKey, 'ollama', { endpoint: e.target.value })}
                placeholder="http://192.168.1.17:11434"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => loadOllamaModels(ollamaConfig.endpoint, llmKey)}
                disabled={loadingOllamaModels === llmKey}
              >
                {loadingOllamaModels === llmKey ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor={`${llmKey}-ollama-model`}>Model</Label>
            <Select 
              value={ollamaConfig.model}
              onValueChange={(value) => updateProviderConfig(llmKey, 'ollama', { model: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.length > 0 ? (
                  models.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(model.size / (1024 * 1024 * 1024)).toFixed(1)} GB
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-models" disabled>
                    {loadingOllamaModels === llmKey ? 'Loading...' : 'No models available'}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {models.length === 0 && !loadingOllamaModels && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-1" />
                Ollama not running or no models installed
              </div>
            )}
          </div>
        </>
      );
    }

    // API-based providers (OpenAI, Anthropic, Gemini, Grok)
    const apiConfig = providerConfig as { apiKey: string; model: string };
    
    return (
      <>
        <div>
          <Label htmlFor={`${llmKey}-api-key`}>API Key</Label>
          <Input
            id={`${llmKey}-api-key`}
            type="password"
            value={apiConfig.apiKey}
            onChange={(e) => updateProviderConfig(llmKey, provider, { apiKey: e.target.value })}
            placeholder={getApiKeyPlaceholder(provider)}
          />
        </div>
        <div>
          <Label htmlFor={`${llmKey}-model`}>Model</Label>
          <Select 
            value={apiConfig.model}
            onValueChange={(value) => updateProviderConfig(llmKey, provider, { model: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getModelsForProvider(provider).map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </>
    );
  };

  const getApiKeyPlaceholder = (provider: string): string => {
    switch (provider) {
      case 'openai': return 'sk-...';
      case 'anthropic': return 'sk-ant-...';
      case 'gemini': return 'AI...';
      case 'grok': return 'xai-...';
      default: return 'API Key...';
    }
  };

  const getModelsForProvider = (provider: string) => {
    switch (provider) {
      case 'openai':
        return [
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
          { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
        ];
      case 'gemini':
        return [
          { value: 'gemini-pro', label: 'Gemini Pro' },
          { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' }
        ];
      case 'grok':
        return [
          { value: 'grok-beta', label: 'Grok Beta' }
        ];
      default:
        return [];
    }
  };

  const renderLLMCard = (llmKey: string, title: string, description: string) => {
    const llmConfig = config[llmKey as keyof LLMConfiguration] as LLMAgent;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${llmKey}-enabled`}>Enable {title}</Label>
            <Switch 
              id={`${llmKey}-enabled`} 
              checked={llmConfig.enabled}
              onCheckedChange={(checked) => updateLLMConfig(llmKey, { enabled: checked })}
            />
          </div>
          
          <div>
            <Label htmlFor={`${llmKey}-name`}>Agent Name</Label>
            <Input
              id={`${llmKey}-name`}
              value={llmConfig.name}
              onChange={(e) => updateLLMConfig(llmKey, { name: e.target.value })}
              placeholder={title}
            />
          </div>
          
          <div>
            <Label htmlFor={`${llmKey}-provider`}>Provider</Label>
            <Select 
              value={llmConfig.provider}
              onValueChange={(value) => updateLLMConfig(llmKey, { provider: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="grok">Grok</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderProviderConfig(llmKey, llmConfig)}

          <div className="pt-4 border-t">
            <Button 
              onClick={() => testLLMConnection(llmKey)}
              disabled={testingLLM === llmKey || !llmConfig.enabled}
              variant="outline"
              className="w-full"
            >
              {testingLLM === llmKey ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube2 className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {renderLLMCard('llm1', 'Primary LLM', 'Basic filtering and cost-efficient processing')}
      {renderLLMCard('llm2', 'Secondary LLM', 'Detailed analysis for approved jobs')}
    </div>
  );
} 