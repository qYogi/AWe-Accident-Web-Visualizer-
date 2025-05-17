import { Table } from "./components/Table";

export function App(): HTMLElement {
  const app = document.createElement("div");

  app.appendChild(Table());

  return app;
}
