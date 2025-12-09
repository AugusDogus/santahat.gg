"use client";

import { Download } from "lucide-react";
import { AvatarPreview } from "~/components/avatar-preview";
import { Button } from "~/components/ui/button";
import { useFabricCanvas } from "~/hooks/use-fabric-canvas";

interface AvatarCanvasProps {
  avatarUrl: string;
  hatUrl: string;
}

export function AvatarCanvas({ avatarUrl, hatUrl }: AvatarCanvasProps) {
  const { canvasRef, previewUrl, handleDownload } = useFabricCanvas({
    avatarUrl,
    hatUrl,
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="rounded-lg" />
      <AvatarPreview previewUrl={previewUrl} />
      <Button onClick={handleDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Download
      </Button>
    </div>
  );
}
