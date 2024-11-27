import type { MatchResult } from './types';
import { stripFormatting } from './json-utils';
import { AIServiceFactory } from './ai-service';
import { ANALYSIS_PROMPT } from './prompts';

export async function analyzeText(text: string, jsonStructure: string): Promise<MatchResult[]> {
  try {
    const aiService = AIServiceFactory.getInstance();
    
    if (!aiService.isConfigured()) {
      throw new Error('AI service not configured. Please check your API key and settings.');
    }

    const provider = aiService.getProvider();
    const rawJson = stripFormatting(jsonStructure);
    
    const prompt = `Analyze this text against the JSON structure:

JSON Structure:
${rawJson}

Text to Analyze:
${text}

Remember to return the results in the exact format specified, with the "matches" array containing all found matches.`;

    let response;
    
    if (provider === 'openai') {
      response = await aiService.createCompletion([
        { role: 'system', content: ANALYSIS_PROMPT },
        { role: 'user', content: prompt }
      ], {
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
      
    } else if (provider === 'anthropic') {
      response = await aiService.createCompletion([
        { role: 'user', content: `${ANALYSIS_PROMPT}\n\n${prompt}` }
      ], {
        temperature: 0.2,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      // Clean up the response and parse it
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsedResponse = JSON.parse(cleanContent);
      
      if (!parsedResponse.matches || !Array.isArray(parsedResponse.matches)) {
        throw new Error('Invalid response format from AI service');
      }

      return parsedResponse.matches;
    }

    throw new Error('Unsupported AI provider');

  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
}