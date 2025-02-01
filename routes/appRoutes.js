const express = require('express')
const router = express.Router()
const tacheController = require('../controllers/Controller')
const checkAuth = require('../config/fonction');

router.get('/', checkAuth, tacheController.index)

router.get('/liste', checkAuth, tacheController.liste)

router.get('/paiement', checkAuth, tacheController.paiement)

router.get('/stats', checkAuth, tacheController.stats)

router.get('/messages', checkAuth, tacheController.messages)

router.get('/carte', checkAuth, tacheController.carte)

router.get('/notes', checkAuth, tacheController.notes)

router.get('/historique', checkAuth, tacheController.historique)

router.get('/connexion', tacheController.login)

router.get('/logout', tacheController.logout)

module.exports = router