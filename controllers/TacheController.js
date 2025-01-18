const moment = require('../lib/moment')
const uuid = require('uuid')

exports.index = (request, response) => {
    if (!request.session.userId) {
        return response.redirect('/pageConnexion')
    }

    const titre = 'Accueil'
    const userId = request.session.userId
    request.session.token = uuid.v4()
    let token = request.session.token

    request.getConnection((error, connection) => {
        if (error) {
            const context = {
                erreur: error,
                statut: 500,
                url: "/tache.index"
            }
            return response.status(500).render('layout/erreur', { context })
        }

        connection.query('SELECT * FROM taches WHERE user_id = ? ORDER BY date DESC, heure ASC', [userId], (error, taches) => {
            if (error) {
                const context = {
                    erreur: error,
                    statut: 500,
                    url: "/tache.index"
                }
                return response.status(500).render('layout/erreur', { context })
            }

            taches.forEach(tache => {
                tache.date = moment(tache.date).format('YYYY-MM-DD')
                const dateSys = moment().format('YYYY-MM-DD HH:mm')
                const dateTimeTache = moment(tache.date + " " + tache.heure, 'YYYY-MM-DD HH:mm')
                let statutTache = null
                if (dateTimeTache.isBefore(dateSys) & tache.statut == 0) {
                    statutTache = 'Tâche expirée'
                } else if (tache.statut == 1) {
                    statutTache = 'Tâche validée'
                }else{
                    statutTache = 'Tâche en attente'
                }
                
                tache.statut = statutTache
            })

            response.status(200).render('layout/taches/listeTache', { titre, taches , token})
        })
    })
}

exports.store = (request, response) =>{
    if (!request.session.userId) {
        return response.redirect('/pageConnexion')
    }

    const token = request.body.token ? request.body.token : undefined
    const libelle = request.body.libelle
    const date = request.body.date
    const heure = request.body.heure
    const userId = request.session.userId

    request.getConnection((error, connection)=>{
        if (error) {
            const context = {
                erreur : error,
                statut : 500,
                url : "/tache.index"
            }
            return response.status(500).render('layout/erreur', { context })
        }

        if (token!=request.session.token || token === undefined || token === '' ) {
            request.flash('error', "token invalide")
            return response.status(300).redirect('/tache.index')
        }else if (libelle === undefined || libelle === ''){
            request.flash('errorLibelle', "Entrez le libellé de la tache")
            return response.status(300).redirect('/tache.index')
        }else if (date === undefined || date === ''){
            request.flash('errorDate', "Entrez le date de la tâche")
            return response.status(300).redirect('/tache.index')
        }else if (heure === undefined || heure === ''){
            request.flash('errorHeure', "Entrez l'heure de la tâche'")
            return response.status(300).redirect('/tache.index')
        }

        connection.query(
            'INSERT INTO taches(libelle, date, heure, user_id) VALUES(?,?,?,?)', [libelle, date, heure, userId], (error)=>{
                if (error) {
                    const context = {
                        erreur : error,
                        statut : 500,
                        url : "/tache.index"
                    }
                    return response.status(500).render('layout/erreur', { context })
                }

                request.flash('success', "Tâche enregistrée")
                return response.status(300).redirect('/tache.index')
            })
    })
}

exports.update = (request, response) =>{
    if (!request.session.userId) {
        return response.redirect('/pageConnexion')
    }

    const token = request.body.token
    const id = request.body.id
    const libelle = request.body.libelle
    const date = request.body.date
    const heure = request.body.heure
    const userId = request.session.userId

    request.getConnection((error, connection)=>{
        if (error) {
            const context = {
                erreur : error,
                statut : 500,
                url : "/tache.index"
            }
            return response.status(500).render('layout/erreur', { context })
        }

        if (token!=request.session.token || token === undefined || token === '' ) {
            request.flash('error', "token invalide")
            return response.status(300).redirect('/tache.index')
        }else if (libelle === undefined || libelle === ''){
            request.flash('', "Entrez le libellé de la tache")
            return response.status(300).redirect('/tache.index')
        }else if (date === undefined || date === ''){
            request.flash('errorDate', "Entrez le date de la tâche")
            return response.status(300).redirect('/tache.index')
        }else if (heure === undefined || heure === ''){
            request.flash('errorHeure', "Entrez l'heure de la tâche'")
            return response.status(300).redirect('/tache.index')
        }

        connection.query(
            'UPDATE taches SET libelle = ?, date = ?, heure = ? WHERE id = ? AND user_id = ?', [libelle, date, heure, id, userId], (error)=>{
                if (error) {
                    const context = {
                        erreur : error,
                        statut : 500,
                        url : "/tache.index"
                    }
                    return response.status(500).render('layout/erreur', { context })
                }

                request.flash('success', "Tâche Modifiée")
                return response.status(300).redirect('/tache.index')
            })
    })
}

