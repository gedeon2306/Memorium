const express = require('express')
const router = express.Router()
const defuntController = require('../controllers/DefuntController')
const checkAuth = require('../config/fonction')
const isAdmin = require('../middlewares/checkRole')

router.get('/liste', checkAuth, defuntController.liste)
router.get('/defunt.ajouter', checkAuth, defuntController.ajouter)
router.get('/defunt.show/:id', checkAuth, defuntController.show)
router.post('/defunt.store', checkAuth, defuntController.store)
router.post('/defunt.update', checkAuth, defuntController.update)
router.get('/defunt.incinerer/:id/:token', checkAuth, defuntController.incinerer)
router.get('/defunt.delete/:id/:token', checkAuth, isAdmin, defuntController.delete)

module.exports = router