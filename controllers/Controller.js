const { request, response } = require('express')
const uuid = require('uuid')

exports.index = (request, response)=>{
    if (!request.session.userId) {
        return response.redirect('/connexion')
    }

    const actif = {
        'accueil' : true,
        'liste' : false,
        'ajouter' : false,
        'paiement' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
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

exports.liste = (request, response)=>{
    // if (!request.session.userId) {
    //     return response.redirect('/pageConnexion'); // Si l'utilisateur n'est pas connecté, le rediriger
    // }
    const actif = {
        'accueil' : false,
        'liste' : true,
        'ajouter' : false,
        'paiement' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'historique' : false,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }
    response.status(200).render('layout/liste', {actif})
}

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
        'historique' : false,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }
    response.status(200).render('layout/ajouter', {actif, token})
}

exports.paiement = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'paiement' : true,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'historique' : false,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }
    response.status(200).render('layout/paiement', {actif})
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
        'historique' : false,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }
    response.status(200).render('layout/stats', {actif})
}

exports.messages = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'paiement' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : true,
        'carte' : false,
        'historique' : false,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }
    response.status(200).render('layout/messages', {actif})
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
            response.status(200).render('layout/carte', {actif, resultat})
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
        'historique' : true,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }
    response.status(200).render('layout/historique', {actif})
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

exports.logout = ('/logout', (request, response) => {
    // Détruire la session
    request.session.destroy((error) => {
        if (error) {
            return response.status(500).render('layout/500');
        }

        response.redirect('/');
    });
});


