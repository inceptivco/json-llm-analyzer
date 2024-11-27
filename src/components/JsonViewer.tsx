import { ScrollArea } from '@/components/ui/scroll-area';

interface JsonViewerProps {
  content: string;
}

export function JsonViewer({ content }: JsonViewerProps) {
  return (
    <div className="h-full rounded-lg bg-zinc-900 p-4">
      <ScrollArea className="h-full">
        <pre className="font-mono text-sm">
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: content || '' }}
          />
        </pre>
      </ScrollArea>
    </div>
  );
}