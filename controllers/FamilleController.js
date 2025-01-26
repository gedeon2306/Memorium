const uuid = require('uuid')

exports.index = (request, response) => {
    // if (!request.session.userId) {
    //     return response.redirect('/pageConnexion')
    // }

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

            response.status(200).render('layout/famille/listeFamille', {token, actif, familles})
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

        if (token!=request.session.token || token === undefined || token === '' ) {
            request.flash('error', "token invalide")
            return response.status(300).redirect('/famille.index')
        }else if (nomFamille === undefined || nomFamille === ''){
            request.flash('errorNomFamille', "Entrez le nom de la famille")
            return response.status(300).redirect('/famille.index')
        }else if (nomGarrant === undefined || nomGarrant === ''){
            request.flash('errorNomGarrant', "Entrez le nom du garrant")
            return response.status(300).redirect('/famille.index')
        }else if (prenomGarrant === undefined || prenomGarrant === ''){
            request.flash('errorPrenomGarrant', "Entrez le prenom du garrant")
            return response.status(300).redirect('/famille.index')
        }else if (profession === undefined || profession === ''){
            request.flash('errorProfession', "Entrez la profession")
            return response.status(300).redirect('/famille.index')
        }else if (telephone === undefined || telephone === ''){
            request.flash('errorTelephone', "Entrez le numéro de téléphone")
            return response.status(300).redirect('/famille.index')
        }else if (email === undefined || email === ''){
            request.flash('errorEmail', "Entrez l'adresse email'")
            return response.status(300).redirect('/famille.index')
        }

        connection.query('SELECT * FROM familles WHERE email = ?', [email], (error, results) => {
            if (error) {
                return response.status(500).render('layout/500', { error });
            }

            if (results.length > 0) {
                request.flash('error', "email déjà utilisé")
                return response.status(300).redirect('/famille.index')
            }

            connection.query('SELECT * FROM familles WHERE telephone = ?', [telephone], (error, results) => {
                if (error) {
                    return response.status(500).render('layout/500', { error });
                }
    
                if (results.length > 0) {
                    request.flash('error', "Numéro de téléphone déjà utilisé")
                    return response.status(300).redirect('/famille.index')
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
            });
        });
    })
}