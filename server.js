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
    'https://backafo.onrender.com',
    'https://afosenegal.com',
    'https://www.afosenegal.com',
    'https://afosenegal.org',
    'https://www.afosenegal.org'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// MongoDB connection
if (!process.env.MONGODB_URI) {
  console.error('❌ ERREUR: MONGODB_URI n\'est pas défini dans les variables d\'environnement');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

// cotisation
const cotisationRoutes = require('./routes/cotisationRoutes');
app.use('/cotisations', cotisationRoutes);

// logs d'actions
const actionLogRoutes = require('./routes/actionLogRoutes');
app.use('/logs', actionLogRoutes);


app.listen(port, () => {
  console.log(`User service running on port ${port}`);
});
