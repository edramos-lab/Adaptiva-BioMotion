// firebase.js (your custom file)
const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp({
  storageBucket: 'gs://adaptivabiomotion-93558.firebasestorage.app' // Specify the bucket explicitly
});
const bucket = admin.storage().bucket(); // This will now use the correct bucket

const express = require("express");
var cors=require('cors');
const path = require("path");
const fs = require("fs");
console.log("📂 Servir imágenes desde:", path.join(__dirname, 'uploads'));

const app = express();

// Middlewares
app.use(cors({origin: true,credentials: true}));
app.use(express.json({limit: "150mb"}));
app.use(express.static(path.join(__dirname, "../public"))); // frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/form", upload.single('document'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data); // campos JSON desde FormData
    const file = req.file;
    const timestamp = Date.now();
    const nombre = data.nombrePaciente || "paciente";
    const id = `${nombre.replace(/\s+/g, "_")}_${timestamp}`;
    data.id = id;
    data.fecha = new Date().toISOString();

    // Guardar imágenes base64 en Storage como antes...
    
    // Guardar imágenes en Cloud Storage
    const saveImage = async (base64, label) => {
      if (!base64) return null;
      const buffer = Buffer.from(base64.replace(/^data:image\/png;base64,/, ""), "base64");
      const filename = `${id}_${label}.png`;
      const file = bucket.file(`uploads/${filename}`);

      await file.save(buffer, {
        metadata: { contentType: 'image/png' },
        public: true,
      });

      return `https://storage.googleapis.com/${bucket.name}/uploads/${filename}`;
    };

    // Esperar a que se guarden todas las imágenes
    data.imagen_frontal = await saveImage(data.imagen_frontal, "frontal");
    data.imagen_posterior = await saveImage(data.imagen_posterior, "posterior");
    data.imagen_plantar = await saveImage(data.imagen_plantar, "plantar");
    data.imagen_retropie = await saveImage(data.imagen_retropie, "retropie");


    // Adjuntar documento si existe
    if (file) {
      const ext = path.extname(file.originalname);
      const filename = `${id}_document${ext}`;
      const bucketFile = bucket.file(`documents/${filename}`);
      await bucketFile.save(file.buffer, {
        metadata: { contentType: file.mimetype },
        public: true,
      });
      data.document_url = `https://storage.googleapis.com/${bucket.name}/documents/${filename}`;
    }

    // Guardar en Firestore
    const db = admin.firestore();
    await db.collection("formularios").doc(id).set(data);

    res.status(200).json({ message: "Formulario guardado", id });
  } catch (err) {
    console.error("❌ Error al guardar:", err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const usersPath = path.join(__dirname, "users.json");
  
      if (!fs.existsSync(usersPath)) {
        return res.status(500).json({ message: "Users file not found" });
      }
  
      const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
      const user = users.find(u => u.username === username && u.password === password);
  
      if (user) {
        res.status(200).json({ message: "Login successful" });
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    } catch (err) {
      console.error("Error during login:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Ruta para consultar los registros
  app.get("/api/records", async (req, res) => {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection("formularios").get();
  
      const records = [];
      snapshot.forEach(doc => {
        records.push(doc.data());
      });
  
      res.json(records);
    } catch (err) {
      console.error("❌ Error al leer registros:", err);
      res.status(500).json({ message: "Error al leer registros" });
    }
  });
  
  

// Exportar como función de Firebase
exports.app = functions.https.onRequest(app);
