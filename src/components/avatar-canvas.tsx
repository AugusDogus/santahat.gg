"use client";

import * as fabric from "fabric";
import { Download } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { useWindowSize } from "~/hooks/use-window-size";

const rotateIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`;

let rotateIconImg: HTMLImageElement | null = null;
function getRotateIcon(): HTMLImageElement | null {
  if (typeof window === "undefined") return null;
  if (!rotateIconImg) {
    rotateIconImg = document.createElement("img");
    rotateIconImg.src = `data:image/svg+xml;base64,${btoa(rotateIconSvg)}`;
  }
  return rotateIconImg;
}

function renderCircleControl(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
) {
  const size = 20;
  ctx.save();
  ctx.translate(left, top);

  // Draw circle background with white outline
  ctx.fillStyle = "#5865F2";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Draw the Lucide rotate-cw icon
  const icon = getRotateIcon();
  if (icon) {
    const iconSize = 12;
    ctx.drawImage(icon, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
  }

  ctx.restore();
}

function createBoundedRotationControl(canvasSize: number): fabric.Control {
  return new fabric.Control({
    x: 0,
    y: -0.5,
    offsetY: -40,
    cursorStyle: "grab",
    actionHandler: fabric.controlsUtils.rotationWithSnapping,
    actionName: "rotate",
    render: renderCircleControl,
    positionHandler: function (dim, finalMatrix, fabricObject, currentControl) {
      const defaultPos = fabric.Control.prototype.positionHandler.call(
        this,
        dim,
        finalMatrix,
        fabricObject,
        currentControl,
      );

      const padding = 24;
      return new fabric.Point(
        Math.max(padding, Math.min(canvasSize - padding, defaultPos.x)),
        Math.max(padding, Math.min(canvasSize - padding, defaultPos.y)),
      );
    },
  });
}

interface AvatarCanvasProps {
  avatarUrl: string;
  hatUrl: string;
}

const SCALE_FACTOR = 0.25;
const MIN_SIZE = 320;
const CANVAS_MARGIN = 0.75;
const BG_DARK = "#23272a";
const BG_LIGHT = "#e5e5e5";

export function AvatarCanvas({ avatarUrl, hatUrl }: AvatarCanvasProps) {
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

  useEffect(() => {
    const canvas = canvasInstanceRef.current;
    if (!canvas) return;

    canvas.backgroundColor = bgColor;
    canvas.renderAll();
    updatePreview();
  }, [bgColor, updatePreview]);

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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = "avatar.png";
    link.href = previewUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="rounded-lg" />

      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold">Preview</h3>
        <div className="flex gap-3">
          <Image
            src={previewUrl}
            alt="Square preview"
            width={96}
            height={96}
            className="border-border border"
          />
          <Image
            src={previewUrl}
            alt="Round preview"
            width={96}
            height={96}
            className="border-border rounded-full border"
          />
        </div>
      </div>

      <Button onClick={handleDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Download
      </Button>
    </div>
  );
}
