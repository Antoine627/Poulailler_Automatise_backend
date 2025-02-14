const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // Assurez-vous d'avoir un middleware d'authentification


// Routes pour l'authentification via Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = authController.generateToken(req.user);
    res.redirect(`/dashboard?token=${token}`);
  }
);

// Routes pour l'authentification via Facebook
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    const token = authController.generateToken(req.user);
    res.redirect(`/dashboard?token=${token}`);
  }
);

// Routes pour l'authentification via GitHub
router.get('/auth/github', passport.authenticate('github'));
router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const token = authController.generateToken(req.user);
    res.redirect(`/dashboard?token=${token}`);
  }
);




// Route pour l'inscription d'un nouvel utilisateur
router.post('/register', authController.register);

// Route pour la connexion d'un utilisateur
router.post('/login', authController.login);

router.post('/code', authController.loginWithCode);

// Route pour la déconnexion d'un utilisateur
router.post('/logout', authMiddleware, authController.logout);

// Route pour obtenir les informations de l'utilisateur actuellement connecté
router.get('/me', authMiddleware, authController.getCurrentUser);

// Route pour mettre à jour le mot de passe de l'utilisateur
router.put('/updatePassword', authMiddleware, authController.updatePassword);

module.exports = router;
