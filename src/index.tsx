import ReactDOM from "react-dom/client";
import { CssBaseline, CssVarsProvider, Stack } from "@mui/joy";
import Layout from "./components/Layout";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("No root element found");

ReactDOM.createRoot(root).render(
  <CssVarsProvider defaultMode="system">
    <CssBaseline />
    <Layout />
  </CssVarsProvider>
);
