/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useCallback } from "react";
import { Stage, Layer, Image, Rect, Circle } from "react-konva";
import Konva from "konva";
import { useKonvaImageEditor } from "../../contexts/konva-image-editor";

const CropImageKonva: React.FC = () => {
  const { setCroppedImgURL } = useKonvaImageEditor();
  const stageRef = useRef<Konva.Stage>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [cropArea, setCropArea] = useState({
    x: 200,
    y: 100,
    width: 200,
    height: 200,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const MIN_SIZE = 50;
  const STAGE_WIDTH = 600;
  const STAGE_HEIGHT = 400;

  // Load sample image
  React.useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src =
      "https://atm232295-s3user.vcos.cloudstorage.com.vn/docs/public/68591fbb1a0048fab50ad316.png";
    img.onload = () => setImage(img);
  }, []);

  // crop image
  const cropImage = useCallback(() => {
    if (!stageRef.current || !image) return;

    // Convert crop position and size to original image coordinates
    const originalCropX = cropArea.x;
    const originalCropY = cropArea.y;
    const originalCropWidth = cropArea.width;
    const originalCropHeight = cropArea.height;

    // Get the layer and temporarily hide UI elements
    const layer = stageRef.current.getLayers()[0];
    const cropRect = layer.findOne(".crop-rect");
    const resizehandlerNames = [
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ];
    const resizeHandles = resizehandlerNames.map((name) =>
      layer.findOne(`.${name}`)
    );

    // Hide UI elements
    if (cropRect) cropRect.visible(false);

    resizeHandles.forEach((handle) => {
      if (handle) {
        handle.visible(false);
      }
    });
    layer.batchDraw();

    // Generate the cropped image
    const dataURL = stageRef.current.toDataURL({
      x: originalCropX,
      y: originalCropY,
      width: originalCropWidth,
      height: originalCropHeight,
      pixelRatio: 1,
      mimeType: "image/png",
    });
    setCroppedImgURL(dataURL);

    // Show UI elements again
    if (cropRect) cropRect.visible(true);
    resizeHandles.forEach((handle) => {
      if (handle) {
        handle.visible(true);
      }
    });
    layer.batchDraw();

    // const link = document.createElement("a");
    // link.download = "cropped-image.png";
    // link.href = dataURL;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  }, [cropArea, image]);

  // Handle crop rectangle drag
  const handleRectDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const rect = e.target;
      const newX = Math.max(
        0,
        Math.min(rect.x(), STAGE_WIDTH - cropArea.width)
      );
      const newY = Math.max(
        0,
        Math.min(rect.y(), STAGE_HEIGHT - cropArea.height)
      );

      rect.x(newX);
      rect.y(newY);

      setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
    },
    [cropArea.width, cropArea.height]
  );

  // Handle resize handle drag
  const handleResizeHandleDrag = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const handle = e.target;
      const handleType = handle.name();
      const pos = handle.position();

      const newCropArea = { ...cropArea };

      switch (handleType) {
        case "bottom-right":
          newCropArea.width = Math.max(
            MIN_SIZE,
            Math.min(pos.x - cropArea.x, STAGE_WIDTH - cropArea.x)
          );
          newCropArea.height = Math.max(
            MIN_SIZE,
            Math.min(pos.y - cropArea.y, STAGE_HEIGHT - cropArea.y)
          );
          break;
        case "bottom-left": {
          const newWidth = Math.max(
            MIN_SIZE,
            cropArea.x + cropArea.width - pos.x
          );
          const newX = Math.max(
            0,
            Math.min(pos.x, cropArea.x + cropArea.width - MIN_SIZE)
          );
          newCropArea.x = newX;
          newCropArea.width = cropArea.x + cropArea.width - newX;
          newCropArea.height = Math.max(
            MIN_SIZE,
            Math.min(pos.y - cropArea.y, STAGE_HEIGHT - cropArea.y)
          );
          break;
        }
        case "top-right": {
          const newHeight = Math.max(
            MIN_SIZE,
            cropArea.y + cropArea.height - pos.y
          );
          const newY = Math.max(
            0,
            Math.min(pos.y, cropArea.y + cropArea.height - MIN_SIZE)
          );
          newCropArea.y = newY;
          newCropArea.width = Math.max(
            MIN_SIZE,
            Math.min(pos.x - cropArea.x, STAGE_WIDTH - cropArea.x)
          );
          newCropArea.height = cropArea.y + cropArea.height - newY;
          break;
        }
        case "top-left": {
          const newW = Math.max(MIN_SIZE, cropArea.x + cropArea.width - pos.x);
          const newH = Math.max(MIN_SIZE, cropArea.y + cropArea.height - pos.y);
          const newXPos = Math.max(
            0,
            Math.min(pos.x, cropArea.x + cropArea.width - MIN_SIZE)
          );
          const newYPos = Math.max(
            0,
            Math.min(pos.y, cropArea.y + cropArea.height - MIN_SIZE)
          );
          newCropArea.x = newXPos;
          newCropArea.y = newYPos;
          newCropArea.width = cropArea.x + cropArea.width - newXPos;
          newCropArea.height = cropArea.y + cropArea.height - newYPos;
          break;
        }
      }

      setCropArea(newCropArea);

      // Update handle position to match the calculated position
      switch (handleType) {
        case "bottom-right":
          handle.position({
            x: newCropArea.x + newCropArea.width,
            y: newCropArea.y + newCropArea.height,
          });
          break;
        case "bottom-left":
          handle.position({
            x: newCropArea.x,
            y: newCropArea.y + newCropArea.height,
          });
          break;
        case "top-right":
          handle.position({
            x: newCropArea.x + newCropArea.width,
            y: newCropArea.y,
          });
          break;
        case "top-left":
          handle.position({ x: newCropArea.x, y: newCropArea.y });
          break;
      }
    },
    [cropArea]
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Resizable Crop Tool</h1>

      <div className="mb-4">
        <button
          onClick={cropImage}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
        >
          Crop Image ({Math.round(cropArea.width)}×{Math.round(cropArea.height)}
          )
        </button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-700">
          <strong>Instructions:</strong> Drag the rectangle to move it. Drag the
          corner circles to resize. Click "Crop Image" to get your cropped
          image.
        </p>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden inline-block">
        <Stage ref={stageRef} width={STAGE_WIDTH} height={STAGE_HEIGHT}>
          <Layer>
            {image && (
              <Image image={image} width={STAGE_WIDTH} height={STAGE_HEIGHT} />
            )}

            {/* Crop rectangle */}
            <Rect
              name="crop-rect"
              className="crop-rect"
              x={cropArea.x}
              y={cropArea.y}
              width={cropArea.width}
              height={cropArea.height}
              fill="rgba(0, 123, 255, 0.3)"
              stroke="#007bff"
              strokeWidth={2}
              dash={[5, 5]}
              draggable={true}
              onDragMove={handleRectDragMove}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
            />

            {/* Resize handles */}
            <Circle
              name="top-left"
              className="resize-handle"
              x={cropArea.x}
              y={cropArea.y}
              radius={6}
              fill="#007bff"
              stroke="#ffffff"
              strokeWidth={2}
              draggable={true}
              onDragMove={handleResizeHandleDrag}
              onDragStart={() => setIsResizing(true)}
              onDragEnd={() => setIsResizing(false)}
            />

            <Circle
              name="top-right"
              className="resize-handle"
              x={cropArea.x + cropArea.width}
              y={cropArea.y}
              radius={6}
              fill="#007bff"
              stroke="#ffffff"
              strokeWidth={2}
              draggable={true}
              onDragMove={handleResizeHandleDrag}
              onDragStart={() => setIsResizing(true)}
              onDragEnd={() => setIsResizing(false)}
            />

            <Circle
              name="bottom-left"
              className="resize-handle"
              x={cropArea.x}
              y={cropArea.y + cropArea.height}
              radius={6}
              fill="#007bff"
              stroke="#ffffff"
              strokeWidth={2}
              draggable={true}
              onDragMove={handleResizeHandleDrag}
              onDragStart={() => setIsResizing(true)}
              onDragEnd={() => setIsResizing(false)}
            />

            <Circle
              name="bottom-right"
              className="resize-handle"
              x={cropArea.x + cropArea.width}
              y={cropArea.y + cropArea.height}
              radius={6}
              fill="#007bff"
              stroke="#ffffff"
              strokeWidth={2}
              draggable={true}
              onDragMove={handleResizeHandleDrag}
              onDragStart={() => setIsResizing(true)}
              onDragEnd={() => setIsResizing(false)}
            />
          </Layer>
        </Stage>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          <strong>Crop Position:</strong>
          {` x: ${Math.round(cropArea.x)}, y: ${Math.round(cropArea.y)}`}
          <br />
          <strong>Crop Size:</strong> {Math.round(cropArea.width)} ×{" "}
          {Math.round(cropArea.height)} pixels
        </p>
      </div>
    </div>
  );
};

export default CropImageKonva;
