const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const blockHtmlMiddleware = require('./middlewares/blockHtmlMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware global
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

// Bloquear URLs que terminan en .html
app.use(blockHtmlMiddleware);

// Rutas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
