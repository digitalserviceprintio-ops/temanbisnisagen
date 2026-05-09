import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { runCacheCleanup } from "./lib/cache-cleanup";

runCacheCleanup();

createRoot(document.getElementById("root")!).render(<App />);
