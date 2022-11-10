// const Sauces = require('../models/Sauces');
const sauce = require("../models/sauce");
const Sauce = require("../models/sauce");
const fs = require("fs");

// appelle de toutes les sauces contenu dans la base de données
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => {
      res.status(200).json(sauces);
    })
    .catch(error => {
      res.status(400).json({ error });
    });
};

//création d'une sauce
exports.createSauce = (req, res, next) => {
  const sauceItem = JSON.parse(req.body.sauce);
  delete sauceItem._id;
  delete sauceItem._userId;
  const Sauces = new Sauce({
    ...sauceItem,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  Sauces.save()
    .then(() => {
      res.status(201).json({ message: "sauce bien créée" });
    })
    .catch(error => {
      res.status(400).json({ error });
    });
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      res.status(200).json(sauce);
    })
    .catch(error => {
      res.status(404).json({ error });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceItem = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceItem._userId;
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceItem, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet bien modifié" }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch(error => {
      res.status(401).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`image/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce bien supprimé" });
            })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

exports.createLike = (req, res) => {
  // Sauce.findOne({_id: req.params.id})
  // .then(sauce => {
  //   if (req.body.like == -1) {
  //     sauce.dislike++;
  //     sauce.usersDisliked.push(req.body.userId);
  //     sauce.save()
  //   }
  //   if (req.body.like == 1){
  //     sauce.like++;
  //     sauce.usersLiked.push(req.body.userId);
  //     sauce.save()
  //   }

  // })
  // .catch(error => {res.status(404).json({ error })})

  /* requête envoyé par body raw au format JSON avec ces 2 propriétés 
{
    "userId" : "6362ebf7959e60aa0f39bc40",
    "like" : 0
}
*/
  // console.log("je suis dans le controleur like");
  // console.log(req.body.like)
  // console.log(req.params)
  // console.log({ _id: req.params.id})

  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      // console.log(sauce)
      // si l'utilisateur n'a pas encore aimé, on l'ajoute dans le tableau et on passe à 1
      if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $push: { usersLiked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: "Sauce like +1" }))
          .catch(error => res.status(400).json({ error }));
      }
      // si l'utilisateur a déjà aimé, on remet à 0
      if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pull: { usersLiked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: "Sauce like 0" }))
          .catch(error => res.status(400).json({ error }));
      }
      // si l'utilisateur veut disliker une sauce
      if (
        !sauce.usersDisliked.includes(req.body.userId) &&
        req.body.like === -1
      ) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: "Sauce dislike +1" }))
          .catch(error => res.status(400).json({ error }));
      }
      // Un like =-1 pour mettre le like = 0 (likes = 0, pas de vote, on enlève le dislike)
      if (
        sauce.usersDisliked.includes(req.body.userId) &&
        req.body.like === 0
      ) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: "Sauce dislike 0" }))
          .catch(error => res.status(400).json({ error }));
      }
    })
    .catch(error => {
      res.status(404).json({ error });
    });
};
