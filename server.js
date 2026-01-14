require('dotenv').config(); // Charger les variables d'environnement

console.log("JWT_SECRET_KEY:", process.env.JWT_SECRET_KEY); 

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Ajout de CORS mod

const app = express();
const port = 5002;

// Middleware CORS - Configuration pour production et développement
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://fontafo.vercel.app',
    'https://backafo.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://dieyeyatma33:allahisone33@clusteryat.0fus6x1.mongodb.net/afo');

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

// cotisation

const cotisationRoutes = require('./routes/cotisationRoutes');

app.use('/cotisations', cotisationRoutes);


app.listen(port, () => {
  console.log(`User service running on port ${port}`);
});
