import { useState } from 'react';
import { validateAndFormatJson } from '@/lib/json-utils';
import { analyzeText } from '@/lib/analysis-service';
import { updateJsonWithMatches } from '@/lib/json-service';
import type { AnalysisStep, MatchResult } from '@/lib/types';
import { JsonInput } from '@/components/JsonInput';
import { TextInput } from '@/components/TextInput';
import { AnalysisResults } from '@/components/AnalysisResults';
import { ApplyChanges } from '@/components/ApplyChanges';
import { StepIndicator } from '@/components/StepIndicator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ModelConfig, ModelProvider, ModelType } from '@/components/ModelConfig';
import { AIServiceFactory } from '@/lib/ai-service';

export default function App() {
  const [step, setStep] = useState<AnalysisStep>('json');
  const [jsonInput, setJsonInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [jsonState, setJsonState] = useState({
    original: '',
    formatted: '',
    updated: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>();
  const { toast } = useToast();
  const [modelProvider, setModelProvider] = useState<ModelProvider>('openai');
  const [modelType, setModelType] = useState<ModelType>('gpt-4');
  const aiService = AIServiceFactory.getInstance();
  
  const handleProviderChange = (provider: ModelProvider) => {
    setModelProvider(provider);
    // Set default model for the provider
    const defaultModel = provider === 'openai' ? 'gpt-4' : 'claude-3-opus-20240229';
    setModelType(defaultModel as ModelType);
  };
  
  const handleModelChange = (model: ModelType) => {
    setModelType(model);
  };
  
  const handleApiKeyChange = (apiKey: string) => {
    aiService.configure(modelProvider, modelType, apiKey);
  };

  const handleJsonInput = (value: string) => {
    try {
      // First try to parse the value as-is (handles raw JSON paste)
      JSON.parse(value);
      setJsonInput(value);
      const { formatted } = validateAndFormatJson(value);
      setError(undefined);
      setJsonState(prev => ({
        ...prev,
        original: value,
        formatted: formatted || value
      }));
    } catch {
      // If parsing fails, try to extract JSON from HTML content
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        if (!textContent) {
          setError('Invalid JSON input');
          return;
        }
        
        // Validate the extracted JSON
        const { formatted, isValid, error } = validateAndFormatJson(textContent);
        if (!isValid) {
          setError(error?.message);
          return;
        }
  
        setJsonInput(textContent);
        setError(undefined);
        setJsonState(prev => ({
          ...prev,
          original: textContent,
          formatted: formatted || textContent
        }));
      } catch (err) {
        setError('Invalid JSON input');
      }
    }
  };

  const handleNext = async () => {
    setError(undefined);

    if (step === 'json') {
      if (!jsonInput.trim()) {
        setError('Please enter JSON structure');
        return;
      }
      setStep('text');
    } 
    else if (step === 'text') {
      if (!textInput.trim()) {
        setError('Please enter text to analyze');
        return;
      }

      setIsAnalyzing(true);
      try {
        const analysisResults = await analyzeText(textInput, jsonState.original);
        setResults(analysisResults);
        setStep('analysis');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        setError(message);
        toast({
          variant: 'destructive',
          title: 'Analysis Error',
          description: message
        });
      } finally {
        setIsAnalyzing(false);
      }
    } 
    else if (step === 'analysis') {
      setIsAnalyzing(true);
      try {
        const updated = await updateJsonWithMatches(jsonState.original, results);
        setJsonState(prev => ({
          ...prev,
          updated
        }));
        setStep('apply');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to apply changes';
        setError(message);
        toast({
          variant: 'destructive',
          title: 'Update Error',
          description: message
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleBack = () => {
    setError(undefined);
    if (step === 'text') setStep('json');
    else if (step === 'analysis') setStep('text');
    else if (step === 'apply') setStep('analysis');
  };

  const handleReset = () => {
    setStep('json');
    setJsonInput('');
    setTextInput('');
    setResults([]);
    setJsonState({
      original: '',
      formatted: '',
      updated: ''
    });
    setError(undefined);
  };

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-8">
      <ModelConfig 
        provider={modelProvider}
        model={modelType}
        onProviderChange={handleProviderChange}
        onModelChange={handleModelChange}
        onApiKeyChange={handleApiKeyChange}
      />
      <StepIndicator currentStep={step} />

      <main className="space-y-6">
        {step === 'json' && (
          <JsonInput
            value={jsonState.formatted}
            onChange={handleJsonInput}
            error={error}
          />
        )}

        {step === 'text' && (
          <TextInput
            value={textInput}
            onChange={setTextInput}
          />
        )}

        {step === 'analysis' && (
          <AnalysisResults
            results={results}
            originalText={textInput}
          />
        )}

        {step === 'apply' && (
          <ApplyChanges
            originalJson={jsonState.original}
            updatedJson={jsonState.updated}
            matches={results}
          />
        )}

        <div className="flex justify-between">
          {step !== 'json' && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isAnalyzing}
            >
              Back
            </Button>
          )}

          <div className="flex gap-2 ml-auto">
            {step === 'apply' ? (
              <Button
                variant="default"
                onClick={handleReset}
              >
                Start New Analysis
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleNext}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Processing...' : 'Next'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}