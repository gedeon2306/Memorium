const express = require('express')
const router = express.Router()
const paiementController = require('../controllers/PaiementController')
const checkAuth = require('../config/fonction')
const isAdmin = require('../middlewares/checkRole')

router.get('/paiement.index', checkAuth, paiementController.index)
router.post('/paiement.store.inhumation', checkAuth, paiementController.storeInh)
router.post('/paiement.store.incineration', checkAuth, paiementController.storeInc)
router.post('/paiement.update', checkAuth, paiementController.update)
router.get('/paiement.delete/:id/:token', checkAuth, isAdmin, paiementController.delete)
router.get('/paiement.show/:id', checkAuth, paiementController.show)
router.get('/paiement.print/:id', checkAuth, paiementController.print)

module.exports = router