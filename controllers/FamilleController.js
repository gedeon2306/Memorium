const uuid = require('uuid')

exports.index = (request, response) => {
    if (!request.session.userId) {
        return response.redirect('/pageConnexion')
    }

    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'voir' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'historique' : false,
        'famille' : true,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }

    request.session.token = uuid.v4()
    let token = request.session.token

    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        connection.query('SELECT * FROM familles', [], (error, familles) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            response.status(200).render('layout/familles', {token, actif, familles})
        })
    })
}

exports.store = (request, response) =>{
    // if (!request.session.userId) {
    //     return response.redirect('/pageConnexion')
    // }

    const token = request.body.token ? request.body.token : undefined
    const nomFamille = request.body.nomFamille
    const nomGarrant = request.body.nomGarrant
    const prenomGarrant = request.body.prenomGarrant
    const profession = request.body.profession
    const telephone = request.body.telephone
    const email = request.body.email

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { erreur })
        }

        if (!token || token !== request.session.token) {
            request.flash('error', 'Token invalide');
            return response.status(400).redirect('/famille.index');
        }

        if (!nomFamille || !nomGarrant || !prenomGarrant || !profession || !telephone || !email) {
            request.flash('error', 'Tous les champs sont obligatoires');
            return response.status(400).redirect('/famille.index');
        }

        connection.query('SELECT * FROM familles WHERE email = ?', [email], (error, results) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            if (results.length > 0) {
                request.flash('error', "email déjà utilisé")
                return response.status(400).redirect('/famille.index')
            }

            connection.query('SELECT * FROM familles WHERE telephone = ?', [telephone], (error, results) => {
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }
    
                if (results.length > 0) {
                    request.flash('error', "Numéro de téléphone déjà utilisé")
                    return response.status(400).redirect('/famille.index')
                }

                connection.query(
                    'INSERT INTO familles(nomFamille, nomGarrant, prenomGarrant, profession, telephone, email) VALUES(?,?,?,?,?,?)', 
                    [nomFamille, nomGarrant, prenomGarrant, profession, telephone, email],
                    (error)=>{
                    if (error) {
                        return response.status(500).render('layout/500', { error })
                    }

                    request.flash('success', "Famille enregistrée")
                    return response.status(300).redirect('/famille.index')
                })
            })
        })
    })
}

exports.update = (request, response) =>{
    // if (!request.session.userId) {
    //     return response.redirect('/pageConnexion')
    // }

    const token = request.body.token ? request.body.token : undefined
    const id = request.body.id
    const nomFamille = request.body.nomFamille
    const nomGarrant = request.body.nomGarrant
    const prenomGarrant = request.body.prenomGarrant
    const profession = request.body.profession
    const telephone = request.body.telephone
    const email = request.body.email

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        if (!token || token !== request.session.token) {
            request.flash('error', 'Token invalide');
            return response.status(400).redirect('/famille.index');
        }

        if (!nomFamille || !nomGarrant || !prenomGarrant || !profession || !telephone || !email) {
            request.flash('error', 'Tous les champs sont obligatoires');
            return response.status(400).redirect('/famille.index');
        }

        connection.query('SELECT * FROM familles WHERE email = ? AND id != ? ', [email, id], (error, results) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            if (results.length > 0) {
                request.flash('error', "email déjà utilisé")
                return response.status(400).redirect('/famille.index')
            }

            connection.query('SELECT * FROM familles WHERE telephone = ? AND id != ?', [telephone, id], (error, results) => {
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }
    
                if (results.length > 0) {
                    request.flash('error', "Numéro de téléphone déjà utilisé")
                    return response.status(400).redirect('/famille.index')
                }

                connection.query(
                    'UPDATE familles SET nomFamille = ?, nomGarrant = ?, prenomGarrant = ?, profession = ?, telephone = ?, email = ? WHERE id = ?', [nomFamille, nomGarrant, prenomGarrant, profession, telephone, email, id], (error)=>{
                    if (error) {
                        return response.status(500).render('layout/500', { error })
                    }
    
                    request.flash('success', "Famille Modifiée")
                    return response.status(300).redirect('/famille.index')
                })
            })
        })
    })
}

exports.delete = (request, response) =>{
    // if (!request.session.userId) {
    //     return response.redirect('/pageConnexion') // Si l'utilisateur n'est pas connecté, le rediriger
    // }
    
    const id = request.params.id
    const token = request.params.token ? request.params.token : undefined

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        if (token!=request.session.token || token === undefined || token === '' ) {
            request.flash('error', "token invalide")
            return response.status(400).redirect('/famille.index')
        }

        connection.query('SELECT * FROM familles WHERE id = ?', [id], (error, resultat)=>{
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
            
            if(resultat.length === 0){
                request.flash('error', "Famille non trouvée")
                return response.status(400).redirect('/famille.index')
            }

            connection.query('DELETE FROM familles WHERE id = ?', [id], (error)=>{
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }
                request.flash('success', "Famille supprimée")
                return response.status(300).redirect('/famille.index')
            })
        })
    })
}