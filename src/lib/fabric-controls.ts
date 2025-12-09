import * as fabric from "fabric";

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

  ctx.fillStyle = "#5865F2";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const icon = getRotateIcon();
  if (icon) {
    const iconSize = 12;
    ctx.drawImage(icon, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
  }

  ctx.restore();
}

export function createBoundedRotationControl(
  canvasSize: number,
): fabric.Control {
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

