import { fabric } from 'fabric';
import { useFabricJSEditor, FabricJSCanvas } from 'fabricjs-react';
import { useSession } from 'next-auth/react';
import React, { useState, useCallback, useEffect } from 'react';
import NextImage from 'next/future/image';
import { usePlausible } from 'next-plausible';

interface PropsType {
  [key: string]: string;
}

const DiscordProfile = ({ avatarURL, hatURL }: PropsType) => {
  const { status } = useSession();
  const { editor, onReady: init } = useFabricJSEditor();
  const [avatarImage, setAvatarImage] = useState('');
  const plausible = usePlausible();

  // Canvas dimensions
  const canvasSize = 640 as const;
  const innerCanvasSize = 512 as const;

  // Create a rectangle to display the boundary of the "rendered" canvas
  const boundaryRect = new fabric.Rect().set({
    height: innerCanvasSize + 4,
    width: innerCanvasSize + 4,
    left: (canvasSize - innerCanvasSize) / 2 - 4,
    top: (canvasSize - innerCanvasSize) / 2 - 4,
    selectable: false,
    evented: false,
    fill: 'transparent',
    hoverCursor: 'default',
    stroke: '#7289da',
    strokeDashArray: [16, 16],
    strokeWidth: 4,
  });

  const addHat = useCallback(() => {
    const image = new Image();
    image.src = hatURL ?? '';
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
      editor?.canvas.add(hat);
      updateAvatar();
      hat.sendBackwards();
      updateAvatar();
      boundaryRect.bringForward();
    };
  }, [hatURL, status]);

  // Create an image with the user's profile picture
  const addAvatar = useCallback(() => {
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
      avatar.sendToBack();
      editor?.canvas.add(avatar);
      updateAvatar();
      addHat();
      updateAvatar();
      boundaryRect.bringToFront();
      editor?.canvas.add(boundaryRect);
      updateAvatar();
    };
  }, [avatarURL, status]);

  const updateAvatar = useCallback(() => {
    setAvatarImage(
      editor?.canvas.toDataURL({
        format: 'png',
        height: innerCanvasSize,
        width: innerCanvasSize,
        left: (canvasSize - innerCanvasSize) / 2,
        top: (canvasSize - innerCanvasSize) / 2,
        quality: 1,
      }) ?? '/default.png'
    );
  }, [avatarURL, status]);

  useEffect(() => {
    addAvatar();
    editor?.canvas.on('object:modified', () => {
      updateAvatar();
    });
  }, [avatarURL, status]);

  const onReady = (canvas: fabric.Canvas) => {
    canvas.selection = false;
    canvas.setBackgroundColor('#23272a', canvas.renderAll.bind(canvas));
    canvas.preserveObjectStacking = true;
    init(canvas);
  };

  const onClick = () => {
    plausible('download');
    updateAvatar();
  };

  return (
    <>
      <h2 className="text-2xl">Customize Your Hat</h2>
      <FabricJSCanvas className="w-[640px] h-[640px]" onReady={onReady} />
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
