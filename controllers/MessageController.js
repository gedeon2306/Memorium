const uuid = require('uuid')
const moment  = require('../lib/moment')
const { addToHistory } = require('../config/historique')

exports.index = (request, response) => {

    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'paiement' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : true,
        'carte' : false,
        'notes' : false,
        'historique' : false,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }

    request.session.token = uuid.v4()
    let token = request.session.token

    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        connection.query('SELECT M.message, M.dateTime, u.nomComplet, u.role, u.photo FROM messages M, users u WHERE M.user_id = u.id ORDER BY M.dateTime DESC', [], (error, messages) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            addToHistory(request, 'A acceder aux messages')
            response.status(200).render('layout/messages', {token, actif, messages, moment})
        })
    })
}

exports.store = (request, response) =>{

    const message = request.body.message ? request.body.message : undefined

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { erreur })
        }

        if (!message || message === '') {
            request.flash('error', 'Saisissez le message a envoyer');
            return response.status(400).redirect('/message.index');
        }

        connection.query('INSERT INTO messages(message, user_id) VALUES(?,?)', [message, request.session.userId], (error)=>{
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            addToHistory(request, 'A envoyé un message')
            request.flash('success', "Message envoyé")
            return response.status(300).redirect('/message.index')
        })
    })
}