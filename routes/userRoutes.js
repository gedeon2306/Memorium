const express = require('express')
const router = express.Router()
const userController = require('../controllers/UserContoller')
const checkAuth = require('../config/fonction');

router.get('/user.index', checkAuth, userController.index)
router.post('/user.store', userController.store)
router.post('/user.update', checkAuth, userController.update)
router.get('/user.delete/:id/:token', checkAuth, userController.delete)
router.post('/login', userController.login)

module.exports = router
