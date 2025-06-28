/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Rect, Shape, Transformer } from "react-konva";
import {
  useKonvaImageEditor,
  type IEKonvaShape,
} from "../../../contexts/konva-image-editor";
interface RenderSpecificShapeProps {
  shape: IEKonvaShape;
  draggable?: boolean;
}

export default function ScallopedRectangle({
  shape: shapeInfo,
  draggable = false,
}: RenderSpecificShapeProps) {
  const { selectedShapeId, updateShape } = useKonvaImageEditor();
  const transformRef = useRef<Konva.Transformer>(null);
  const rectRef = useRef<Konva.Rect>(null);
  const [isDraggable, setIsDraggable] = useState<boolean>(draggable);

  const prevRotation = useRef<number>(shapeInfo.rotation || 0);
  const prevScaleX = useRef<number>(1);
  const prevScaleY = useRef<number>(1);

  useEffect(() => {
    if (transformRef.current && rectRef.current && shapeInfo.id) {
      if (selectedShapeId === shapeInfo.id) {
        transformRef.current.nodes([rectRef.current]);
        transformRef.current.getLayer()?.batchDraw();
        setIsDraggable(true);
      } else {
        transformRef.current.nodes([]);
        setIsDraggable(false);
      }
    }
  }, [transformRef, rectRef, selectedShapeId, shapeInfo.id]);

  const sceneFunc = (context: any, _shape: any) => {
    const radius = shapeInfo.scallopRadius || 5;
    const width = shapeInfo.width || 0;
    const height = shapeInfo.height || 0;

    // Set stroke style and width from shapeInfo
    context.strokeStyle = shapeInfo.stroke || "black";
    context.lineWidth = shapeInfo.strokeWidth || 2;

    // Draw scalloped border
    // Top edge
    const scallopsX = Math.max(2, Math.floor(width / (radius * 2)));
    const scallopsY = Math.max(2, Math.floor(height / (radius * 2)));

    for (let i = 0; i < scallopsX; i++) {
      const centerX = i * (width / scallopsX) + width / scallopsX / 2;
      context.save();
      context.beginPath();
      context.arc(centerX, 0, radius, Math.PI, 0, false);
      context.stroke();
      context.restore();
    }
    for (let i = 0; i < scallopsY; i++) {
      const centerY = i * (height / scallopsY) + height / scallopsY / 2;
      context.save();
      context.beginPath();
      context.arc(width, centerY, radius, Math.PI * 1.5, Math.PI * 0.5, false);
      context.stroke();
      context.restore();
    }
    for (let i = 0; i < scallopsX; i++) {
      const centerX = width - (i * (width / scallopsX) + width / scallopsX / 2);
      context.save();
      context.beginPath();
      context.arc(centerX, height, radius, 0, Math.PI, false);
      context.stroke();
      context.restore();
    }
    for (let i = 0; i < scallopsY; i++) {
      const centerY =
        height - (i * (height / scallopsY) + height / scallopsY / 2);
      context.save();
      context.beginPath();
      context.arc(0, centerY, radius, Math.PI * 0.5, Math.PI * 1.5, false);
      context.stroke();
      context.restore();
    }
  };

  function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    const { x, y } = e.target.position();
    const updatedShape: IEKonvaShape = {
      ...shapeInfo,
      x,
      y,
    };
    if (shapeInfo.id) {
      updateShape(shapeInfo.id, updatedShape);
    }
  }

  function handleTransform() {
    const node = rectRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    if (!shapeInfo.id) return;

    // Detect if rotation changed
    const rotated = prevRotation.current !== rotation;
    // Detect if scale changed
    const scaled =
      prevScaleX.current !== scaleX || prevScaleY.current !== scaleY;

    if (scaled) {
      // If scaled, update width/height and reset scale
      updateShape(shapeInfo.id, {
        ...shapeInfo,
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
      });
    } else if (rotated) {
      node.scaleX(1);
      node.scaleY(1);
      // If only rotated, just update rotation
      updateShape(shapeInfo.id, {
        ...shapeInfo,
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
      });
    }

    // Update refs
    prevRotation.current = rotation;
    prevScaleX.current = node.scaleX();
    prevScaleY.current = node.scaleY();
  }

  return (
    <>
      <Shape
        sceneFunc={sceneFunc}
        fill="transparent"
        width={shapeInfo.width}
        height={shapeInfo.height}
        x={shapeInfo.x}
        y={shapeInfo.y}
        rotation={shapeInfo.rotation || 0}
      />
      <Rect
        {...shapeInfo}
        draggable={isDraggable}
        ref={rectRef}
        opacity={0}
        onDragMove={() => {
          const node = rectRef.current;
          if (!node) return;
          if (!shapeInfo.id) return;
          updateShape(shapeInfo.id, {
            ...shapeInfo,
            x: node.x(),
            y: node.y(),
          });
        }}
        onDragEnd={handleDragEnd}
        onTransform={handleTransform}
        onTransformEnd={() => {
          if (!shapeInfo.id) return;
          updateShape(shapeInfo.id, shapeInfo);
        }}
      />
      <Transformer ref={transformRef} />
    </>
  );
}
