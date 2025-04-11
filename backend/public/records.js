let allRecords = [];

fetch('/api/records')
  .then(res => res.json())
  .then(data => {
    allRecords = data;
    renderRecords(data);
  });

document.getElementById('search').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allRecords.filter(r =>
    (r.nombrePaciente && r.nombrePaciente.toLowerCase().includes(query)) ||
    (r.id && r.id.toLowerCase().includes(query))
  );
  renderRecords(filtered);
});

function renderRecords(records) {
  const container = document.getElementById('records');
  container.innerHTML = '';

  if (!records.length) {
    container.innerHTML = '<p>No se encontraron resultados.</p>';
    return;
  }

  records.forEach(record => {
    const div = document.createElement('div');
    div.style.border = '1px solid #ccc';
    div.style.margin = '1em 0';
    div.style.padding = '1em';

    div.innerHTML = `
      <h3>${record.nombrePaciente || 'Sin nombre'}</h3>
      <p><strong>ID:</strong> ${record.id}</p>
      <p><strong>Fecha:</strong> ${new Date(record.fecha).toLocaleString()}</p>
      <p><strong>Ciudad:</strong> ${record.ciudad || 'N/A'}</p>
      <div style="display:flex; gap:1em;">
        ${record.imagen_frontal ? `<img src="${record.imagen_frontal}" width="150" title="Frontal"/>` : ''}
        ${record.imagen_posterior ? `<img src="${record.imagen_posterior}" width="150" title="Posterior"/>` : ''}
        ${record.imagen_plantar ? `<img src="${record.imagen_plantar}" width="150" title="Plantar"/>` : ''}
      </div>
      <details>
        <summary>Ver más detalles</summary>
        <pre>${JSON.stringify(record, null, 2)}</pre>
      </details>
    `;

    container.appendChild(div);
  });
}
