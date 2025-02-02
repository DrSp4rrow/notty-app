const express = require("express");
const path = require("path");
const session = require("express-session");
const authRoutes = require("./auth");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

// Configuración de la base de datos para sesiones
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Middleware de seguridad
app.use(helmet()); // Protege contra ataques comunes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Limitar intentos de login (máx 5 intentos en 15 min)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo de intentos
    message: "Demasiados intentos fallidos, intenta de nuevo más tarde.",
});

// Configurar sesiones seguras en PostgreSQL
app.use(
    session({
        store: new pgSession({
            pool: pool,
            tableName: "session",
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true, // Evita acceso desde JS
            secure: process.env.NODE_ENV === "production", // Solo en HTTPS
            maxAge: 24 * 60 * 60 * 1000, // Expira en 1 día
        },
    })
);

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
