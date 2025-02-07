const express = require('express')
const router = express.Router()
const messageController = require('../controllers/MessageController')
const checkAuth = require('../config/fonction')

router.get('/message.index', checkAuth, messageController.index)
router.post('/message.store', checkAuth, messageController.store)

module.exports = router