import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { validateAndFormatJson } from '@/lib/json-utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function JsonEditor({ value, onChange, error }: JsonEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text) {
        const { isValid, formatted } = validateAndFormatJson(text);
        if (isValid && formatted) {
          e.preventDefault();
          onChange(text);
        }
      }
    };

    const editor = editorRef.current;
    editor?.addEventListener('paste', handlePaste);

    return () => {
      editor?.removeEventListener('paste', handlePaste);
    };
  }, [onChange]);

  return (
    <div className="h-full rounded-lg bg-zinc-900 p-4">
      <ScrollArea className="h-full">
        <textarea
          ref={editorRef}
          className="h-full w-full resize-none bg-transparent font-mono text-sm text-zinc-100 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your JSON here..."
          spellCheck={false}
        />
      </ScrollArea>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}