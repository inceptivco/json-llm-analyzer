import { validateAndFormatJson, stripFormatting, formatJsonForDisplay } from './json-utils';
import type { MatchResult } from './types';
import { AIServiceFactory } from './ai-service';

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

const UPDATE_JSON_PROMPT = `You are a precise JSON updating system. Your task is to update an existing JSON structure with new values while maintaining the original structure.

Instructions:
1. Use the original JSON as the base structure
2. Update only the properties that have matches
3. Remove all other properties and their values 
4. Maintain the exact same structure and nesting
5. Ensure type consistency for updated values
6. Return the complete updated JSON structure

Format the response as a valid JSON object that matches the original structure with updates applied.`;

export async function enhanceJson(
  jsonString: string,
  matches: MatchResult[]
): Promise<string> {
  try {
    const cleanJson = stripFormatting(jsonString);
    const aiService = AIServiceFactory.getInstance();

    const response = await aiService.createCompletion([
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
    ], { temperature: 0.7 });

    const enhancedJson = response.choices[0].message.content;
    if (!enhancedJson) {
      throw new Error('No response from AI service');
    }

    return formatJsonForDisplay(enhancedJson);
  } catch (error) {
    console.error('Error enhancing JSON:', error);
    throw new Error('Failed to enhance JSON. Please try again.');
  }
}

export async function updateJsonWithMatches(
  jsonString: string,
  matches: MatchResult[]
): Promise<string> {
  try {
    if (!matches?.length) {
      return formatJsonForDisplay(jsonString);
    }

    const validMatches = matches
      .filter(match => match.confidence >= 30)
      .sort((a, b) => b.confidence - a.confidence);

    if (validMatches.length === 0) {
      return formatJsonForDisplay(jsonString);
    }

    // First, parse the original JSON
    const jsonObj = JSON.parse(stripFormatting(jsonString));

    // Apply the matches directly to the JSON object
    validMatches.forEach(match => {
      const propertyPath = match.property.split('.');
      let current = jsonObj;
      
      // Navigate to the nested property
      for (let i = 0; i < propertyPath.length - 1; i++) {
        if (current[propertyPath[i]] === undefined) {
          current[propertyPath[i]] = {};
        }
        current = current[propertyPath[i]];
      }

      // Update the value, maintaining the correct type
      const lastProp = propertyPath[propertyPath.length - 1];
      const currentValue = current[lastProp];
      const newValue = match.matchedText.trim();

      // Type conversion based on the original value's type
      if (typeof currentValue === 'number') {
        current[lastProp] = Number(newValue) || currentValue;
      } else if (typeof currentValue === 'boolean') {
        current[lastProp] = newValue.toLowerCase() === 'true';
      } else {
        current[lastProp] = newValue;
      }
    });

    // Format the updated JSON for display
    return formatJsonForDisplay(JSON.stringify(jsonObj, null, 2));

  } catch (error) {
    console.error('Error updating JSON:', error);
    return formatJsonForDisplay(jsonString);
  }
}