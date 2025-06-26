import React, { useRef, useState, useCallback } from "react";
import { Stage, Layer, Image, Rect } from "react-konva";
import Konva from "konva";

const CropImageKonva: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);

  const CROP_WIDTH = 200;
  const CROP_HEIGHT = 200;

  // Load sample image
  React.useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src =
      "https://atm232295-s3user.vcos.cloudstorage.com.vn/docs/public/685ba91fc804893415505977.png";
    img.onload = () => setImage(img);
  }, []);

  // Download cropped image
  const downloadCroppedImage = useCallback(() => {
    if (!stageRef.current) return;

    // Get the layer and find the crop rectangle
    const layer = stageRef.current.getLayers()[0];
    const cropRect = layer.findOne("Rect");

    // Temporarily hide the crop rectangle
    if (cropRect) {
      cropRect.visible(false);
      layer.batchDraw();
    }

    // Generate the cropped image without the rectangle
    const dataURL = stageRef.current.toDataURL({
      x: cropPosition.x,
      y: cropPosition.y,
      width: CROP_WIDTH,
      height: CROP_HEIGHT,
      pixelRatio: 2,
      mimeType: "image/png",
    });

    // Show the crop rectangle again
    if (cropRect) {
      cropRect.visible(true);
      layer.batchDraw();
    }

    const link = document.createElement("a");
    link.download = "cropped-image.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [cropPosition]);

  // Handle rectangle drag
  const handleRectDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const rect = e.target;
      const newX = Math.max(0, Math.min(rect.x(), 600 - CROP_WIDTH));
      const newY = Math.max(0, Math.min(rect.y(), 400 - CROP_HEIGHT));

      rect.x(newX);
      rect.y(newY);

      setCropPosition({ x: newX, y: newY });
    },
    []
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simple Crop Tool</h1>

      <div className="mb-4">
        <button
          onClick={downloadCroppedImage}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
        >
          Download Cropped Image (200x200)
        </button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-700">
          <strong>Instructions:</strong> Drag the blue rectangle to select the
          area you want to crop. Click "Download" to get your 200x200 cropped
          image.
        </p>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden inline-block">
        <Stage ref={stageRef} width={600} height={400}>
          <Layer>
            {image && <Image image={image} width={600} height={400} />}

            {/* Fixed size crop rectangle */}
            <Rect
              x={cropPosition.x}
              y={cropPosition.y}
              width={CROP_WIDTH}
              height={CROP_HEIGHT}
              fill="rgba(0, 123, 255, 0.3)"
              stroke="#007bff"
              strokeWidth={2}
              dash={[5, 5]}
              draggable={true}
              onDragMove={handleRectDragMove}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
            />
          </Layer>
        </Stage>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          <strong>Crop Position:</strong>
          {` x: ${Math.round(cropPosition.x)}, y: ${Math.round(
            cropPosition.y
          )}`}
          <br />
          <strong>Crop Size:</strong> {CROP_WIDTH} × {CROP_HEIGHT} pixels
        </p>
      </div>
    </div>
  );
};

export default CropImageKonva;
