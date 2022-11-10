import { fabric } from 'fabric';
import { Canvas } from 'fabric/fabric-impl';

import { useSession } from 'next-auth/react';
import React, { useState, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { usePlausible } from 'next-plausible';

interface PropsType {
  [key: string]: string;
}

const DiscordProfile = ({ avatarURL, hatURL }: PropsType) => {
  const { data: sessionData, status } = useSession();
  const [avatarImage, setAvatarImage] = useState('');
  const plausible = usePlausible();

  const updateAvatar = useCallback((canvasSize: number, innerCanvasSize: number, canvas: Canvas) => {
    if (canvas) {
      setAvatarImage(
        canvas.toDataURL({
          format: 'png',
          height: innerCanvasSize,
          width: innerCanvasSize,
          left: (canvasSize - innerCanvasSize) / 2,
          top: (canvasSize - innerCanvasSize) / 2,
          quality: 1,
        }) ?? '/default.png'
      );
    }
  }, []);

  useEffect(() => {
    if (status !== 'loading') initCanvas(updateAvatar, avatarURL, hatURL);
  }, [avatarURL, hatURL, updateAvatar, status]);

  const onClick = () => {
    plausible('download', { props: { avatarImage, sessionData } });
  };

  return (
    <>
      <h2 className="text-2xl">Customize Your Hat</h2>
      <canvas id="canvas" />
      <div className="text-center">
        <h3 className="text-2xl">Preview Your Hat</h3>
        <div className="flex space-x-2">
          <NextImage src={avatarImage ? avatarImage : '/default.png'} alt="Preview Square" width={128} height={128} className="rounded-full" />
          <NextImage src={avatarImage ? avatarImage : '/default.png'} alt="Preview Round" width={128} height={128} />
        </div>
      </div>
      <a onClick={onClick} href={avatarImage} download="avatar.png">
        <button className="flex items-center px-2 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform rounded-sm bg-[#5865f2] hover:bg-[#4752c4] focus:bg-[#3c45a5]">
          <span className="mx-1">Download</span>
        </button>
      </a>
    </>
  );
};

export default DiscordProfile;

const initCanvas = (updateAvatar: (canvasSize: number, innerCanvasSize: number, canvas: Canvas) => void, avatarURL?: string, hatURL?: string) => {
  const canvasSize = 640 as const;
  const innerCanvasSize = 512 as const;

  const canvas = new fabric.Canvas('canvas', {
    height: canvasSize,
    width: canvasSize,
    backgroundColor: '#23272a',
  });

  const rect = new fabric.Rect({
    height: innerCanvasSize + 4,
    width: innerCanvasSize + 4,
    left: (canvasSize - innerCanvasSize) / 2 - 4,
    top: (canvasSize - innerCanvasSize) / 2 - 4,
    selectable: false,
    fill: 'transparent',
    hoverCursor: 'default',
    stroke: '#7289da',
    strokeDashArray: [16, 16],
    strokeWidth: 4,
  });
  canvas.add(rect);

  if (avatarURL) {
    const image = new Image();
    image.src = `${avatarURL}?size=512`;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const avatar = new fabric.Image(image);
      avatar.set({
        top: innerCanvasSize / 8,
        left: innerCanvasSize / 8,
        width: 512,
        height: 512,
        scaleX: 1,
        scaleY: 1,
        selectable: false,
        hoverCursor: 'default',
      });
      canvas.add(avatar);
      avatar.sendBackwards();
      updateAvatar(canvasSize, innerCanvasSize, canvas);
      canvas.renderAll();
    };
  }

  if (hatURL) {
    const image = new Image();
    image.src = hatURL;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const hat = new fabric.Image(image, {
        top: -20,
        scaleX: 1.2,
        scaleY: 1.2,
        left: (canvasSize - innerCanvasSize) / 0.95,
        borderColor: '#00ee76',
        borderOpacityWhenMoving: 1,
        borderScaleFactor: 1.5,
        cornerColor: '#00ee76',
        cornerSize: 24,
        transparentCorners: true,
      });
      canvas.add(hat);
      hat.bringToFront();
    };
  }

  canvas.on('object:added', () => {
    updateAvatar(canvasSize, innerCanvasSize, canvas);
  })

  canvas.on('object:modified', () => {
    updateAvatar(canvasSize, innerCanvasSize, canvas)
  })

  return canvas;
};