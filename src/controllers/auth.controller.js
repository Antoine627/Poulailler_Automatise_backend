const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/mailer');

// Fonction utilitaire pour générer un token JWT
const generateToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Fonction pour générer un code à 4 chiffres
const generateCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Génère un code entre 1000 et 9999
};

const register = async (req, res) => {
    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                message: 'Inscription échouée',
                error: 'Ce nom d\'utilisateur ou cet email est déjà utilisé. Veuillez en choisir un autre.',
            });
        }

        // Générer un code à 4 chiffres
        const code = generateCode();

        // Créer le nouvel utilisateur avec le code
        const user = new User({
            username: req.body.username,
            email: req.body.email, // Ajouter l'email
            password: req.body.password,
            code: code, // Ajouter le code généré
            role: req.body.role || 'user', // Rôle par défaut : 'user'
        });

        // Sauvegarder l'utilisateur dans la base de données
        await user.save();

        // Envoyer un email de confirmation avec le code
        try {
            await sendEmail(
                user.email, // Utiliser l'email de l'utilisateur
                'Votre code de connexion',
                `Votre code de connexion est : ${code}`,
                `<p>Bonjour ${user.username},</p>
                 <p>Votre code de connexion est : <strong>${code}</strong></p>
                 <p>Ce code expirera dans 10 minutes.</p>`
            );
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            // Ne pas interrompre l'inscription même si l'email échoue
        }

        // Réponse de succès
        res.status(201).send({
            success: true,
            message: 'Inscription réussie',
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                },
                code: user.code, // Retourner le code généré (optionnel)
            },
        });
    } catch (error) {
        // Réponse d'erreur en cas de problème
        res.status(400).send({
            success: false,
            message: 'Erreur lors de l\'inscription',
            error: error.message,
            details: 'Une erreur s\'est produite lors de la création de votre compte. Veuillez réessayer.',
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'email est renseigné
        if (!email) {
            return res.status(400).send({
                success: false,
                message: 'Adresse email requise',
                error: 'Veuillez fournir une adresse email pour vous connecter.'
            });
        }

        // Vérifier si l'utilisateur existe avec cet email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Utilisateur non trouvé',
                error: 'Aucun compte n\'est associé à cet email.'
            });
        }

        // Vérifier si le mot de passe est renseigné
        if (!password) {
            return res.status(400).send({
                success: false,
                message: 'Mot de passe requis',
                error: 'Veuillez entrer votre mot de passe pour vous connecter.'
            });
        }

        // Vérifier si le mot de passe est correct
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).send({
                success: false,
                message: 'Mot de passe incorrect',
                error: 'Le mot de passe saisi est incorrect. Veuillez réessayer.'
            });
        }

        // Générer le token
        const token = generateToken(user);

        // Retourner l'utilisateur et le token (sans le mot de passe)
        const userObject = user.toObject();
        delete userObject.password;

        res.send({
            success: true,
            message: 'Connexion réussie',
            data: {
                user: userObject,
                token
            }
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Erreur lors de la connexion',
            error: error.message,
            details: 'Une erreur s\'est produite lors de la connexion. Veuillez réessayer.'
        });
    }
};


const loginWithCode = async (req, res) => {
    try {
        const { code } = req.body;

        // Vérifier si le code est fourni
        if (!code) {
            return res.status(400).send({
                success: false,
                message: 'Code requis',
                error: 'Veuillez fournir un code pour vous connecter.'
            });
        }

        // Vérifier si un utilisateur possède ce code
        const user = await User.findOne({ code });

        if (!user) {
            return res.status(401).send({
                success: false,
                message: 'Connexion échouée',
                error: 'Code incorrect'
            });
        }

        // Générer le token
        const token = generateToken(user);

        // Retourner l'utilisateur et le token (sans le mot de passe)
        const userObject = user.toObject();
        delete userObject.password;

        // ✅ Ne pas supprimer le code
        // await user.save(); // Plus besoin de save() si on ne modifie rien

        res.send({
            success: true,
            message: 'Connexion réussie avec le code',
            data: {
                user: userObject,
                token,
            },
        });
    } catch (error) {
        console.error('Erreur lors de la connexion avec le code:', error);
        res.status(500).send({
            success: false,
            message: 'Erreur lors de la connexion',
            error: error.message,
            details: 'Une erreur s\'est produite lors de la connexion avec le code. Veuillez réessayer.'
        });
    }
};


const logout = async (req, res) => {
    try {
        // Vous pouvez ajouter ici une logique pour blacklister le token si nécessaire
        res.send({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Erreur lors de la déconnexion',
            error: error.message,
            details: 'Une erreur s\'est produite lors de la déconnexion. Veuillez réessayer.'
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Utilisateur non trouvé',
                error: 'Aucun utilisateur trouvé avec cet identifiant.'
            });
        }
        res.send({
            success: true,
            message: 'Profil utilisateur récupéré avec succès',
            data: user
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Erreur lors de la récupération du profil',
            error: error.message,
            details: 'Une erreur s\'est produite lors de la récupération du profil utilisateur. Veuillez réessayer.'
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Récupérer l'utilisateur avec le mot de passe
        const user = await User.findById(req.user._id);

        // Vérifier l'ancien mot de passe
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).send({
                success: false,
                message: 'Mise à jour du mot de passe échouée',
                error: 'Mot de passe actuel incorrect'
            });
        }

        // Mettre à jour le mot de passe
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.send({
            success: true,
            message: 'Mot de passe mis à jour avec succès'
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Erreur lors de la mise à jour du mot de passe',
            error: error.message,
            details: 'Une erreur s\'est produite lors de la mise à jour du mot de passe. Veuillez réessayer.'
        });
    }
};

module.exports = {
    register,
    login,
    loginWithCode,
    logout,
    getCurrentUser,
    updatePassword
};
