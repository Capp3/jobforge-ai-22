// LLM Integration Service
// Implements two-tier LLM architecture for job analysis

import type { Job, UserPreferences, AIRating, DetailedAnalysis } from '../types/algorithm';

// LLM Provider types matching the configuration
export interface LLMConfig {
  ollama: { endpoint: string; model: string };
  openai: { apiKey: string; model: string };
  anthropic: { apiKey: string; model: string };
  gemini: { apiKey: string; model: string };
  grok: { apiKey: string; model: string };
}

export interface LLMAgent {
  provider: keyof LLMConfig;
  name: string;
  enabled: boolean;
  configs: LLMConfig;
}

export interface LLMConfiguration {
  llm1: LLMAgent; // Primary LLM (Basic Filtering)
  llm2: LLMAgent; // Secondary LLM (Detailed Analysis)
}

// Available models for each provider
export interface AvailableModels {
  ollama: OllamaModel[];
  openai: string[];
  anthropic: string[];
  gemini: string[];
  grok: string[];
}

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
}

// LLM Analysis results
export interface BasicFilterResult {
  job_id: string;
  rating: AIRating;
  reasoning: string;
  processing_time_ms: number;
  model_used: string;
  provider: string;
  cost_estimate?: number;
}

export interface DetailedAnalysisResult {
  job_id: string;
  analysis: DetailedAnalysis;
  processing_time_ms: number;
  model_used: string;
  provider: string;
  cost_estimate?: number;
  confidence_score?: number;
}

// Prompt templates with variable replacement
export interface PromptTemplate {
  template: string;
  variables: Record<string, string>;
}

class LLMIntegrationService {
  private static instance: LLMIntegrationService;
  private baseUrl = (typeof window !== 'undefined' && (window as any).__VITE_API_BASE_URL__) || 'http://localhost:3001/api';

  public static getInstance(): LLMIntegrationService {
    if (!LLMIntegrationService.instance) {
      LLMIntegrationService.instance = new LLMIntegrationService();
    }
    return LLMIntegrationService.instance;
  }

  // ========================================
  // OLLAMA MODEL DETECTION
  // ========================================

