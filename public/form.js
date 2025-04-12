//import { db } from './firebase';
// Use db to read/write data to Firestore

// Obtener un solo stream y usarlo en los 3 videos
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    // Compartimos el mismo stream entre todos los videos
    ['frontal', 'posterior', 'plantar', 'retropie'].forEach(view => {
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
  const imgPreview = document.getElementById(`img_${view}`);

  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataURL = canvas.toDataURL('image/png');
  input.value = dataURL;
  imgPreview.src = dataURL;
}

document.getElementById('diagnosticForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Convert form data into a regular object
  const formData = Object.fromEntries(new FormData(e.target).entries());

  try {
    const response = await fetch("https://app-maddzahwgq-uc.a.run.app/api/form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    

    const text = await response.text();
    let resData;
    try {
      resData = JSON.parse(text);
    } catch {
      console.error("❌ Respuesta no es JSON:", text);
      alert("Respuesta inesperada del servidor.");
      return;
    }

    if (response.ok) {
      alert('Formulario enviado con éxito\nID: ' + resData.id);
      e.target.reset();
    } else {
      alert('Error: ' + resData.message || 'Error desconocido');
    }
  } catch (err) {
    console.error('Error al enviar el formulario:', err);
    alert('Error inesperado al enviar el formulario');
  }

});
