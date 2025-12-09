"use client";

import * as fabric from "fabric";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useWindowSize } from "~/hooks/use-window-size";
import { createBoundedRotationControl } from "~/lib/fabric-controls";

const SCALE_FACTOR = 0.25;
const MIN_SIZE = 320;
const CANVAS_MARGIN = 0.75;
const BG_DARK = "#23272a";
const BG_LIGHT = "#e5e5e5";

interface UseFabricCanvasOptions {
  avatarUrl: string;
  hatUrl: string;
}

interface UseFabricCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  previewUrl: string;
  handleDownload: () => void;
}

export function useFabricCanvas({
  avatarUrl,
  hatUrl,
}: UseFabricCanvasOptions): UseFabricCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstanceRef = useRef<fabric.Canvas | null>(null);
  const hatObjectRef = useRef<fabric.FabricImage | null>(null);
  const avatarObjectRef = useRef<fabric.FabricImage | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string>("/default.png");
  const { width } = useWindowSize();
  const { resolvedTheme } = useTheme();

  const bgColor = resolvedTheme === "dark" ? BG_DARK : BG_LIGHT;

  const getCanvasSize = useCallback(() => {
    if (!width) return MIN_SIZE;
    return Math.max(width * SCALE_FACTOR, MIN_SIZE);
  }, [width]);

  const updatePreview = useCallback(() => {
    const canvas = canvasInstanceRef.current;
    if (!canvas) return;

    const canvasSize = getCanvasSize();
    const innerSize = canvasSize * CANVAS_MARGIN;
    const offset = (canvasSize - innerSize) / 2;

    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
      left: offset,
      top: offset,
      width: innerSize,
      height: innerSize,
    });

    setPreviewUrl(dataUrl);
  }, [getCanvasSize]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || canvasInstanceRef.current) return;

    const canvasSize = getCanvasSize();
    const innerSize = canvasSize * CANVAS_MARGIN;
    const offset = (canvasSize - innerSize) / 2;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize,
      height: canvasSize,
      backgroundColor: BG_DARK,
      selection: false,
    });

    canvasInstanceRef.current = canvas;

    const borderRect = new fabric.Rect({
      width: innerSize + 4,
      height: innerSize + 4,
      left: offset - 4,
      top: offset - 4,
      fill: "transparent",
      stroke: "#5865f2",
      strokeWidth: 4,
      strokeDashArray: [16, 16],
      selectable: false,
      hoverCursor: "default",
    });
    canvas.add(borderRect);
    canvas.on("object:modified", updatePreview);

    return () => {
      void canvas.dispose();
      canvasInstanceRef.current = null;
    };
  }, [getCanvasSize, updatePreview]);

  // Load avatar image
  useEffect(() => {
    const canvas = canvasInstanceRef.current;
    if (!canvas || !avatarUrl) return;

    const canvasSize = getCanvasSize();
    const innerSize = canvasSize * CANVAS_MARGIN;
    const offset = (canvasSize - innerSize) / 2;

    if (avatarObjectRef.current) {
      canvas.remove(avatarObjectRef.current);
    }

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = avatarUrl.includes("?") ? avatarUrl : `${avatarUrl}?size=512`;

    img.onload = () => {
      const fabricImg = new fabric.FabricImage(img, {
        left: offset,
        top: offset,
        scaleX: innerSize / img.width,
        scaleY: innerSize / img.height,
        selectable: false,
        hoverCursor: "default",
      });

      avatarObjectRef.current = fabricImg;
      canvas.add(fabricImg);
      canvas.sendObjectToBack(fabricImg);
      canvas.renderAll();
      updatePreview();
    };
  }, [avatarUrl, getCanvasSize, updatePreview]);

  // Load hat image
  useEffect(() => {
    const canvas = canvasInstanceRef.current;
    if (!canvas || !hatUrl) return;

    const canvasSize = getCanvasSize();
    const innerSize = canvasSize * CANVAS_MARGIN;
    const offset = (canvasSize - innerSize) / 2;
    const hatSize = (innerSize * 3) / 3.33;

    if (hatObjectRef.current) {
      canvas.remove(hatObjectRef.current);
      hatObjectRef.current = null;
    }

    let aborted = false;

    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = hatUrl;

    img.onload = () => {
      if (aborted) return;

      const fabricImg = new fabric.FabricImage(img, {
        left: canvasSize - offset - hatSize + innerSize / 15,
        top: offset - innerSize / 8,
        scaleX: hatSize / img.width,
        scaleY: hatSize / img.width,
        borderColor: "#57f287",
        cornerColor: "#57f287",
        cornerSize: 16,
        transparentCorners: true,
      });

      fabricImg.controls.mtr = createBoundedRotationControl(canvasSize);

      hatObjectRef.current = fabricImg;
      canvas.add(fabricImg);
      canvas.bringObjectToFront(fabricImg);
      canvas.setActiveObject(fabricImg);
      canvas.renderAll();
      updatePreview();
    };

    return () => {
      aborted = true;
    };
  }, [hatUrl, getCanvasSize, updatePreview]);

  // Update background color
  useEffect(() => {
    const canvas = canvasInstanceRef.current;
    if (!canvas) return;

    canvas.backgroundColor = bgColor;
    canvas.renderAll();
    updatePreview();
  }, [bgColor, updatePreview]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasInstanceRef.current;
    if (!canvas || !width) return;

    const canvasSize = getCanvasSize();
    const innerSize = canvasSize * CANVAS_MARGIN;
    const offset = (canvasSize - innerSize) / 2;

    canvas.setDimensions({ width: canvasSize, height: canvasSize });

    const objects = canvas.getObjects();
    const borderRect = objects.find(
      (obj) => obj instanceof fabric.Rect && !obj.selectable,
    );
    if (borderRect) {
      borderRect.set({
        width: innerSize + 4,
        height: innerSize + 4,
        left: offset - 4,
        top: offset - 4,
      });
    }

    if (avatarObjectRef.current) {
      const avatarImg = avatarObjectRef.current;
      const originalWidth = avatarImg.width ?? innerSize;
      avatarObjectRef.current.set({
        left: offset,
        top: offset,
        scaleX: innerSize / originalWidth,
        scaleY: innerSize / originalWidth,
      });
    }

    canvas.renderAll();
    updatePreview();
  }, [width, getCanvasSize, updatePreview]);

  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.download = "avatar.png";
    link.href = previewUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [previewUrl]);

  return {
    canvasRef,
    previewUrl,
    handleDownload,
  };
}
