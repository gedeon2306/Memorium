const express = require('express')
const router = express.Router()
const tacheController = require('../controllers/TacheController')

router.get('/tache.index',tacheController.index)
router.post('/tache.store',tacheController.store)
router.post('/tache.update',tacheController.update)
router.get('/tache.validate/:id',tacheController.validate)
router.get('/tache.delete/:id',tacheController.delete)

module.exports = router