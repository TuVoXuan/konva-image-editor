import { useEffect, useRef, useState } from "react";
import {
  useKonvaImageEditor,
  type IEKonvaShape,
} from "../../../contexts/konva-image-editor";
import type Konva from "konva";
import { Group, Rect, Transformer } from "react-konva";

interface RenderSpecificShapeProps {
  shape: IEKonvaShape;
  draggable?: boolean;
}

export default function RenderRectangle({
  shape,
  draggable = false,
}: RenderSpecificShapeProps) {
  const { selectedShapeId, updateShape } = useKonvaImageEditor();
  const transformRef = useRef<Konva.Transformer>(null);
  const rectRef = useRef<Konva.Rect>(null);
  const [isDraggable, setIsDraggable] = useState<boolean>(draggable);

  useEffect(() => {
    if (transformRef.current && rectRef.current && shape.id) {
      if (selectedShapeId === shape.id) {
        // If the shape is selected, enable transformation
        transformRef.current.nodes([rectRef.current]);
        setIsDraggable(true);
      } else {
        transformRef.current.nodes([]);
        setIsDraggable(false);
      }
    }
  }, [transformRef, rectRef, selectedShapeId, shape.id]);

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
    <Group>
      <Rect
        {...(shape as Konva.RectConfig)}
        draggable={isDraggable}
        ref={rectRef}
        onDragEnd={handleDragEnd}
      />
      <Transformer ref={transformRef} />
    </Group>
  );
}
