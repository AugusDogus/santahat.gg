"use client";

import { useEffect, useState, useRef, type RefObject } from "react";
import * as fabric from "fabric";

interface UseFabricCanvasOptions {
  width: number;
  height: number;
  backgroundColor?: string;
}

export function useFabricCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: UseFabricCanvasOptions
) {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || initializedRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor ?? "transparent",
      selection: false,
    });

    initializedRef.current = true;
    setCanvas(fabricCanvas);

    return () => {
      void fabricCanvas.dispose();
      initializedRef.current = false;
    };
  }, [canvasRef, options.width, options.height, options.backgroundColor]);

  return canvas;
}

