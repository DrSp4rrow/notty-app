const express = require("express");
const path = require("path");
const session = require("express-session");
const authRoutes = require("./auth");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

// Configurar sesiones con variable de entorno
app.use(
    session({
        secret: process.env.SESSION_SECRET, 
        resave: false,
        saveUninitialized: true,
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "../public")));
app.use(authRoutes);


// Redirigir al login si no está autenticado
app.get("/", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.sendFile(path.join(__dirname, "../public/dashboard.html"));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
