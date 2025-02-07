const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const session = require('express-session')

const userRoutes = require('./routes/userRoutes')
const appRoutes = require('./routes/appRoutes')
const familleRoutes = require('./routes/familleRoutes')
const defuntRoutes = require('./routes/defuntRoutes')
const messageRoutes = require('./routes/messageRoutes')
const paiementRoutes = require('./routes/paiementRoutes')

const dbConfig = require('./database/database')
const app = express()
const port = 9090
const domaine = '127.0.0.1'

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
    secret : 'agdhdjieyieyuxnjsezertyzu', // Clé secrète pour la session
    resave : false, // Ne pas sauvegarder la session si rien n'a changé
    saveUninitialized : true, // Sauvegarder les sessions non initialisées
    //cookie : {secure : false} // Définition du cookie de session, ici non sécurisé
    cookie: { maxAge: 15 * 60 * 1000 } // Déconnexion après 15 minutes d'inactivité
}));

// Middleware pour rafraîchir la session si l'utilisateur est actif
app.use((req, res, next) => {
    if (req.session) {
        req.session.touch(); // Rafraîchit la session
    }
    next();
});

app.use(morgan('dev'))
app.use(require('./middlewares/flash'))
app.use('/assets', express.static('public'))
app.use(dbConfig)
app.use(require('./middlewares/flash'))

app.use('/', userRoutes)
app.use('/', appRoutes)
app.use('/', familleRoutes)
app.use('/', defuntRoutes)
app.use('/', messageRoutes)
app.use('/', paiementRoutes)

app.use((request, response)=>{
    response.status(404).render('layout/404')
})

app.listen(port,()=>{
    console.log()
    console.log('Serveur lancé : http://'+domaine+':'+port)
})