const { request, response } = require('express')
const upload = require('../config/uploadDefunt')
const { nombreRandom } = require('../config/genereNombre')
const uuid = require('uuid')
const generateNumFacture = require('../config/genereNumFacture')

exports.liste = (request, response)=>{

    const actif = {
        'accueil' : false,
        'liste' : true,
        'ajouter' : false,
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

        connection.query('SELECT * FROM defunts', [], (error, defunts) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            response.status(200).render('layout/liste', {actif, defunts})
        })
    })
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

exports.store = (request, response) => {
    upload.single('image')(request, response, (error) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        const token = request.body.token ? request.body.token : undefined
        const nom = request.body.nom
        const prenom = request.body.prenom
        const genre = request.body.genre
        const age = request.body.age
        const profession = request.body.profession
        const dateNaiss = request.body.dateNaiss
        const dateDeces = request.body.dateDeces
        const dateInhumation = request.body.dateInhumation
        const dateInceneration = request.body.dateInceneration
        const familleId = request.body.familleId
        const montant = request.body.montant
        const moyenPaiement = request.body.moyenPaiement
        const imagePath = request.file ? request.file.filename : null

        request.getConnection((error, connection) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            if (!token || token !== request.session.token || token === undefined) {
                request.flash('error', 'Token invalide')
                return response.status(400).redirect('/user.index')
            }

            if (!nom || !genre || !age || !dateNaiss || !dateDeces || !dateInhumation || !dateInceneration || !familleId || !montant || !moyenPaiement) {
                request.flash('error', 'Tous les champs marqués en * rouge sont obligatoires')
                return response.status(400).redirect('/user.index')
            }

            // Fonction récursive pour trouver une place disponible
            const trouvePlace = () => {
                const place = nombreRandom()
                connection.query('SELECT * FROM defunts WHERE place = ?', [place], (error, results) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error })
                    }

                    if (results.length > 0) {
                        // Si la place est prise, on en cherche une autre
                        trouvePlace()
                    } else {
                        // Si la place est libre, on peut insérer les données
                        const query = 'INSERT INTO defunts (photo, nom, prenom, genre, age, profession, dateNaiss, dateDeces, place, dateInhumation, dateIncineration, famille_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                        connection.query(query, [imagePath, nom, prenom, genre, age, profession, dateNaiss, dateDeces, place, dateInhumation, dateInceneration, familleId], (error, results) => {
                            if (error) {
                                return response.status(500).render('layout/500', { error })
                            }

                            // Récupérer l'ID du dernier enregistrement inséré
                            const defuntId = results.insertId; 

                            generateNumFacture(connection, (error, numFacture) => {
                                if (error) {
                                    return response.status(500).render('layout/500', { error });
                                }
            
                                // Insérer le paiement
                                const paiementQuery = `INSERT INTO paiements (numFacture, montant, dateIncinerationPrevue, moyenPaiement, famille_id, defunt_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                                
                                connection.query(paiementQuery, [numFacture, montant, dateInceneration, moyenPaiement, familleId, defuntId, request.session.userId], (error, paiementResults) => {
                                    if (error) {
                                        return response.status(500).render('layout/500', { error });
                                    }
            
                                    request.flash('success', 'Défunt et paiement enregistrés avec succès');
                                    return response.status(200).redirect('/defunt.ajouter');
                                });
                            });
                        })
                    }
                })
            }

            // Lancer la recherche de place disponible
            trouvePlace()
        })
    })
}
