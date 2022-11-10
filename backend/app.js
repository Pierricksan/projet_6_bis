// appel de Express pour l'api 
const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces');
const path = require('path');

mongoose.connect('mongodb+srv://Pierrick:piquanteOPC@cluster0.g6cnyan.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  const app = express();
 
// mettre la requête CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use(express.json());

//// mettre la logique des routes ici 
app.use('/api/sauces', saucesRoutes)
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')))


// app.use((req, res) => {
//    res.json({ message: 'Votre requête a bien été reçue !' }); 
// });

module.exports = app;