const express = require('express')
const router = express.Router()
const paiementController = require('../controllers/PaiementController')
const checkAuth = require('../config/fonction')
const isAdmin = require('../middlewares/checkRole')

router.get('/paiement.index', checkAuth, paiementController.index)
router.post('/paiement.store', checkAuth, paiementController.store)
router.post('/paiement.update', checkAuth, paiementController.update)
router.get('/paiement.delete/:id/:token', checkAuth, isAdmin, paiementController.delete)

module.exports = router