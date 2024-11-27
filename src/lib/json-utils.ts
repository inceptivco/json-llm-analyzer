import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import type { ValidationResult } from './types';

hljs.registerLanguage('json', json);

export function validateAndFormatJson(input: string): ValidationResult {
  try {
    // First, try to parse the JSON to validate it
    const parsed = JSON.parse(input);
    
    // Store raw JSON
    const raw = JSON.stringify(parsed);
    
    // Format it with proper indentation
    const formatted = JSON.stringify(parsed, null, 2);
    
    // Apply syntax highlighting only for display
    const highlighted = hljs.highlight(formatted, { language: 'json' }).value;
    
    return { 
      isValid: true, 
      formatted: highlighted,
      raw // Important for data operations
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    return {
      isValid: false,
      error: { message }
    };
  }
}

export function stripFormatting(input: string): string {
  try {
    // If input contains HTML tags, extract text content
    if (input.includes('<')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = input;
      input = tempDiv.textContent || tempDiv.innerText;
    }
    // Parse and re-stringify to get raw JSON
    return JSON.stringify(JSON.parse(input));
  } catch {
    return input;
  }
}

export function formatJsonForDisplay(input: string): string {
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    return hljs.highlight(formatted, { language: 'json' }).value;
  } catch {
    return input;
  }
}