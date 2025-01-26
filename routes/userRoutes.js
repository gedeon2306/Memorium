const express = require('express')
const router = express.Router()
const userController = require('../controllers/UserContoller')

router.get('/user.index', userController.index)
router.get('/pageConnexion', userController.pageConnexion)
router.get('/pageInscription', userController.pageInscription)
router.post('/login', userController.login)
router.post('/signup', userController.signup)

module.exports = router
