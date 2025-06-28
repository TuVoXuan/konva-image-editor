import { Circle, Transformer } from "react-konva";
import {
  useKonvaImageEditor,
  type IEKonvaShape,
} from "../../../contexts/konva-image-editor";
import { useEffect, useRef, useState } from "react";
import type Konva from "konva";

interface RenderSpecificShapeProps {
  shape: IEKonvaShape;
  draggable?: boolean;
}

export default function RenderCircle({
  shape,
  draggable = false,
}: RenderSpecificShapeProps) {
  const transformRef = useRef<Konva.Transformer>(null);
  const circleRef = useRef<Konva.Circle>(null);
  const { selectedShapeId, updateShape } = useKonvaImageEditor();
  const [isDraggable, setIsDraggable] = useState<boolean>(draggable);

  useEffect(() => {
    if (transformRef.current && circleRef.current) {
      if (selectedShapeId === shape.id) {
        transformRef.current.nodes([circleRef.current]);
        setIsDraggable(true);
      } else {
        transformRef.current.nodes([]);
        setIsDraggable(false);
      }
    }
  }, [transformRef, circleRef, selectedShapeId]);

  function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    const { x, y } = e.target.position();
    const updatedShape: IEKonvaShape = {
      ...shape,
      x,
      y,
    };
    if (shape.id) {
      updateShape(shape.id, updatedShape);
    }
  }

  return (
    <>
      <Circle
        {...(shape as Konva.ArrowConfig)}
        draggable={isDraggable}
        ref={circleRef}
        onDragEnd={handleDragEnd}
      />
      <Transformer ref={transformRef} />
    </>
  );
}
