const express = require('express')
const router = express.Router()
const tacheController = require('../controllers/Controller')

router.get('/',tacheController.index)

router.get('/liste',tacheController.liste)

router.get('/ajouter',tacheController.ajouter)

router.get('/payement',tacheController.payement)

router.get('/stats',tacheController.stats)

router.get('/messages',tacheController.messages)

router.get('/carte',tacheController.carte)

router.get('/historique',tacheController.historique)

router.get('/connexion',tacheController.login)

router.get('/logout',tacheController.logout)

module.exports = router