
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppProviders } from "./providers/AppProviders";

createRoot(document.getElementById("root")!).render(
  <AppProviders />
);
