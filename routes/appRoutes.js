const express = require('express')
const router = express.Router()
const tacheController = require('../controllers/Controller')

router.get('/',tacheController.index)

router.get('/apropos',tacheController.about)

router.get('/logout',tacheController.logout)

module.exports = router