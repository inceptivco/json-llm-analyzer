import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { MatchResult } from '@/lib/types';

interface AnalysisResultsProps {
  results: MatchResult[];
  originalText: string;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return 'bg-green-500';
  if (confidence >= 60) return 'bg-blue-500';
  if (confidence >= 30) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function AnalysisResults({ results, originalText }: AnalysisResultsProps) {
  const sortedResults = [...results].sort((a, b) => b.confidence - a.confidence);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {sortedResults.map((match, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{match.property}</Badge>
                  <Badge className={getConfidenceColor(match.confidence)}>
                    {match.confidence}%
                  </Badge>
                  <Badge variant="secondary">{match.matchType}</Badge>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <p className="font-mono text-sm">
                    {originalText.substring(0, match.position.start)}
                    <span className="bg-primary/20 px-1">
                      {match.matchedText}
                    </span>
                    {originalText.substring(match.position.end)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}