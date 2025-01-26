const express = require('express')
const router = express.Router()
const familleController = require('../controllers/FamilleController')

router.get('/famille.index', familleController.index)
router.post('/famille.store',familleController.store)
// router.post('/famille.update',familleController.update)
// router.get('/famille.delete/:id',familleController.delete)

module.exports = router