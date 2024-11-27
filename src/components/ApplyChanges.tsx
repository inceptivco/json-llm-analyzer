import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { validateAndFormatJson, stripFormatting } from '@/lib/json-utils';
import { Copy, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MatchResult } from '@/lib/types';
import { enhanceJson } from '@/lib/json-service'; 

interface ApplyChangesProps {
  originalJson: string;
  updatedJson: string;
  matches: MatchResult[];
}

export function ApplyChanges({ originalJson, updatedJson, matches }: ApplyChangesProps) {
  const [formattedJson, setFormattedJson] = useState('');
  const [rawJson, setRawJson] = useState('');
  const [, setError] = useState<string>();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const validMatches = matches.filter(match => match.confidence >= 30);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const cleanJson = stripFormatting(updatedJson);
      const { formatted, isValid, error, raw } = validateAndFormatJson(cleanJson);
      
      if (isValid && formatted) {
        setFormattedJson(formatted);
        setRawJson(raw || cleanJson);
        setError(undefined);
      } else if (error) {
        setError(error.message);
        const { formatted: originalFormatted, raw: originalRaw } = validateAndFormatJson(originalJson);
        setFormattedJson(originalFormatted || originalJson);
        setRawJson(originalRaw || originalJson);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to format JSON');
      setFormattedJson(originalJson);
      setRawJson(originalJson);
    }
  }, [updatedJson, originalJson]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawJson);
      toast({
        description: "JSON copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy JSON",
        duration: 2000,
      });
    }
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceJson(rawJson, validMatches);
      setFormattedJson(enhanced);
      setRawJson(stripFormatting(enhanced));
      toast({
        description: "JSON enhanced successfully",
        duration: 2000,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : "Failed to enhance JSON",
        duration: 2000,
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Applied Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {validMatches.map((match, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{match.property}</Badge>
                    <Badge variant="secondary">{match.confidence}% confidence</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Updated with: <code className="text-primary">{match.matchedText}</code>
                  </p>
                </div>
              ))}
              {validMatches.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No changes were applied (no matches with confidence ≥ 70%)
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Updated JSON</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnhance}
              disabled={isEnhancing}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {isEnhancing ? "Enhancing..." : "Enhance"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <pre
              className="p-4 font-mono text-sm"
              dangerouslySetInnerHTML={{ __html: formattedJson }}
            />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}