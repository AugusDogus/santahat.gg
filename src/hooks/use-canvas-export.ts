"use client";

import { useCallback } from "react";
import type * as fabric from "fabric";

interface ExportOptions {
  format?: "png" | "jpeg";
  quality?: number;
  multiplier?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

export function useCanvasExport(canvas: fabric.Canvas | null) {
  const exportCanvas = useCallback(
    (options: ExportOptions = {}) => {
      if (!canvas) return null;

      const {
        format = "png",
        quality = 1,
        multiplier = 1,
        left,
        top,
        width,
        height,
      } = options;

      return canvas.toDataURL({
        format,
        quality,
        multiplier,
        left,
        top,
        width,
        height,
      });
    },
    [canvas]
  );

  const downloadCanvas = useCallback(
    (filename: string, options: ExportOptions = {}) => {
      const dataUrl = exportCanvas(options);
      if (!dataUrl) return;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [exportCanvas]
  );

  return { exportCanvas, downloadCanvas };
}

