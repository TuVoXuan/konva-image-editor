import { createContext, useContext, useState } from "react";
import Konva from "konva";

export const IEKonvaShapeType = {
  RECTANGLE: "rectangle",
  ARROW: "arrow",
  CLOUD: "cloud",
} as const;

export type IEKonvaShapeType =
  (typeof IEKonvaShapeType)[keyof typeof IEKonvaShapeType];

export type IEKonvaShape = Konva.RectConfig | Konva.ArrowConfig;

export type IEKonvaShapeWithType = {
  type: IEKonvaShapeType;
  shape: IEKonvaShape;
};

type KonvaImageEditorContextType = {
  croppedImgURL: string | null;
  setCroppedImgURL: React.Dispatch<React.SetStateAction<string | null>>;
  shapes: IEKonvaShapeWithType[];
  addShape: (shape: IEKonvaShapeWithType) => void;
  updateShape: (id: string, newShape: IEKonvaShape) => void;
  removeShape: (id: string) => void;
  resetShapes: () => void;
  selectedShapeId: string | undefined;
  setSelectedShapeId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const KonvaImageEditorContext = createContext<
  KonvaImageEditorContextType | undefined
>(undefined);

export const KonvaImageEditorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedShapeId, setSelectedShapeId] = useState<string>();
  const [croppedImgURL, setCroppedImgURL] = useState<string | null>(null);
  const [shapes, setShapes] = useState<IEKonvaShapeWithType[]>([]);

  const initialValue: KonvaImageEditorContextType = {
    croppedImgURL,
    setCroppedImgURL,
    shapes: shapes,
    addShape: (shape: IEKonvaShapeWithType) => {
      setShapes((prevShapes) => [...prevShapes, shape]);
    },
    updateShape: (id: string, newShape: IEKonvaShape) => {
      setShapes((prevShapes) =>
        prevShapes.map((shape) =>
          shape.shape.id === id ? { ...shape, shape: newShape } : shape
        )
      );
    },
    removeShape: (id: string) => {
      setShapes((prevShapes) =>
        prevShapes.filter((shape) => shape.shape.id !== id)
      );
    },
    resetShapes: () => {
      setShapes([]);
    },
    selectedShapeId,
    setSelectedShapeId: setSelectedShapeId,
  };

  return (
    <KonvaImageEditorContext.Provider value={initialValue}>
      {children}
    </KonvaImageEditorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useKonvaImageEditor = () => {
  const context = useContext(KonvaImageEditorContext);
  if (context === undefined) {
    throw new Error(
      "useKonvaImageEditor must be used within a KonvaImageEditorProvider"
    );
  }
  return context;
};
