const { request, response } = require('express')
const uuid = require('uuid')
const { addToHistory } = require('../config/historique')
const moment = require('../lib/moment')

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

                                connection.query("SELECT nom, prenom, dateEnregistrement FROM defunts ORDER BY dateEnregistrement DESC LIMIT 7", [], (error, dernierEnregistrement) => {
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
                                        mineurs : mineurs[0].mineurs,
                                        dernierEnregistrement,
                                        moment
                                    })
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

    const query = `
        SELECT COUNT(*) AS total, 
            SUM(CASE WHEN statut = 'incineré' THEN 1 ELSE 0 END) AS incineration, 
            SUM(CASE WHEN statut <> 'incineré' THEN 1 ELSE 0 END) AS inhumation 
        FROM defunts;`
    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }
        connection.query(query, [], (error, resultat) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
            
            const queryUsers = `
                SELECT COUNT(*) AS total, 
                    SUM(CASE WHEN role = 'administrateur' THEN 1 ELSE 0 END) AS administrateurs, 
                    SUM(CASE WHEN role = 'stagiaire' THEN 1 ELSE 0 END) AS stagiaires 
                FROM users; `
            connection.query(queryUsers, [], (error, users) => {
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }
                
                const sql = `
                    SELECT 
                        YEAR(dateInhumation) AS annee,
                        MONTH(dateInhumation) AS mois,
                        COUNT(*) AS nombre_inhumations
                    FROM defunts
                    GROUP BY annee, mois
                    ORDER BY annee DESC, mois ASC;
                `
                connection.query(sql, [], (error, data) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error })
                    }
                    
                    const sqlInc = `
                        SELECT 
                        YEAR(dateIncineration) AS annee,
                        MONTH(dateIncineration) AS mois,
                        COUNT(*) AS nombre_incinerations
                    FROM defunts
                    GROUP BY annee, mois
                    ORDER BY annee DESC, mois ASC;

                    `
                    connection.query(sqlInc, [], (error, dataInc) => {
                        if (error) {
                            return response.status(500).render('layout/500', { error })
                        }
                        
                        addToHistory(request, 'A acceder à statistique')
            
                        response.status(200).render('layout/stats', {actif, resultat : resultat[0], users : users[0], data, dataInc})
                    })
                })
            })
        })
    })
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

        connection.query("SELECT id, place FROM defunts WHERE place IS NOT NULL", [], (error, resultat) => {
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