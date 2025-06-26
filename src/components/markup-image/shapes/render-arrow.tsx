import { useEffect, useRef, useState } from "react";
import {
  useKonvaImageEditor,
  type IEKonvaShape,
} from "../../../contexts/konva-image-editor";
import Konva from "konva";
import { Arrow, Group, Transformer } from "react-konva";

interface RenderSpecificShapeProps {
  shape: IEKonvaShape;
  draggable?: boolean;
}

export default function RenderArrow({
  shape,
  draggable = false,
}: RenderSpecificShapeProps) {
  const { selectedShapeId, updateShape } = useKonvaImageEditor();
  const transformRef = useRef<Konva.Transformer>(null);
  const arrowRef = useRef<Konva.Arrow>(null);
  const [isDraggable, setIsDraggable] = useState<boolean>(draggable);

  useEffect(() => {
    if (transformRef.current && arrowRef.current) {
      if (selectedShapeId === shape.id) {
        transformRef.current.nodes([arrowRef.current]);
        setIsDraggable(true);
      } else {
        transformRef.current.nodes([]);
        setIsDraggable(false);
      }
    }
  }, [transformRef, arrowRef, selectedShapeId]);

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
      <Arrow
        {...(shape as Konva.ArrowConfig)}
        draggable={isDraggable}
        ref={arrowRef}
        onDragEnd={handleDragEnd}
      />
      <Transformer ref={transformRef} />
    </Group>
  );
}
