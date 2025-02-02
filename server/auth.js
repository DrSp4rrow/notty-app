const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config(); // Cargar variables de entorno

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Ruta para mostrar el formulario de login
router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

// Ruta para manejar el login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            return res.send("Usuario no encontrado");
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (passwordMatch) {
            req.session.user = user;
            return res.redirect("/");
        } else {
            return res.send("Contraseña incorrecta");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error en el servidor");
    }
});

// Ruta para cerrar sesión
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;