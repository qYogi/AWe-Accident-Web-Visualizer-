import { Header } from "./components/header/Header";
import { DateForm } from "./components/form/DateForm";
import { Results } from "./components/results/Results";
import "./styles.css";

export function App(): HTMLElement {
  const app = document.createElement("div");
  app.appendChild(Header());
  app.appendChild(DateForm({
    onSubmit: (startDate, endDate) => {
      console.log("Start date:", startDate);
      console.log("End date:", endDate);
    }
  }));
  app.appendChild(Results());

  return app;
}