exports.validate = (request, response) =>{
    if (!request.session.userId) {
        return response.redirect('/pageConnexion')
    }

    const id = request.params.id
    const userId = request.session.userId

    request.getConnection((error, connection)=>{
        if (error) {
            const context = {
                erreur : error,
                statut : 500,
                url : "/tache.index"
            }
            return response.status(500).render('layout/erreur', { context })
        }

        connection.query(
            'UPDATE taches SET statut = ? WHERE id = ? AND user_id = ?', [1, id, userId], (error)=>{
                if (error) {
                    const context = {
                        erreur : error,
                        statut : 500,
                        url : "/tache.index"
                    }
                    return response.status(500).render('layout/erreur', { context })
                }
                request.flash('success', "Tâche validée")
                return response.status(300).redirect('/tache.index')
            })
    })
}

exports.delete = (request, response) =>{
    if (!request.session.userId) {
        return response.redirect('/pageConnexion') // Si l'utilisateur n'est pas connecté, le rediriger
    }
    
    const id = request.params.id
    const userId = request.session.userId

    request.getConnection((error, connection)=>{
        if (error) {
            const context = {
                erreur : error,
                statut : 500,
                url : "/tache.index"
            }
            return response.status(500).render('layout/erreur', { context })
        }

        connection.query(
            'DELETE FROM taches WHERE id = ? AND user_id = ?', [id, userId], (error)=>{
                if (error) {
                    const context = {
                        erreur : error,
                        statut : 500,
                        url : "/tache.index"
                    }
                    return response.status(500).render('layout/erreur', { context })
                }
                request.flash('success', "Tâche supprimée")
                return response.status(300).redirect('/tache.index')
            })
    })
}

/*
Vous avez ete recruté en qualité de genie informaticien pour développer une application 
destinée à la gestion du personnel et à la gestion des étudiants de ECES. 
Etape 1 : l'application devra demander à l'utilisateur un mdp avant son ouverture. 
          Si le mot de passe est éronné l'application devra signaler que le mdp est eronné.
          Lorque le mdp est correcte on passe à l'étape 2
Etape 2 : Afficher l'interface d'acceuil qui doit contenir les fonctions suivant: administration, étudiant.
          L'utilisateur à la possibilité de cliquer sur les deux
Etape 3 : en cliquant sur administration on obtient les information suivantes: Ajouter, modifier, supprimer, afficher
          en cliquant sur étudianton obtient les information suivantes: Ajouter, modifier, supprimer, bulletin
Etape 4 : Gestion des interfaces

*Etudiants : Pour le boutton Ajout celui-ci permet d'ajouter un nouvel étudiant
             Le boutton bulletin compte à lui permet ajouter toutes les notes obtenues par l'étudiant et de générer le bulettin final
             le boutton modification permet de modifier certaines informations concernant l'étudiant
             le boutton suppression supprime un etudiant de l'application

*administration : le buutton ajout enregistre un nouvel agent dans l'application
                  le boutton modification apporte des modification sur les informations d'un agent
                  le boutton suivie permet d'avoir une vue panoramique sur le personnel de l'administration
                  le boutton suppression supprime un membre du l'administration de l'application

Etape 5 : l'application devrat ajouter un boutton qui permet de quitter l'application
*/