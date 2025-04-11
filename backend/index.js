const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;


// Middleware para leer JSON
app.use(express.json({limit:'50mb'}));

// Servir archivos estáticos del frontend
//app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/records', (req, res) => {
    const dbPath = path.join(__dirname, 'form_data.json');
    if (!fs.existsSync(dbPath)) return res.json([]);
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    res.json(data);
  });
  

// Ruta de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer users.json:', err);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

    const users = JSON.parse(data);
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      res.status(200).json({ message: 'Login exitoso' });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  });
});

// Ruta para recibir formulario (form.html)
app.post('/api/form', (req, res) => {
    try {
      const data = req.body;
      console.log('📥 Datos recibidos del formulario:', data);
  
      const timestamp = Date.now();
      const nombre = data.nombrePaciente || 'paciente';
      const id = `${nombre.replace(/\s+/g, '_')}_${timestamp}`;
      data.id = id;
      data.fecha = new Date().toISOString();
  
      // Guardar imágenes
      const uploads = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploads)) fs.mkdirSync(uploads);
  
      const saveImage = (base64, label) => {
        if (!base64) return null;
        const clean = base64.replace(/^data:image\/png;base64,/, '');
        const filename = `${id}_${label}.png`;
        fs.writeFileSync(path.join(uploads, filename), clean, 'base64');
        return `/uploads/${filename}`;
      };
  
      data.imagen_frontal = saveImage(data.imagen_frontal, 'frontal');
      data.imagen_posterior = saveImage(data.imagen_posterior, 'posterior');
      data.imagen_plantar = saveImage(data.imagen_plantar, 'plantar');
  
      // Guardar datos en form_data.json
      const dbPath = path.join(__dirname, 'form_data.json');
      let registros = [];
      if (fs.existsSync(dbPath)) {
        registros = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      }
  
      registros.push(data);
      fs.writeFileSync(dbPath, JSON.stringify(registros, null, 2));
  
      // ✅ Solo una respuesta
      res.status(200).json({ message: 'Formulario recibido correctamente', id });
  
    } catch (err) {
      console.error('❌ Error al guardar el formulario:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error interno del servidor' });
      }
    }
  });
  

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
