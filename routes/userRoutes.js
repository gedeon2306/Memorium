const express = require('express')
const router = express.Router()
const userController = require('../controllers/UserContoller')
const checkAuth = require('../config/fonction')
const isAdmin = require('../middlewares/checkRole')

router.get('/user.index', checkAuth, isAdmin, userController.index)
router.post('/user.store', userController.store)
router.post('/user.update', checkAuth, isAdmin, userController.update)
router.get('/user.delete/:id/:token', checkAuth, isAdmin, userController.delete)
router.post('/login', userController.login)

module.exports = router
