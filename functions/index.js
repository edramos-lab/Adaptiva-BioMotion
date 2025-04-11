const functions = require("firebase-functions");
const express = require("express");
const path = require("path");
const fs = require("fs");
console.log("📂 Servir imágenes desde:", path.join(__dirname, 'uploads'));

const app = express();

// Middlewares
app.use(express.json({limit: "50mb"}));
app.use(express.static(path.join(__dirname, "../public"))); // frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para guardar formulario
app.post("/api/form", (req, res) => {
  try {
    const data = req.body;
    const timestamp = Date.now();
    const nombre = data.nombrePaciente || "paciente";
    const id = `${nombre.replace(/\s+/g, "_")}_${timestamp}`;
    data.id = id;
    data.fecha = new Date().toISOString();

    // Guardar imágenes base64 como archivos (temporal)
    const uploads = path.join(__dirname, "../public/uploads");
    if (!fs.existsSync(uploads)) fs.mkdirSync(uploads, { recursive: true });

    const saveImage = (base64, label) => {
    if (!base64) return null;
    const clean = base64.replace(/^data:image\/png;base64,/, "");
    const filename = `${id}_${label}.png`;
    const fullPath = path.join(uploads, filename);
    fs.writeFileSync(fullPath, clean, "base64");
    console.log(`✅ Imagen guardada: ${fullPath}`);
    return `/uploads/${filename}`; // This will be publicly accessible
    };



    data.imagen_frontal = saveImage(data.imagen_frontal, "frontal");
    data.imagen_posterior = saveImage(data.imagen_posterior, "posterior");
    data.imagen_plantar = saveImage(data.imagen_plantar, "plantar");

    const dbPath = path.join(__dirname, "form_data.json");
    let records = [];
    if (fs.existsSync(dbPath)) {
      records = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    }

    records.push(data);
    fs.writeFileSync(dbPath, JSON.stringify(records, null, 2));
    res.status(200).json({message: "Formulario guardado", id});
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    res.status(500).json({message: "Error interno del servidor"});
  }
});


app.post("/api/login", (req, res) => {
    try {
      const { username, password } = req.body;
      const usersPath = path.join(__dirname, "users.json");
  
      if (!fs.existsSync(usersPath)) {
        return res.status(500).json({ message: "Archivo de usuarios no encontrado" });
      }
  
      const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
      const user = users.find(u => u.username === username && u.password === password);
  
      if (user) {
        res.status(200).json({ message: "Login OK" });
      } else {
        res.status(401).json({ message: "Usuario o contraseña incorrecta" });
      }
    } catch (err) {
      console.error("❌ Error en login:", err);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  
  // Ruta para consultar los registros
app.get("/api/records", (req, res) => {
    try {
      const dbPath = path.join(__dirname, "form_data.json");
      if (!fs.existsSync(dbPath)) {
        return res.json([]); // Devuelve lista vacía si no hay archivo
      }
  
      const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
      res.json(data);
    } catch (err) {
      console.error("❌ Error al leer registros:", err);
      res.status(500).json({ message: "Error al leer registros" });
    }
  });
  

// Exportar como función de Firebase
exports.app = functions.https.onRequest(app);
