const express = require('express')
const router = express.Router()
const familleController = require('../controllers/FamilleController')
const checkAuth = require('../config/fonction');

router.get('/famille.index', checkAuth, familleController.index)
router.post('/famille.store', checkAuth, familleController.store)
router.post('/famille.update', checkAuth, familleController.update)
router.get('/famille.delete/:id/:token', checkAuth, familleController.delete)

module.exports = router