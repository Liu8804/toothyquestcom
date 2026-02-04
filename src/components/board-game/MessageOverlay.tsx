import { Button } from '@/components/ui/button';

interface MessageOverlayProps {
  message: string;
  onDismiss: () => void;
}

export function MessageOverlay({ message, onDismiss }: MessageOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-primary/30 text-center animate-in zoom-in-95 duration-300">
        <p className="text-xl sm:text-2xl font-bold mb-6">
          {message}
        </p>
        
        <Button
          onClick={onDismiss}
          className="rounded-full px-8 py-6 text-lg font-bold"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
