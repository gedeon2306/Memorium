const express = require('express')
const router = express.Router()
const controller = require('../controllers/Controller')
const checkAuth = require('../config/fonction')
const isAdmin = require('../middlewares/checkRole')

router.get('/', checkAuth, controller.index)

router.get('/paiement', checkAuth, controller.paiement)

router.get('/stats', checkAuth, isAdmin, controller.stats)

router.get('/carte', checkAuth, controller.carte)

router.get('/notes', checkAuth, controller.notes)

router.get('/historique', checkAuth, isAdmin, controller.historique)

router.get('/connexion', controller.login)

router.get('/logout', controller.logout)

module.exports = router