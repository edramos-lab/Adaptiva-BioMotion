
// Obtener un solo stream y usarlo en los 3 videos
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    // Compartimos el mismo stream entre todos los videos
    ['frontal', 'posterior', 'plantar','retropie'].forEach(view => {
      const video = document.getElementById(`video_${view}`);
      if (video) {
        video.srcObject = stream;
      }
    });
  })
  .catch(err => {
    console.error('No se pudo acceder a la cámara:', err);
  });

// Captura individual
function captureImage(view) {
  const video = document.getElementById(`video_${view}`);
  const canvas = document.getElementById(`canvas_${view}`);
  const input = document.querySelector(`input[name="imagen_${view}"]`);

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const base64Image = canvas.toDataURL('image/png');
  input.value = base64Image;
}

  
  

document.getElementById('diagnosticForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const formData = Object.fromEntries(new FormData(e.target).entries());
  
    try {
      const response = await fetch('/api/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
  
      if (response.ok) {
        alert('Formulario enviado con éxito');
        e.target.reset();
      } else {
        alert('Hubo un error al enviar el formulario');
      }
    } catch (err) {
      console.error('Error al enviar el formulario:', err);
      alert('Error inesperado al enviar el formulario');
    }
  });
  