const { request, response } = require('express')
const uuid = require('uuid')

exports.ajouter = (request, response)=>{
    request.session.token = uuid.v4()
    let token = request.session.token
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : true,
        'paiement' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'notes' : false,
        'historique' : false,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }

    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        connection.query('SELECT * FROM familles', [], (error, familles) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            response.status(200).render('layout/ajouter', {token, actif, familles})
        })
    })
}