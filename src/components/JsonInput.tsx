import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function JsonInput({ value, onChange, error }: JsonInputProps) {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text');
      if (text) {
        try {
          // Ensure we're working with raw JSON
          const parsed = JSON.parse(text);
          onChange(JSON.stringify(parsed));
        } catch {
          // If parsing fails, pass the text as-is
          onChange(text);
        }
      }
    };

    const pre = preRef.current;
    pre?.addEventListener('paste', handlePaste);

    return () => {
      pre?.removeEventListener('paste', handlePaste);
    };
  }, [onChange]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">JSON Structure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative min-h-[400px] rounded-md bg-muted">
          <ScrollArea className="h-[400px]">
            <pre
              ref={preRef}
              className="p-4 font-mono text-sm"
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => onChange(e.currentTarget.textContent || '')}
              dangerouslySetInnerHTML={{ 
                __html: value || 'Paste your JSON structure here...'
              }}
            />
          </ScrollArea>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}