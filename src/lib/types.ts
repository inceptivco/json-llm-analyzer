export interface JsonError {
  message: string;
  line?: number;
  column?: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: JsonError;
  formatted?: string;
  raw?: string;
}

export interface MatchPosition {
  start: number;
  end: number;
}

export interface MatchResult {
  property: string;
  matchedText: string;
  position: MatchPosition;
  confidence: number;
  matchType: 'exact' | 'semantic' | 'partial';
  suggestions?: string[];
  dataType?: string;
  formatValidation?: {
    isValid: boolean;
    message?: string;
  };
}

export type AnalysisStep = 'json' | 'text' | 'analysis' | 'apply';