import { Button } from "@/components/ui/button";

export type VolumePresetKey = "low" | "medium" | "high";

export interface VolumePresetValues {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
}

export const VOLUME_PRESETS: Record<VolumePresetKey, VolumePresetValues> = {
  low: { masterVolume: 40, sfxVolume: 25, musicVolume: 20 },
  medium: { masterVolume: 70, sfxVolume: 50, musicVolume: 40 },
  high: { masterVolume: 100, sfxVolume: 75, musicVolume: 60 },
};

const isSamePreset = (a: VolumePresetValues, b: VolumePresetValues) => {
  return (
    a.masterVolume === b.masterVolume &&
    a.sfxVolume === b.sfxVolume &&
    a.musicVolume === b.musicVolume
  );
};

interface VolumePresetsProps {
  values: VolumePresetValues;
  disabled?: boolean;
  onSelectPreset: (preset: VolumePresetKey) => void;
}

export const VolumePresets = ({ values, disabled, onSelectPreset }: VolumePresetsProps) => {
  const active = (Object.keys(VOLUME_PRESETS) as VolumePresetKey[]).find((key) =>
    isSamePreset(values, VOLUME_PRESETS[key])
  );

  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-foreground">Volume preset</div>
        <div className="text-xs text-muted-foreground">Low • Medium • High</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant={active === "low" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => onSelectPreset("low")}
          disabled={disabled}
        >
          Low
        </Button>
        <Button
          type="button"
          variant={active === "medium" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => onSelectPreset("medium")}
          disabled={disabled}
        >
          Medium
        </Button>
        <Button
          type="button"
          variant={active === "high" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => onSelectPreset("high")}
          disabled={disabled}
        >
          High
        </Button>
      </div>
    </div>
  );
};

export default VolumePresets;
