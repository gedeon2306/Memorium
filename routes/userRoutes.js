const express = require('express')
const router = express.Router()
const userController = require('../controllers/UserContoller')

router.get('/user.index', userController.index)
router.post('/user.store', userController.store)
router.post('/user.update', userController.update)
router.get('/user.delete/:id/:token', userController.delete)
router.post('/login', userController.login)
// router.post('/signup', userController.signup)

module.exports = router
