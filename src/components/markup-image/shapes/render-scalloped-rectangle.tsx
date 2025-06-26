/* eslint-disable @typescript-eslint/no-explicit-any */
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Shape, Transformer } from "react-konva";
import {
  useKonvaImageEditor,
  type IEKonvaShape,
} from "../../../contexts/konva-image-editor";

export type ScallopedRectangleShape = Konva.RectConfig & {
  scallops?: number;
};

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
  const scallopedRectRef = useRef<Konva.Shape>(null);
  const [isDraggable, setIsDraggable] = useState<boolean>(draggable);

  useEffect(() => {
    if (transformRef.current && scallopedRectRef.current && shapeInfo.id) {
      console.log("selectedShapeId: ", selectedShapeId);
      console.log("shapeInfo.id: ", shapeInfo.id);

      if (selectedShapeId === shapeInfo.id) {
        // If the shape is selected, enable transformation
        transformRef.current.nodes([scallopedRectRef.current]);
        setIsDraggable(true);
      } else {
        transformRef.current.nodes([]);
        setIsDraggable(false);
      }
    }
  }, [transformRef, scallopedRectRef, selectedShapeId, shapeInfo.id]);

  const sceneFunc = (context: any, shape: any) => {
    const scallopsPerSide = shapeInfo.scallops;
    const radius =
      Math.min(shapeInfo.width || 0, shapeInfo.height || 0) /
      (scallopsPerSide * 4);

    context.beginPath();

    // Top edge - half circles pointing outward
    const topStepSize = (shapeInfo.width || 0) / scallopsPerSide;
    context.moveTo(0, 0);
    for (let i = 0; i < scallopsPerSide; i++) {
      const centerX = i * topStepSize + topStepSize / 2;
      context.arc(centerX, 0, radius, Math.PI, 0, false);
    }

    // Right edge - half circles pointing outward
    const rightStepSize = (shapeInfo.height || 0) / scallopsPerSide;
    for (let i = 0; i < scallopsPerSide; i++) {
      const centerY = i * rightStepSize + rightStepSize / 2;
      context.arc(
        shapeInfo.width,
        centerY,
        radius,
        Math.PI * 1.5,
        Math.PI * 0.5,
        false
      );
    }

    // Bottom edge - half circles pointing outward
    const bottomStepSize = (shapeInfo.width || 0) / scallopsPerSide;
    for (let i = scallopsPerSide - 1; i >= 0; i--) {
      const centerX = i * bottomStepSize + bottomStepSize / 2;
      context.arc(centerX, shapeInfo.height, radius, 0, Math.PI, false);
    }

    // Left edge - half circles pointing outward
    const leftStepSize = (shapeInfo.height || 0) / scallopsPerSide;
    for (let i = scallopsPerSide - 1; i >= 0; i--) {
      const centerY = i * leftStepSize + leftStepSize / 2;
      context.arc(0, centerY, radius, Math.PI * 0.5, Math.PI * 1.5, false);
    }

    context.closePath();
    context.fillStrokeShape(shape);
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

  return (
    <>
      <Shape
        name="ScallopedRectangle"
        ref={scallopedRectRef}
        {...shapeInfo}
        sceneFunc={sceneFunc}
        draggable={isDraggable}
        onDragEnd={handleDragEnd}
      />
      <Transformer ref={transformRef} />
    </>
  );
}
