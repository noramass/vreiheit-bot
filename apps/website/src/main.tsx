import React from "react";
import axios from "axios";
import ReactDOM from "react-dom/client";
import App from "./App";
import "sanitize.css";
import "./tailwind.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

const api = axios.create({
  baseURL: "/api",
});

Object.assign(window, { api });
