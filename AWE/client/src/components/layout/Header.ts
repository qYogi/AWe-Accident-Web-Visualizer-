export function Header(): HTMLElement {
  const header = document.createElement("div");
  
  const title = document.createElement("h1");
  title.textContent = "AWE";
  
  const description = document.createElement("p");
  description.textContent = "Selectati un interval de timp pentru a vizualiza datele despre accidente.";
  header.appendChild(title);
  header.appendChild(description);
  
  return header;
} 