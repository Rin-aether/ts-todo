import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./index.css";

//("root")!←nullでないことを保証するNon-nullアサーション演算子
createRoot(document.getElementById("root")!)
.render(
  <StrictMode>
    <App />
  </StrictMode>
);
