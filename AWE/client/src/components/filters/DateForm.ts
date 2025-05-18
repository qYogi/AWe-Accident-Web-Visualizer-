interface DateFormProps {
  onSubmit: (startDate: string, endDate: string) => void;
}

export function DateForm({ onSubmit }: DateFormProps): HTMLElement {
  const form = document.createElement("form");
  form.id = "date-form";
  
  //input de start
  const startLabel = document.createElement("label");
  startLabel.htmlFor = "start_date";
  startLabel.textContent = "Data de start:";
  const startInput = document.createElement("input");
  startInput.type = "date";
  startInput.id = "start_date";
  startInput.name = "start_date";
  startInput.required = true;
  
  //end
  const endLabel = document.createElement("label");
  endLabel.htmlFor = "end_date";
  endLabel.textContent = "Data de final:";
  const endInput = document.createElement("input");
  endInput.type = "date";
  endInput.id = "end_date";
  endInput.name = "end_date";
  endInput.required = true;
  
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Afiseaza datele";
  
  form.appendChild(startLabel);
  form.appendChild(startInput);
  form.appendChild(endLabel);
  form.appendChild(endInput);
  form.appendChild(submitButton);
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    onSubmit(startInput.value, endInput.value);
  });
  
  return form;
} 