import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface MessageModalProps {
  message: string | null;
  onDismiss: () => void;
}

export function MessageModal({ message, onDismiss }: MessageModalProps) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          className="bg-card rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-accent/30 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-2xl font-bold mb-4">{message}</p>
          <Button onClick={onDismiss} className="rounded-full px-8">
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
