const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const path = require("path");
const { body, validationResult } = require("express-validator");
require("dotenv").config(); // Cargar variables de entorno

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Middleware para verificar autenticación
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// Ruta para mostrar el formulario de login
router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

// Ruta para manejar el login con validaciones
router.post(
    "/login",
    [
        body("username").trim().escape().notEmpty().withMessage("El usuario es requerido"),
        body("password").trim().notEmpty().withMessage("La contraseña es requerida"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send("Error en los datos enviados.");
        }

        const { username, password } = req.body;

        try {
            const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
            if (result.rows.length === 0) {
                return res.send("Usuario o contraseña incorrectos.");
            }

            const user = result.rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                req.session.user = { id: user.id, username: user.username };
                return res.redirect("/");
            } else {
                return res.send("Usuario o contraseña incorrectos.");
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error en el servidor");
        }
    }
);

// Ruta protegida (Ejemplo)
router.get("/dashboard", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/dashboard.html"));
});

// Ruta para cerrar sesión
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;