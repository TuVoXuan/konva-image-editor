import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { KonvaImageEditorProvider } from "./contexts/konva-image-editor.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <KonvaImageEditorProvider>
      <App />
    </KonvaImageEditorProvider>
  </StrictMode>
);
