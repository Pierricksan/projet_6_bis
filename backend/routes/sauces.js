// appel des requirements 
const express = require('express');
const router = express.Router();

// controller
//récupération du controller
const sauceCtrl = require('../controllers/sauces')

// middleware
// récupération du middleware auth
const auth = require('../middleware/auth');
// récupération du middleware multer
const multer = require('../middleware/multer-config');


// Logique des routes du router
// route pour avoir toutes les sauces
router.get('/', auth, sauceCtrl.getAllSauces);
// création d'une sauce
router.post('/', auth, multer, sauceCtrl.createSauce);
// appelle d'une sauce 
router.get('/:id', auth, sauceCtrl.getOneSauce);
// route pour modifier une sauce 
router.put('/:id', auth, multer, sauceCtrl.modifySauce)
// route pour supprimer une sauce
router.delete('/:id', auth, sauceCtrl.deleteSauce);
// route pour like dislike
router.post('/:id/like', auth, sauceCtrl.createLike)

module.exports = router;
