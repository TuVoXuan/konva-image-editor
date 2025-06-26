import type Konva from "konva";
import { Badge, MoveUpRight, RectangleHorizontal } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Image, Layer, Stage } from "react-konva";
import {
  IEKonvaShapeType,
  useKonvaImageEditor,
} from "../../contexts/konva-image-editor";
import RenderShape from "./render-shape";
import type { ScallopedRectangleShape } from "./shapes/render-scalloped-rectangle";

const DELETE_KEY = "Backspace";

export default function MarkupImage() {
  const stageRef = useRef<Konva.Stage>(null);
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const {
    croppedImgURL,
    setCroppedImgURL,
    addShape,
    setSelectedShapeId,
    removeShape,
    selectedShapeId,
  } = useKonvaImageEditor();
  const [strokeWidth, setStrokeWidth] = React.useState(4);
  const [strokeColor, setStrokeColor] = React.useState("#000000");

  React.useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = croppedImgURL || "";
    img.onload = () => setImage(img);
  }, [croppedImgURL]);

  useEffect(() => {
    if (image && stageRef.current) {
      const stage = stageRef.current;
      stage.width(image.width);
      stage.height(image.height);
      stage.container().style.width = `${image.width}px`;
      stage.container().style.height = `${image.height}px`;
    }
  }, [image]);

  function handleAddArrow() {
    const newArrow: Konva.ArrowConfig = {
      x: 200,
      y: 250,
      points: [0, 0, 100, 100],
      pointerLength: 20,
      pointerWidth: 20,
      fill: strokeColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      id: `arrow-${Date.now()}`,
    };
    addShape({ type: IEKonvaShapeType.ARROW, shape: newArrow });
  }

  function handleAddRectangle() {
    const newRectangle: Konva.RectConfig = {
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      fill: "transparent",
      id: `rectangle-${Date.now()}`,
    };
    addShape({ type: IEKonvaShapeType.RECTANGLE, shape: newRectangle });
  }

  function handleAddCloud() {
    const newCloudRectangle: ScallopedRectangleShape = {
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      fill: "transparent",
      id: `cloud-${Date.now()}`,
      scallops: 20,
    };
    addShape({ type: IEKonvaShapeType.CLOUD, shape: newCloudRectangle });
  }

  function handleStageClick(event: Konva.KonvaEventObject<MouseEvent>) {
    // If click on empty area - remove all selections
    if (event.target === event.target.getStage()) {
      setSelectedShapeId(undefined);
    }

    // Do nothing if clicked NOT on our rectangles, arrows or other shapes
    if (
      event.target.getClassName() !== "Rect" &&
      event.target.getClassName() !== "Arrow" &&
      event.target.name() !== "ScallopedRectangle"
    ) {
      setSelectedShapeId(undefined);
      return;
    }

    const clickedId = event.target.id();
    setSelectedShapeId(clickedId);
  }

  function handleDeleteShape() {
    console.log("selectedShapeId: ", selectedShapeId);

    if (selectedShapeId) {
      removeShape(selectedShapeId);
      setSelectedShapeId(undefined);
    }
  }

  useEffect(() => {
    // Add event listener for delete key to remove selected shape when mouse not focused on input or any editable element
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (!isInput && event.key === DELETE_KEY) {
        handleDeleteShape();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedShapeId, removeShape]);

  return (
    <div className="p-5">
      <button
        onClick={() => setCroppedImgURL(null)}
        className="bg-blue-400 text-white p-3 rounded-md"
      >
        Back to Crop Image screen
      </button>
      <h1 className="text-2xl font-bold mb-2">Markup Image</h1>
      <div className="bg-blue-400/50 p-4 rounded-sm mb-5 w-fit">
        <p>
          This is the image you can markup. You can add shapes, text, and more
          using the tools provided.
        </p>
        <p>
          Use the toolbar to select different markup tools and apply them to the
          image.
        </p>
      </div>

      <div>
        <Stage
          ref={stageRef}
          height={500}
          width={800}
          onClick={handleStageClick}
        >
          <Layer>
            {image && (
              <Image
                image={image}
                x={0}
                y={0}
                width={image.width}
                height={image.height}
              />
            )}
            {/* Render shapes */}
            <RenderShape />
          </Layer>
        </Stage>
      </div>
      <div className="flex items-center bg-gray-100 p-4 rounded-md mt-5 gap-x-2 w-fit">
        <div className="flex items-center gap-x-2">
          <label>Shape: </label>
          <button
            onClick={handleAddArrow}
            className="h-8 w-8 flex items-center justify-center border rounded-sm border-gray-400 cursor-pointer"
          >
            <MoveUpRight className="size-5" />
          </button>
          <button
            onClick={handleAddRectangle}
            className="h-8 w-8 flex items-center justify-center border rounded-sm border-gray-400 cursor-pointer"
          >
            <RectangleHorizontal className="size-5" />
          </button>
          <button
            onClick={handleAddCloud}
            className="h-8 w-8 flex items-center justify-center border rounded-sm border-gray-400 cursor-pointer"
          >
            <Badge className="size-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label>Config:</label>
          <div className="flex items-center gap-2">
            <label>Stroke width</label>
            <input
              value={strokeWidth}
              onChange={(event) =>
                setStrokeWidth(Number(event.currentTarget.value))
              }
              type="number"
              placeholder="enter stroke width"
              className="py-1 px-2 border border-black/50 rounded-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label>Stroke color</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(event) => setStrokeColor(event.currentTarget.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
