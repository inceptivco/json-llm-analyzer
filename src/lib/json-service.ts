import { validateAndFormatJson, stripFormatting, formatJsonForDisplay } from './json-utils';
import type { MatchResult } from './types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const ENHANCE_JSON_PROMPT = `You are an intelligent JSON enhancement system. Your task is to enrich the provided JSON with additional meaningful details while maintaining its original structure and learned context.

Instructions:
1. Analyze the original JSON structure and existing values
2. Identify the domain and context from the data
3. Add or enhance properties with meaningful, contextual details
4. Maintain the exact same structure and property names
5. Ensure all additions are factually relevant and logically connected
6. Preserve all original values and only add/enhance where appropriate
7. Keep the same data types for existing properties

Example: If the JSON contains wine data from Okanagan Valley, you might add details about:
- Terroir characteristics
- Climate conditions
- Typical grape varieties
- Regional wine-making practices
- Seasonal patterns
But only if these are logically connected to the existing data.

Return the enhanced JSON object maintaining the original structure.`;

export async function enhanceJson(
  jsonString: string,
  matches: MatchResult[]
): Promise<string> {
  try {
    const cleanJson = stripFormatting(jsonString);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ENHANCE_JSON_PROMPT },
        {
          role: 'user',
          content: `Enhance this JSON with meaningful, contextual details:

Original JSON with applied matches:
${cleanJson}

Context from matches:
${JSON.stringify(matches, null, 2)}

Return ONLY a valid JSON object with no additional text or explanation.`
        }
      ],
      temperature: 0.7,
    });

    const enhancedJson = response.choices[0].message.content;
    if (!enhancedJson) {
      throw new Error('No response from OpenAI');
    }

    return formatJsonForDisplay(enhancedJson);
  } catch (error) {
    console.error('Error enhancing JSON:', error);
    throw new Error('Failed to enhance JSON. Please try again.');
  }
}

const UPDATE_JSON_PROMPT = `You are a precise JSON updating system. Your task is to update an existing JSON structure with new values while maintaining the original structure.

Instructions:
1. Use the original JSON as the base structure
2. Update only the properties that have matches
3. Remove all other properties and their values 
4. Maintain the exact same structure and nesting
5. Ensure type consistency for updated values
6. Return the complete updated JSON structure

Format the response as a valid JSON object that matches the original structure with updates applied.`;

export async function updateJsonWithMatches(
  jsonString: string,
  matches: MatchResult[]
): Promise<string> {
  try {
    if (!matches?.length) {
      return formatJsonForDisplay(jsonString);
    }

    // Filter matches with confidence >= 30%
    const validMatches = matches
      .filter(match => match.confidence >= 30)
      .sort((a, b) => b.confidence - a.confidence);

    if (validMatches.length === 0) {
      return formatJsonForDisplay(jsonString);
    }

    // Prepare the matches in a more structured format for the LLM
    const matchData = validMatches.map(match => ({
      property: match.property,
      value: match.matchedText.trim(),
      confidence: match.confidence,
      matchType: match.matchType
    }));

    try {
      // Clean the input JSON
      const cleanJson = stripFormatting(jsonString);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: UPDATE_JSON_PROMPT },
          {
            role: 'user',
            content: `Update this JSON structure with the following matches:

Original JSON:
${cleanJson}

Matches to apply (only apply matches with confidence >= 30%):
${JSON.stringify(matchData, null, 2)}

Return only the updated JSON structure, ensuring all original properties are preserved and only matched properties are updated. Maintain exact types of values.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const updatedJson = response.choices[0].message.content;
      if (!updatedJson) {
        throw new Error('No response from OpenAI');
      }

      // Validate the updated JSON
      const { isValid, formatted, error } = validateAndFormatJson(updatedJson);
      if (!isValid || error) {
        console.error('Invalid JSON response from OpenAI:', error);
        return formatJsonForDisplay(jsonString);
      }

      // Return the formatted version for display
      return formatted || formatJsonForDisplay(updatedJson);

    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to update JSON using AI. Please try again.');
    }
  } catch (error) {
    console.error('Error updating JSON:', error);
    return formatJsonForDisplay(jsonString);
  }
}

export function validateJsonUpdates(
  original: string,
  updated: string
): { isValid: boolean; error?: string } {
  try {
    const originalObj = JSON.parse(original);
    const updatedObj = JSON.parse(updated);

    // Validate structure consistency
    const validateStructure = (orig: any, upd: any, path: string = ''): string | null => {
      if (typeof orig !== typeof upd) {
        return `Type mismatch at ${path || 'root'}`;
      }

      if (Array.isArray(orig) !== Array.isArray(upd)) {
        return `Array structure mismatch at ${path || 'root'}`;
      }

      if (typeof orig === 'object' && orig !== null) {
        for (const key in orig) {
          if (!(key in upd)) {
            return `Missing property "${key}" at ${path || 'root'}`;
          }
          const result = validateStructure(orig[key], upd[key], path ? `${path}.${key}` : key);
          if (result) return result;
        }
      }

      return null;
    };

    const structureError = validateStructure(originalObj, updatedObj);
    if (structureError) {
      return { isValid: false, error: structureError };
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON structure' 
    };
  }
}