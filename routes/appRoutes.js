const express = require('express')
const router = express.Router()
const tacheController = require('../controllers/Controller')

router.get('/',tacheController.index)

router.get('/liste',tacheController.liste)

router.get('/ajouter',tacheController.ajouter)

router.get('/logout',tacheController.logout)

module.exports = router