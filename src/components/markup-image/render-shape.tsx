import Konva from "konva";
import { useMemo } from "react";
import { Group } from "react-konva";
import {
  IEKonvaShapeType,
  useKonvaImageEditor,
} from "../../contexts/konva-image-editor";
import RenderArrow from "./shapes/render-arrow";
import RenderRectangle from "./shapes/render-rectangle";
import ScallopedRectangle from "./shapes/render-scalloped-rectangle";

export default function RenderShape() {
  const { shapes } = useKonvaImageEditor();

  const rectShapes = useMemo(
    () => shapes.filter((shape) => shape.type === IEKonvaShapeType.RECTANGLE),
    [shapes]
  );
  const arrowShapes = useMemo(
    () => shapes.filter((shape) => shape.type === IEKonvaShapeType.ARROW),
    [shapes]
  );
  const cloudShapes = useMemo(
    () => shapes.filter((shape) => shape.type === IEKonvaShapeType.CLOUD),
    [shapes]
  );

  console.log("cloudShapes: ", cloudShapes);

  return (
    <Group>
      {rectShapes.map((shape, index) => (
        <RenderRectangle key={index} shape={shape.shape as Konva.RectConfig} />
      ))}
      {arrowShapes.map((shape, index) => (
        <RenderArrow key={index} shape={shape.shape as Konva.ArrowConfig} />
      ))}
      {cloudShapes.map((shape, index) => (
        <ScallopedRectangle
          key={index}
          shape={shape.shape as Konva.RectConfig}
        />
      ))}
    </Group>
  );
}
