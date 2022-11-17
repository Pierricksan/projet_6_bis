const User = require('../models/User');

// plugins pour la sécurité de l'application 
// sécurité pour le cryptage des mots de passe dans le base de données et lors de la création
const bcrypt = require('bcrypt');
// création d'un token d'authentification pour la vérification de l'utilisateur
const jwt = require('jsonwebtoken');
// sécurité pour le cryptage du mail lors de la création de l'utilisateur et appel pour son authentification
const CryptoJS = require('crypto-js');


// controller logique pour l'inscription // sécurité sur le mail (cryptoJS) et le password (bcrypt)
exports.signup = (req, res, next) => {
    const emailCryptoJs = CryptoJS.HmacSHA256(req.body.email, `codeSecret`).toString();
    console.log(emailCryptoJs);
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: emailCryptoJs,
          password: hash,
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

// controller logique pour l'identification d'un utilisateur avec comparaison des mots de passe avec bcrypt et du mail avec CryptoJS
exports.login = (req, res, next) => {
    const emailCryptoJs = CryptoJS.HmacSHA256(req.body.email, `codeSecret`).toString();
    console.log(emailCryptoJs)
    User.findOne({ email: emailCryptoJs })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' },
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};