const express = require('express');
const router = express.Router();
const vaccineController = require('../controllers/vaccine.controller');
/* const authMiddleware = require('../middlewares/auth.middleware'); // Assurez-vous d'avoir un middleware d'authentification
 */
// Route pour ajouter un nouveau vaccin
router.post('/', vaccineController.addVaccine);

// Route pour obtenir tous les vaccins
router.get('/', vaccineController.getVaccines);

// Route pour obtenir les vaccins à venir
router.get('/upcoming', vaccineController.getUpcomingVaccines);

// Route pour mettre à jour un vaccin
router.put('/:id', vaccineController.updateVaccine);

// Route pour supprimer un vaccin
router.delete('/:id', vaccineController.deleteVaccine);

// Route pour obtenir les vaccins par utilisateur
router.get('/user', vaccineController.getVaccinesByUser);

module.exports = router;
