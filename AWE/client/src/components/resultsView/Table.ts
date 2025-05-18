export function Table() {
  const wrapper = document.createElement("table");
  wrapper.className = "table-container"
  wrapper.innerHTML = `
  <thead>
    <tr>
      <th>ID</th>
      <th>Source</th>
      <th>Severity</th>
      <th>Start_Time</th>
      <th>End_Time</th>
      <th>Start_Lat</th>
      <th>Start_Lng</th>
      <th>End_Lat</th>
      <th>End_Lng</th>
      <th>Distance(mi)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>SampleSource</td>
      <td>3</td>
      <td>2023-01-01 12:00</td> 
      <td>2023-01-01 13:00</td>
      <td>40.7128</td>
      <td>-74.0060</td>
      <td>40.7138</td>
      <td>-74.0070</td>
      <td>0.5</td>
    </tr>
  </tbody>
  `;

  return wrapper;
}
