export function Table() {
  const table = document.createElement("table");

  table.innerHTML = `
  <thead>
    <tr>
      <th>ID</th>
      <th>Age</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>20</td>
      <td>test@test.com</td>
    </tr>
  </tbody>
  `;

  return table;
}
