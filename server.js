require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const app = express();
const PORT = 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Configurar almacenamiento para archivos subidos
const upload = multer({ dest: "uploads/" });


// Ruta para subir y procesar archivos MKV con progreso
app.post("/upload", upload.single("mkv"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: "No se subió ningún archivo." });
    }

    const inputPath = req.file.path;
    const outputPath = `processed/${req.file.filename}.mkv`;

    if (!fs.existsSync("processed")) {
        fs.mkdirSync("processed");
    }
    const command = ffmpeg(inputPath)
    .videoCodec("libx264") // Convertir video a H.264
    .audioCodec("aac") // Convertir audio a AAC
    .output(outputPath)
    .on("start", (commandLine) => {
        console.log("FFmpeg inició:", commandLine);
    })
    .on("progress", (progress) => {
        if (progress.percent) {
            console.log(`Procesando... ${progress.percent.toFixed(2)}%`);
        }
    })
    .on("end", () => {
        fs.unlinkSync(inputPath);
        console.log("Proceso finalizado.");
        res.json({ success: true, filePath: path.resolve(outputPath) });
    })
    .on("error", (err) => {
        console.error("Error procesando el archivo:", err);
        res.status(500).json({ success: false, error: "Error al procesar el archivo." });
    });

    command.run();

});

app.use(express.static(path.join(__dirname, 'public')));

// Ruta para buscar películas con idioma en español (México)
app.get('/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ error: "Falta el parámetro de búsqueda" });
    }

    try {
        // Obtener géneros en español
        const genresResponse = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: { api_key: TMDB_API_KEY, language: "es-MX" }
        });
        const genresMap = {};
        genresResponse.data.genres.forEach(genre => {
            genresMap[genre.id] = genre.name;
        });

        // Buscar películas
        const moviesResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: { api_key: TMDB_API_KEY, query, language: "es-MX" }
        });

        // Reemplazar IDs de géneros con nombres reales
        const movies = moviesResponse.data.results.map(movie => ({
            title: movie.title,
            year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
            rating: movie.vote_average.toFixed(1),
            genres: movie.genre_ids.map(id => genresMap[id] || "Desconocido"),
            overview: movie.overview,
            poster: `https://image.tmdb.org/t/p/w200${movie.poster_path}`,
            backdrop: `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
        }));

        res.json({ results: movies });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener datos de TMDB" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
