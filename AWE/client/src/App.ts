import { Table } from "./components/table/Table";

export function App(): HTMLElement {
  const app = document.createElement("div");

  app.appendChild(Table());

  return app;
}
