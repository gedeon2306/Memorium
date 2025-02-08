const { request, response } = require('express')
const upload = require('../config/uploadDefunt')
const { nombreRandom } = require('../config/genereNombre')
const uuid = require('uuid')
const generateNumFacture = require('../config/genereNumFacture')
const moment = require('moment')
const { addToHistory } = require('../config/historique')

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

            addToHistory(request, 'A acceder à la liste des défunts')
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

            addToHistory(request, 'A acceder à l\'interface ajouter défunt')
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

                                    addToHistory(request, 'A ajouter le défunt '+ nom + ' ' + prenom)
                                    const paiementId = paiementResults.insertId
                                    request.flash('success', 'Défunt et paiement enregistrés avec succès');
                                    return response.status(200).redirect(`/paiement.show/${paiementId}`);
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

exports.update = (request, response) => {
    upload.single('photo')(request, response, (error) => {
        if (error) {
            return response.status(500).render('layout/500', { error });
        }

        const token = request.body.token ? request.body.token : undefined
        const { nom, prenom, genre, age, profession, dateNaiss, dateDeces, dateInhumation, dateIncineration, famille_id, id } = request.body;
        const photoPath = request.file ? request.file.filename : null;

        request.getConnection((error, connection) => {
            if (error) {
                return response.status(500).render('layout/500', { error });
            }

            if (!token || token !== request.session.token || token === undefined) {
                request.flash('error', 'Token invalide')
                return response.status(400).redirect('/defunt.show/' + id)
            }

            if (!nom || !genre || !age || !dateNaiss || !dateDeces || !dateInhumation || !dateIncineration || !famille_id) {
                request.flash('error', 'Tous les champs marqués en * rouge sont obligatoires')
                return response.status(400).redirect('/defunt.show/' + id);
            }

            function prepareUpdate() {
                let updateQuery = 'UPDATE defunts SET nom = ?, prenom = ?, genre = ?, age = ?, profession = ?, dateNaiss = ?, dateDeces = ?, dateInhumation = ?, dateIncineration = ?, famille_id = ?';
                let params = [nom, prenom, genre, age, profession, dateNaiss, dateDeces, dateInhumation, dateIncineration, famille_id];

                if (photoPath) {
                    updateQuery += ', photo = ?';
                    params.push(photoPath);
                    removeOldPhoto(() => executeUpdate(updateQuery, params));
                } else {
                    executeUpdate(updateQuery, params);
                }
            }

            function removeOldPhoto(callback) {
                connection.query('SELECT photo FROM defunts WHERE id = ?', [id], (error, results) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error });
                    }
                    if (results.length > 0 && results[0].photo) {
                        const oldImagePath = `public/images/imagesDefunts/${results[0].photo}`;
                        fs.unlink(oldImagePath, (err) => {
                            if (err) console.error("Erreur lors de la suppression de l'image:", err);
                            callback();
                        });
                    } else {
                        callback();
                    }
                });
            }

            function executeUpdate(query, params) {
                query += ' WHERE id = ?';
                params.push(id);
                connection.query(query, params, (error) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error });
                    }
                    addToHistory(request, 'A mis à jour les information du défunt '+ nom + ' ' + prenom)
                    request.flash('success', 'Defunt mis à jour');
                    return response.status(200).redirect('/defunt.show/' + id);
                });
            }

            prepareUpdate();
        });
    });
};

exports.show = (request, response) =>{

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

    request.session.token = uuid.v4()
    let token = request.session.token

    const id = request.params.id ? request.params.id : undefined

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        connection.query('SELECT d.*, f.nomFamille FROM defunts d, familles f WHERE d.famille_id = f.id AND d.id = ?', [id], (error, defunt)=>{
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
            
            if(defunt.length === 0){
                request.flash('error', "Defunt non trouvé")
                return response.status(400).redirect('/liste')
            }

            connection.query('SELECT * FROM familles', [], (error, familles) => {
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }
    
                addToHistory(request, 'A acceder aux informations du '+ defunt[0].nom + ' ' + defunt[0].prenom)
                return response.status(200).render('layout/detailDefunt', {defunt : defunt[0], actif, moment, token, familles})
            })
        })
    })
}

exports.incinerer = (request, response) =>{
    
    const id = request.params.id ? request.params.id : undefined
    const token = request.params.token ? request.params.token : undefined

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        if (token!=request.session.token || token === undefined || token === '' ) {
            request.flash('error', "Token invalide")
            return response.status(400).redirect('/liste')
        }

        connection.query('SELECT * FROM defunts WHERE id = ?', [id], (error, resultat)=>{
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
            
            if(resultat.length === 0){
                request.flash('error', "Defunt non trouvé")
                return response.status(400).redirect('/liste')
            }
            
            if(resultat[0].statut === 'Incineré'){
                addToHistory(request, 'A tenté d\'incinerer un défunt déjà incineré')
                request.flash('info', "L'incineration a déjà été fait pour ce defunt")
                return response.status(400).redirect('/liste')
            }

            if(resultat[0].statut === 'Inhumé'){
                if (request.session.role !== 'Administrateur'){
                    addToHistory(request, 'A tenté d\'incinerer un défunt dont l\'incineration n\'a pas encore été prevue')
                    request.flash('error', "L'incineration na pas encore été prevue, contactez l'administrateur")
                    return response.status(400).redirect('/liste')
                }
            }

            connection.query('UPDATE defunts SET place = ?, statut = ? WHERE id = ?', [null,'Incineré',id], (error)=>{
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }

                addToHistory(request, 'A incinerer le défunt '+ resultat[0].nom + ' ' + resultat[0].prenom)
                request.flash('success', "Defunt incineré")
                return response.status(300).redirect('/liste')
            })
        })
    })
}

exports.delete = (request, response) =>{
    
    const id = request.params.id ? request.params.id : undefined
    const token = request.params.token ? request.params.token : undefined

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        if (token!=request.session.token || token === undefined || token === '' ) {
            request.flash('error', "Token invalide")
            return response.status(400).redirect('/liste')
        }

        connection.query('SELECT * FROM defunts WHERE id = ?', [id], (error, resultat)=>{
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
            
            if(resultat.length === 0){
                request.flash('error', "Defunt non trouvé")
                return response.status(400).redirect('/liste')
            }

            connection.query('DELETE FROM defunts WHERE id = ?', [id], (error)=>{
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }

                addToHistory(request, 'A supprimé le défunt ' + resultat[0].nom + ' ' + resultat[0].prenom)
                request.flash('success', "Defunt supprimé")
                return response.status(300).redirect('/liste')
            })
        })
    })
}