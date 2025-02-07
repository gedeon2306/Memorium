const { request, response } = require('express')
const uuid = require('uuid')
const { addToHistory } = require('../config/historique')
const moment = require('moment')

exports.index = (request, response)=>{

    const actif = {
        'accueil' : true,
        'liste' : false,
        'ajouter' : false,
        'paiement' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'notes' : false,
        'history' : false,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }
    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        connection.query("SELECT COUNT(id) AS 'trous' FROM defunts WHERE place IS NOT NULL", [], (error, resultat) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            connection.query("SELECT COUNT(id) as 'users' FROM users", [], (error, users) => {
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }
    
                connection.query("SELECT COUNT(id) AS 'femmes' FROM defunts  WHERE genre = 'F'", [], (error, genreF) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error })
                    }
        
                    connection.query("SELECT COUNT(id) AS 'hommes' FROM defunts  WHERE genre = 'M'", [], (error, genreM) => {
                        if (error) {
                            return response.status(500).render('layout/500', { error })
                        }
            
                        connection.query("SELECT COUNT(id) AS 'adultes' FROM defunts  WHERE age >= 18", [], (error, adultes) => {
                            if (error) {
                                return response.status(500).render('layout/500', { error })
                            }
                
                            connection.query("SELECT COUNT(id) AS 'mineurs' FROM defunts  WHERE age < 18", [], (error, mineurs) => {
                                if (error) {
                                    return response.status(500).render('layout/500', { error })
                                }

                                addToHistory(request, 'A acceder à l\'accueil')
                    
                                response.status(200).render('layout/index', {
                                    actif,
                                    trous: resultat[0].trous, 
                                    users: users[0].users, 
                                    femmes : genreF[0].femmes, 
                                    hommes : genreM[0].hommes, 
                                    adultes : adultes[0].adultes, 
                                    mineurs : mineurs[0].mineurs
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

exports.stats = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'paiement' : false,
        'utilisateurs' : false,
        'statistique' : true,
        'messages' : false,
        'carte' : false,
        'notes' : false,
        'historique' : false,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }

    addToHistory(request, 'A acceder à statistique')

    response.status(200).render('layout/stats', {actif})
}

exports.carte = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'paiement' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : true,
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

        connection.query("SELECT place FROM defunts WHERE place IS NOT NULL", [], (error, resultat) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
            addToHistory(request, 'A acceder à la card')
            response.status(200).render('layout/carte', {actif, resultat})
        })
    })
}

exports.notes = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'paiement' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'notes' : true,
        'historique' : false,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }
    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        connection.query("SELECT place FROM defunts WHERE place IS NOT NULL", [], (error, resultat) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
            addToHistory(request, 'A acceder aux notes')
            response.status(200).render('layout/notes', {actif, resultat})
        })
    })
}

exports.historique = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'paiement' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'notes' : false,
        'historique' : true,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }

    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        addToHistory(request, 'A acceder à l\'historique')

        connection.query("SELECT h.*, u.nomComplet FROM historiques h, users u WHERE h.user_id = u.id ORDER BY date DESC ", [], (error, historiques) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            response.status(200).render('layout/historique', {actif, historiques, moment})

        })
    })
}

exports.login = ('/Connexion', (request, response)=>{
    
    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        connection.query('SELECT * FROM users', [], (error, users) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            
            request.session.token = uuid.v4()
            let token = request.session.token

            if (users.length === 0) {
                const titre = 'Créer un compte'
                response.status(200).render('layout/inscription', {titre, token})
            } else {
                const titre = 'Connexion'
                response.status(200).render('layout/connexion', {titre, token})
            }
        })
    })
})

exports.logout = (request, response) => {
    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        const query = 'INSERT INTO historiques (actionEffectuee, user_id) VALUES (?, ?)'
        connection.query(query, ['Déconnexion', request.session.userId], (error) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            request.session.destroy((error) => {
                if (error) {
                    return response.status(500).render('layout/500')
                }
                response.redirect('/')
            })
        })
    })
}