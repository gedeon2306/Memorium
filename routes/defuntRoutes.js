const express = require('express')
const router = express.Router()
const defuntController = require('../controllers/DefuntController')
const checkAuth = require('../config/fonction');

// router.get('/defunt.index', checkAuth, defuntController.index)
router.get('/defunt.ajouter', checkAuth, defuntController.ajouter)
// router.post('/defunt.store', checkAuth, defuntController.store)
// router.post('/defunt.update', checkAuth, defuntController.update)
// router.get('/defunt.delete/:id/:token', checkAuth, defuntController.delete)

module.exports = router