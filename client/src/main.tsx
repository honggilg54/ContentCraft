import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set custom colors in root for shadcn-ui
document.documentElement.style.setProperty('--primary', '70 175 74'); // #4CAF50
document.documentElement.style.setProperty('--primary-foreground', '255 255 255'); // white
document.documentElement.style.setProperty('--secondary', '255 87 34'); // #FF5722
document.documentElement.style.setProperty('--warning', '255 193 7'); // #FFC107
document.documentElement.style.setProperty('--danger', '244 67 54'); // #F44336

createRoot(document.getElementById("root")!).render(<App />);
