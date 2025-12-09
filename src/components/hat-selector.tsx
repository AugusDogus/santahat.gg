"use client";

import { Upload, X } from "lucide-react";
import { useRef } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const PRESET_HATS = [
  { id: "christmas", name: "Santa Hat", src: "/hats/christmas.png" },
  { id: "osrs", name: "OSRS Hat", src: "/hats/osrs.png" },
] as const;

interface HatSelectorProps {
  selectedHat: string;
  customHat: string | null;
  onSelectHat: (hatUrl: string, isCustom?: boolean) => void;
  onDeleteCustomHat: () => void;
}

export function HatSelector({
  selectedHat,
  customHat,
  onSelectHat,
  onDeleteCustomHat,
}: HatSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        onSelectHat(result, true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div className="flex justify-center gap-2 overflow-x-auto p-2">
        {PRESET_HATS.map((hat) => (
          <button
            key={hat.id}
            onClick={() => onSelectHat(hat.src)}
            className={cn(
              "bg-muted/50 hover:bg-muted flex h-20 w-20 shrink-0 items-center justify-center rounded-lg p-2 transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-[#5865F2]/50",
              selectedHat === hat.src && "ring-2 ring-[#5865F2]",
            )}
            title={hat.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hat.src}
              alt={hat.name}
              className="h-full w-full object-contain"
            />
          </button>
        ))}

        {customHat && (
          <div className="group relative h-20 w-20 shrink-0">
            <button
              onClick={() => onSelectHat(customHat, true)}
              className={cn(
                "bg-muted/50 hover:bg-muted flex h-full w-full items-center justify-center rounded-lg p-2 transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-[#5865F2]/50",
                selectedHat === customHat && "ring-2 ring-[#5865F2]",
              )}
              title="Custom Hat"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customHat}
                alt="Custom Hat"
                className="h-full w-full object-contain"
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCustomHat();
              }}
              className="bg-foreground text-background hover:bg-foreground/80 absolute -top-1 -right-1 rounded-full p-0.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
              title="Remove custom hat"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <Button
          variant="outline"
          className="h-20 w-20 shrink-0 flex-col gap-1 p-2"
          onClick={handleUploadClick}
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs">Upload</span>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <p className="text-muted-foreground mt-2 text-center text-xs">
        Upload your own hat image
        <br />
        (PNG with transparency recommended)
      </p>
    </div>
  );
}
