import OpenAI from 'openai';
import type { MatchResult } from './types';
import { stripFormatting } from './json-utils';
import { AIServiceFactory } from './ai-service';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const ANALYSIS_PROMPT = `You are a precise text analysis system. Your task is to identify and match JSON properties within the provided text.

For each JSON property:
1. Find exact or semantically equivalent matches in the text
2. Calculate a confidence score (0-100) based on:
   - Exact match: 90-100
   - Semantic match: 60-89
   - Partial match: 30-59
   - Low confidence: 0-29
3. Return matches with:
   - Property name
   - Matched text
   - Character position (start, end)
   - Confidence score
   - Match type (exact/semantic/partial)

Return the results in this exact format:
{
  "matches": [{
    "property": "name",
    "matchedText": "John Smith",
    "position": { "start": 10, "end": 20 },
    "confidence": 95,
    "matchType": "exact"
  }]
}`;

export async function analyzeText(text: string, jsonStructure: string): Promise<MatchResult[]> {
  try {
    const aiService = AIServiceFactory.getInstance();
    
    // Check if service is configured before proceeding
    if (!aiService.isConfigured()) {
      throw new Error('AI service not configured. Please check your API key and settings.');
    }

    const rawJson = stripFormatting(jsonStructure);
    const client = aiService.getClient();

    const response = await client.chat.completions.create({
      messages: [
        { role: 'system', content: ANALYSIS_PROMPT },
        {
          role: 'user',
          content: `Analyze this text against the JSON structure:

JSON Structure:
${rawJson}

Text to Analyze:
${text}

Remember to return the results in the exact format specified, with the "matches" array containing all found matches.`,
        },
      ],
      model: aiService.getModel(), // Add this method to AIServiceFactory
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI service');
    }

    const parsedResponse = JSON.parse(content);
    if (!parsedResponse.matches || !Array.isArray(parsedResponse.matches)) {
      throw new Error('Invalid response format from AI service');
    }

    return parsedResponse.matches;
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error; // Propagate the error for better handling
  }
}