  async getAvailableOllamaModels(endpoint: string = 'http://192.168.1.17:11434'): Promise<OllamaModel[]> {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${endpoint}/api/tags`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Ollama not available at ${endpoint} (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Connection timeout to ${endpoint} (check if Ollama is running and accessible)`);
        }
        console.error('Error fetching Ollama models:', error.message);
        throw error;
      }
      throw new Error(`Unknown error connecting to ${endpoint}`);
    }
  }

  async testOllamaConnection(endpoint: string, model: string): Promise<boolean> {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for test
      
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: model,
          prompt: 'Hello',
          stream: false
        })
      });
      clearTimeout(timeoutId);
      
      return response.ok;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Ollama connection test timed out');
      } else {
        console.error('Ollama connection test failed:', error);
      }
      return false;
    }
  }

  // ========================================
  // PROVIDER TESTING
  // ========================================

  async testProviderConnection(provider: keyof LLMConfig, config: LLMConfig[keyof LLMConfig]): Promise<boolean> {
    try {
      switch (provider) {
        case 'ollama':
          return await this.testOllamaConnection(
            (config as LLMConfig['ollama']).endpoint,
            (config as LLMConfig['ollama']).model
          );
          
        case 'openai':
          return await this.testOpenAIConnection(config as LLMConfig['openai']);
          
        case 'anthropic':
          return await this.testAnthropicConnection(config as LLMConfig['anthropic']);
          
        case 'gemini':
          return await this.testGeminiConnection(config as LLMConfig['gemini']);
          
        case 'grok':
          return await this.testGrokConnection(config as LLMConfig['grok']);
          
        default:
          return false;
      }
    } catch (error) {
      console.error(`Provider connection test failed for ${provider}:`, error);
      return false;
    }
  }

  private async testOpenAIConnection(config: LLMConfig['openai']): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${config.apiKey}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testAnthropicConnection(config: LLMConfig['anthropic']): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      return response.status !== 401; // Unauthorized means invalid key
    } catch {
      return false;
    }
  }

  private async testGeminiConnection(config: LLMConfig['gemini']): Promise<boolean> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${config.apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testGrokConnection(config: LLMConfig['grok']): Promise<boolean> {
    try {
      const response = await fetch('https://api.x.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${config.apiKey}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ========================================
  // PROMPT TEMPLATE PROCESSING
  // ========================================

  processPromptTemplate(template: string, variables: Record<string, string>): string {
    let processedPrompt = template;
    
    // Replace all {{variable}} patterns with actual values
    Object.entries(variables).forEach(([key, value]) => {
      const pattern = new RegExp(`{{${key}}}`, 'g');
      processedPrompt = processedPrompt.replace(pattern, value || `[${key} not provided]`);
    });
    
    return processedPrompt;
  }

  createPromptVariables(job: Job, preferences: UserPreferences, cv?: string, biography?: string): Record<string, string> {
    return {
      // Job-specific variables
      job_title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      job_description: job.description || '',
      requirements: job.requirements || '',
      salary_range: job.salary_range || '',
      source: job.source || '',
      
      // User preference variables
      target_locations: preferences.preferred_locations.join(', '),
      target_job_titles: job.title || '', // Could be extracted from preferences if available
      remote_preference: preferences.work_mode.join(', '),
      min_salary: preferences.salary_range.split('-')[0] || '',
      max_salary: preferences.salary_range.split('-')[1] || '',
      currency: 'GBP', // Could be extracted from preferences
      
      // Profile variables
      biography: biography || '',
      cv: cv || ''
    };
  }

  // ========================================
  // TWO-TIER LLM PROCESSING
  // ========================================

  async processJobWithBasicFiltering(
    job: Job,
    preferences: UserPreferences,
    llmConfig: LLMAgent,
    promptTemplate: string,
    cv?: string,
    biography?: string
  ): Promise<BasicFilterResult> {
    const startTime = performance.now();
    
    try {
      // Create prompt variables
      const variables = this.createPromptVariables(job, preferences, cv, biography);
      const processedPrompt = this.processPromptTemplate(promptTemplate, variables);
      
      // Get current provider config
      const providerConfig = llmConfig.configs[llmConfig.provider];
      
      // Call LLM based on provider
      let response: string;
      let modelUsed: string;
      
      switch (llmConfig.provider) {
        case 'ollama':
          const ollamaConfig = providerConfig as LLMConfig['ollama'];
          response = await this.callOllamaAPI(ollamaConfig.endpoint, ollamaConfig.model, processedPrompt);
          modelUsed = ollamaConfig.model;
          break;
          
        case 'openai':
          const openaiConfig = providerConfig as LLMConfig['openai'];
          response = await this.callOpenAIAPI(openaiConfig.apiKey, openaiConfig.model, processedPrompt);
          modelUsed = openaiConfig.model;
          break;
          
        case 'anthropic':
          const anthropicConfig = providerConfig as LLMConfig['anthropic'];
          response = await this.callAnthropicAPI(anthropicConfig.apiKey, anthropicConfig.model, processedPrompt);
          modelUsed = anthropicConfig.model;
          break;
          
        case 'gemini':
          const geminiConfig = providerConfig as LLMConfig['gemini'];
          response = await this.callGeminiAPI(geminiConfig.apiKey, geminiConfig.model, processedPrompt);
          modelUsed = geminiConfig.model;
          break;
          
        case 'grok':
          const grokConfig = providerConfig as LLMConfig['grok'];
          response = await this.callGrokAPI(grokConfig.apiKey, grokConfig.model, processedPrompt);
          modelUsed = grokConfig.model;
          break;
          
        default:
          throw new Error(`Unsupported provider: ${llmConfig.provider}`);
      }
      
      // Parse rating from response
      const { rating, reasoning } = this.parseBasicFilterResponse(response);
      
      const processingTime = performance.now() - startTime;
      
      return {
        job_id: job.id,
        rating,
        reasoning,
        processing_time_ms: processingTime,
        model_used: modelUsed,
        provider: llmConfig.provider,
        cost_estimate: this.estimateCost(llmConfig.provider, modelUsed, processedPrompt.length, response.length)
      };
      
    } catch (error) {
      console.error('Basic filtering failed:', error);
      const processingTime = performance.now() - startTime;
      
      return {
        job_id: job.id,
        rating: 'REJECT',
        reasoning: `Error during analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        processing_time_ms: processingTime,
        model_used: 'error',
        provider: llmConfig.provider
      };
    }
  }

  async processJobWithDetailedAnalysis(
    job: Job,
    preferences: UserPreferences,
    llmConfig: LLMAgent,
    promptTemplate: string,
    cv?: string,
    biography?: string
  ): Promise<DetailedAnalysisResult> {
    const startTime = performance.now();
    
    try {
      // Create prompt variables
      const variables = this.createPromptVariables(job, preferences, cv, biography);
      const processedPrompt = this.processPromptTemplate(promptTemplate, variables);
      
      // Get current provider config
      const providerConfig = llmConfig.configs[llmConfig.provider];
      
      // Call LLM based on provider
      let response: string;
      let modelUsed: string;
      
      switch (llmConfig.provider) {
        case 'ollama':
          const ollamaConfig = providerConfig as LLMConfig['ollama'];
          response = await this.callOllamaAPI(ollamaConfig.endpoint, ollamaConfig.model, processedPrompt);
          modelUsed = ollamaConfig.model;
          break;
          
        case 'openai':
          const openaiConfig = providerConfig as LLMConfig['openai'];
          response = await this.callOpenAIAPI(openaiConfig.apiKey, openaiConfig.model, processedPrompt);
          modelUsed = openaiConfig.model;
          break;
          
        case 'anthropic':
          const anthropicConfig = providerConfig as LLMConfig['anthropic'];
          response = await this.callAnthropicAPI(anthropicConfig.apiKey, anthropicConfig.model, processedPrompt);
          modelUsed = anthropicConfig.model;
          break;
          
        case 'gemini':
          const geminiConfig = providerConfig as LLMConfig['gemini'];
          response = await this.callGeminiAPI(geminiConfig.apiKey, geminiConfig.model, processedPrompt);
          modelUsed = geminiConfig.model;
          break;
          
        case 'grok':
          const grokConfig = providerConfig as LLMConfig['grok'];
          response = await this.callGrokAPI(grokConfig.apiKey, grokConfig.model, processedPrompt);
          modelUsed = grokConfig.model;
          break;
          
        default:
          throw new Error(`Unsupported provider: ${llmConfig.provider}`);
      }
      
      // Parse detailed analysis from response
      const analysis = this.parseDetailedAnalysisResponse(response);
      
      const processingTime = performance.now() - startTime;
      
      return {
        job_id: job.id,
        analysis,
        processing_time_ms: processingTime,
        model_used: modelUsed,
        provider: llmConfig.provider,
        cost_estimate: this.estimateCost(llmConfig.provider, modelUsed, processedPrompt.length, response.length),
        confidence_score: this.calculateConfidenceScore(response)
      };
      
    } catch (error) {
      console.error('Detailed analysis failed:', error);
      const processingTime = performance.now() - startTime;
      
      return {
        job_id: job.id,
        analysis: {
          why_worth_reviewing: `Error during analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
          technical_challenges: 'Unable to analyze due to error',
          career_growth: 'Unable to analyze due to error',
          company_assessment: 'Unable to analyze due to error',
          potential_concerns: 'Analysis failed - manual review recommended',
          application_recommendations: 'Review job manually due to analysis error'
        },
        processing_time_ms: processingTime,
        model_used: 'error',
        provider: llmConfig.provider
      };
    }
  }

  // ========================================
  // LLM API CALLS
  // ========================================

  private async callOllamaAPI(endpoint: string, model: string, prompt: string): Promise<string> {
    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response || '';
  }

  private async callOpenAIAPI(apiKey: string, model: string, prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private async callAnthropicAPI(apiKey: string, model: string, prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  private async callGeminiAPI(apiKey: string, model: string, prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async callGrokAPI(apiKey: string, model: string, prompt: string): Promise<string> {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error(`Grok API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // ========================================
  // RESPONSE PARSING
  // ========================================

  private parseBasicFilterResponse(response: string): { rating: AIRating; reasoning: string } {
    const text = response.toUpperCase();
    
    let rating: AIRating = 'REJECT';
    if (text.includes('APPROVE')) {
      rating = 'APPROVE';
    } else if (text.includes('MAYBE')) {
      rating = 'MAYBE';
    }
    
    // Extract reasoning (everything after the rating)
    const ratingIndex = Math.max(
      response.toLowerCase().indexOf('approve'),
      response.toLowerCase().indexOf('maybe'),
      response.toLowerCase().indexOf('reject')
    );
    
    const reasoning = ratingIndex >= 0 
      ? response.substring(ratingIndex + 6).trim() 
      : response.trim();
    
    return { rating, reasoning: reasoning || 'No reasoning provided' };
  }

  private parseDetailedAnalysisResponse(response: string): DetailedAnalysis {
    // This is a simple parser - could be enhanced with more sophisticated parsing
    const sections = this.extractSections(response);
    
    return {
      why_worth_reviewing: sections.worth_reviewing || sections.opportunities || response.substring(0, 200),
      technical_challenges: sections.challenges || sections.technical || 'Not specified',
      career_growth: sections.growth || sections.career || 'Not specified',
      company_assessment: sections.company || sections.assessment || 'Not specified',
      potential_concerns: sections.concerns || sections.risks || 'Not specified',
      application_recommendations: sections.recommendations || sections.strategy || 'Not specified'
    };
  }

  private extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = text.split('\n');
    
    let currentSection = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for section headers
      if (trimmed.match(/^\d+\.|^[A-Z\s]+:|^##|^#/)) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = currentContent.join(' ').trim();
        }
        
        // Start new section
        currentSection = this.normalizeSectionName(trimmed);
        currentContent = [];
      } else if (trimmed.length > 0) {
        currentContent.push(trimmed);
      }
    }
    
    // Save last section
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent.join(' ').trim();
    }
    
    return sections;
  }

  private normalizeSectionName(header: string): string {
    const cleaned = header.replace(/^\d+\.|\:|^##|^#/g, '').toLowerCase().trim();
    
    if (cleaned.includes('worth') || cleaned.includes('opportunit')) return 'worth_reviewing';
    if (cleaned.includes('challeng') || cleaned.includes('technical')) return 'challenges';
    if (cleaned.includes('growth') || cleaned.includes('career')) return 'growth';
    if (cleaned.includes('company') || cleaned.includes('assessment')) return 'company';
    if (cleaned.includes('concern') || cleaned.includes('risk')) return 'concerns';
    if (cleaned.includes('recommend') || cleaned.includes('strategy')) return 'recommendations';
    
    return cleaned.replace(/\s+/g, '_');
  }

  private calculateConfidenceScore(response: string): number {
    // Simple confidence scoring based on response length and structure
    let score = 50; // Base score
    
    if (response.length > 500) score += 20;
    if (response.includes('\n')) score += 10; // Structured response
    if (response.match(/\d+\./g)) score += 15; // Numbered points
    if (response.toLowerCase().includes('however') || response.toLowerCase().includes('although')) score += 10; // Nuanced thinking
    
    return Math.min(100, Math.max(0, score));
  }

  // ========================================
  // COST ESTIMATION
  // ========================================

  private estimateCost(provider: string, model: string, inputLength: number, outputLength: number): number {
    if (provider === 'ollama') return 0; // Local, no cost
    
    const inputTokens = Math.ceil(inputLength / 4); // Rough token estimation
    const outputTokens = Math.ceil(outputLength / 4);
    
    // Rough cost estimates (per 1K tokens) - should be updated with real pricing
    const costs: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.0005, output: 0.0025 },
      'gemini-pro': { input: 0.001, output: 0.002 },
      'grok-beta': { input: 0.002, output: 0.004 }
    };
    
    const modelCosts = costs[model] || { input: 0.001, output: 0.002 };
    
    return (inputTokens / 1000 * modelCosts.input) + (outputTokens / 1000 * modelCosts.output);
  }

  // ========================================
  // CONFIGURATION MANAGEMENT
  // ========================================

  async saveLLMConfiguration(config: LLMConfiguration): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/llm-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) throw new Error('Failed to save LLM configuration');
    } catch (error) {
      console.error('Error saving LLM configuration:', error);
      throw error;
    }
  }

  async loadLLMConfiguration(): Promise<LLMConfiguration | null> {
    try {
      const response = await fetch(`${this.baseUrl}/llm-config`);
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Error loading LLM configuration:', error);
      return null;
    }
  }

  // ========================================
  // FULL WORKFLOW INTEGRATION
  // ========================================

  async processJobWithTwoTierAnalysis(
    job: Job,
    preferences: UserPreferences,
    llmConfig: LLMConfiguration,
    prompts: { basic: string; detailed: string },
    cv?: string,
    biography?: string
  ): Promise<{
    basicResult: BasicFilterResult;
    detailedResult?: DetailedAnalysisResult;
  }> {
    // Step 1: Basic filtering with LLM1
    const basicResult = await this.processJobWithBasicFiltering(
      job,
      preferences,
      llmConfig.llm1,
      prompts.basic,
      cv,
      biography
    );
    
    // Step 2: If approved or maybe, run detailed analysis with LLM2
    let detailedResult: DetailedAnalysisResult | undefined;
    
    if ((basicResult.rating === 'APPROVE' || basicResult.rating === 'MAYBE') && 
        llmConfig.llm2.enabled) {
      detailedResult = await this.processJobWithDetailedAnalysis(
        job,
        preferences,
        llmConfig.llm2,
        prompts.detailed,
        cv,
        biography
      );
    }
    
    return {
      basicResult,
      detailedResult
    };
  }
}

// Export singleton instance
export const llmIntegrationService = LLMIntegrationService.getInstance();
export default llmIntegrationService; 