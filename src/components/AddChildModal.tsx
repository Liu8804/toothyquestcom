import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuestProgress } from "@/hooks/useQuestProgress";
import { Plus, X } from "lucide-react";
import { addChildSchema } from "@/lib/validation";

const AVATAR_OPTIONS = ["😁", "🌟", "🦸", "🧚", "🦋", "🐻", "🐰", "🦊", "🐱", "✨"];

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddChildModal = ({ isOpen, onClose }: AddChildModalProps) => {
  const [name, setName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("😁");
  const [birthYear, setBirthYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addChild } = useQuestProgress();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate input before submission
    const parsedBirthYear = birthYear ? parseInt(birthYear) : undefined;
    const result = addChildSchema.safeParse({
      name,
      avatarEmoji,
      birthYear: parsedBirthYear,
    });

    if (!result.success) {
      setError(result.error.errors[0]?.message || "Validation failed");
      setLoading(false);
      return;
    }

    await addChild(result.data.name, result.data.avatarEmoji, result.data.birthYear);

    setLoading(false);
    setName("");
    setBirthYear("");
    setError("");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card rounded-3xl shadow-float p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Plus className="w-6 h-6 text-primary" />
            Add Child
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="childName">Child's Name</Label>
            <Input
              id="childName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              required
              maxLength={50}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Choose Avatar</Label>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`text-3xl p-3 rounded-xl transition-all ${
                    avatarEmoji === emoji
                      ? "bg-primary/20 ring-2 ring-primary scale-110"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthYear">Birth Year (optional)</Label>
            <Input
              id="birthYear"
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="2018"
              min="2000"
              max={new Date().getFullYear()}
              className="rounded-xl"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || !name}
            className="w-full rounded-xl font-display font-bold"
          >
            {loading ? "Adding..." : "Add Child"}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddChildModal;
