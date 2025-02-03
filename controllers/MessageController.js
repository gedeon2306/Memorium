const uuid = require('uuid')
const moment = require('moment');

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

            response.status(200).render('layout/messages', {token, actif, messages, moment})
        })
    })
}

// exports.store = (request, response) =>{

//     const token = request.body.token ? request.body.token : undefined
//     const nomFamille = request.body.nomFamille
//     const nomGarrant = request.body.nomGarrant
//     const prenomGarrant = request.body.prenomGarrant
//     const profession = request.body.profession
//     const telephone = request.body.telephone
//     const email = request.body.email

//     request.getConnection((error, connection)=>{
//         if (error) {
//             return response.status(500).render('layout/500', { erreur })
//         }

//         if (!token || token !== request.session.token) {
//             request.flash('error', 'Token invalide');
//             return response.status(400).redirect('/famille.index');
//         }

//         if (!nomFamille || !nomGarrant || !prenomGarrant || !profession || !telephone || !email) {
//             request.flash('error', 'Tous les champs sont obligatoires');
//             return response.status(400).redirect('/famille.index');
//         }

//         connection.query('SELECT * FROM familles WHERE email = ?', [email], (error, results) => {
//             if (error) {
//                 return response.status(500).render('layout/500', { error })
//             }

//             if (results.length > 0) {
//                 request.flash('error', "email déjà utilisé")
//                 return response.status(400).redirect('/famille.index')
//             }

//             connection.query('SELECT * FROM familles WHERE telephone = ?', [telephone], (error, results) => {
//                 if (error) {
//                     return response.status(500).render('layout/500', { error })
//                 }
    
//                 if (results.length > 0) {
//                     request.flash('error', "Numéro de téléphone déjà utilisé")
//                     return response.status(400).redirect('/famille.index')
//                 }

//                 connection.query(
//                     'INSERT INTO familles(nomFamille, nomGarrant, prenomGarrant, profession, telephone, email) VALUES(?,?,?,?,?,?)', 
//                     [nomFamille, nomGarrant, prenomGarrant, profession, telephone, email],
//                     (error)=>{
//                     if (error) {
//                         return response.status(500).render('layout/500', { error })
//                     }

//                     request.flash('success', "Famille enregistrée")
//                     return response.status(300).redirect('/famille.index')
//                 })
//             })
//         })
//     })
// }