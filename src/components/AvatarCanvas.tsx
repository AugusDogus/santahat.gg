import { fabric } from 'fabric';
import { Canvas } from 'fabric/fabric-impl';
import { useSession } from 'next-auth/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import { usePlausible } from 'next-plausible';
import useWindowSize from '../hooks/useWindowSize';

interface PropsType {
  [key: string]: string;
}

const AvatarCanvas = ({ avatarURL, hatURL }: PropsType) => {
  const { data: sessionData, status } = useSession();
  const canvasElem = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas>();
  const [avatarImage, setAvatarImage] = useState('');
  const [fabricHat, setFabricHat] = useState<fabric.Image>();
  const [fabricAvatar, setFabricAvatar] = useState<fabric.Image>();
  const [fabricRectangle, setFabricRectangle] = useState<fabric.Rect>();
  const { width } = useWindowSize();
  const plausible = usePlausible();

  const updateAvatar = useCallback((canvasSize: number, innerCanvasSize: number, canvas: Canvas) => {
    setAvatarImage(
      canvas.toDataURL({
        format: 'png',
        height: innerCanvasSize,
        width: innerCanvasSize,
        left: (canvasSize - innerCanvasSize) / 2,
        top: (canvasSize - innerCanvasSize) / 2,
        quality: 1,
      })
    );
  }, []);

  const scaleFactor = 0.25;

  useEffect(() => {
    if (width && canvas && fabricHat && fabricAvatar && fabricRectangle) {
      const canvasSize = Math.max(width * scaleFactor, 320);
      const canvasMarginMultiplier = 0.75;
      const innerCanvasSize = canvasSize * canvasMarginMultiplier

      canvas.setHeight(canvasSize).setWidth(canvasSize);

      if (fabricRectangle) {
        fabricRectangle.scaleToWidth(innerCanvasSize + 4).set({
          left: (canvasSize - innerCanvasSize) / 2 - 4,
          top: (canvasSize - innerCanvasSize) / 2 - 4,
        });
      }

      if (fabricAvatar) {
        fabricAvatar.scaleToWidth(innerCanvasSize).set({
          left: (canvasSize - innerCanvasSize) / 2,
          top: (canvasSize - innerCanvasSize) / 2,
        });
      }

      const adjustedSize = (innerCanvasSize * 3) / 3.33;
      if (fabricHat) {
        fabricHat.scaleToWidth((innerCanvasSize * 3) / 3.33).set({
          left:
            canvasSize -
            (canvasSize - innerCanvasSize) / 2 -
            adjustedSize +
            innerCanvasSize / 15,
          top: (canvasSize - innerCanvasSize) / 2 - innerCanvasSize / 8,
        })
      }
      canvas.renderAll();
      updateAvatar(canvasSize, innerCanvasSize, canvas);
    }
  }, [width, fabricHat, canvas, fabricAvatar, fabricRectangle, updateAvatar])

  useEffect(() => {
    if (status !== 'loading' && canvasElem.current && width) {
      const canvasSize = Math.max(width * scaleFactor, 320);
      const canvasMarginMultiplier = 0.75;
      const innerCanvasSize = canvasSize * canvasMarginMultiplier

      if (!canvas && !fabricHat && !fabricAvatar && !fabricRectangle) {
        const _canvas = new fabric.Canvas(canvasElem.current, {
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
        setFabricRectangle(rect);
        _canvas.add(rect);

        if (avatarURL) {
          const image = new Image();
          image.src = `${avatarURL}?size=512`;
          image.crossOrigin = 'anonymous';
          image.onload = () => {
            const _avatar = new fabric.Image(image);
            _avatar.set({
              left: (canvasSize - innerCanvasSize) / 2,
              top: (canvasSize - innerCanvasSize) / 2,
              scaleX: innerCanvasSize / image.width,
              scaleY: innerCanvasSize / image.width,
              selectable: false,
              hoverCursor: 'default',
            });
            setFabricAvatar(_avatar);
            _canvas.add(_avatar);
            _avatar.sendBackwards();

          };
        }

        const adjustedSize = (innerCanvasSize * 3) / 3.33;
        if (hatURL) {
          const image = new Image();
          image.src = hatURL;
          image.crossOrigin = 'anonymous';
          image.onload = () => {
            const _hat = new fabric.Image(image, {
              left:
                canvasSize -
                (canvasSize - innerCanvasSize) / 2 -
                adjustedSize +
                innerCanvasSize / 15,
              top: (canvasSize - innerCanvasSize) / 2 - innerCanvasSize / 8,
              borderColor: '#00ee76',
              borderOpacityWhenMoving: 1,
              borderScaleFactor: 1.5,
              cornerColor: '#00ee76',
              cornerSize: 24,
              transparentCorners: true,
            }).scaleToWidth(adjustedSize);
            setFabricHat(_hat);
            _canvas.add(_hat);
            _hat.bringToFront();
          };
        }
        setCanvas(_canvas);
        _canvas.renderAll();
        updateAvatar(canvasSize, innerCanvasSize, _canvas);
      }
    }
  }, [avatarURL, canvas, fabricAvatar, fabricHat, fabricRectangle, hatURL, status, updateAvatar, width]);

  useEffect(() => {
    if (canvas && width) {
      const canvasSize = Math.max(width * scaleFactor, 320);
      const canvasMarginMultiplier = 0.75;
      const innerCanvasSize = canvasSize * canvasMarginMultiplier

      canvas.on('object:added', () => {
        updateAvatar(canvasSize, innerCanvasSize, canvas);
        canvas.renderAll();
      });

      canvas.on('object:modified', () => {
        canvas.renderAll();
        updateAvatar(canvasSize, innerCanvasSize, canvas);
      });

    }

    return () => {
      if (canvas) {
        canvas.off('object:added');
        canvas.off('object:modified');
      }
    };
  }, [canvas, status, updateAvatar, width]);

  const onClick = () => {
    plausible('download', { props: { avatarImage, sessionData } });
  };

  return (
    <>
      <canvas ref={canvasElem} />
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

export default AvatarCanvas;