import { App } from "./App";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app");

  if (root) {
    root.appendChild(App());
  }
});
