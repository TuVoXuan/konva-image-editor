import "./App.css";
import CropImageKonva from "./components/crop-image-konva";
import MarkupImage from "./components/markup-image";
import { useKonvaImageEditor } from "./contexts/konva-image-editor";

function App() {
  const { croppedImgURL } = useKonvaImageEditor();
  if (!croppedImgURL) {
    return <CropImageKonva />;
  }
  return <MarkupImage />;
}

export default App;
