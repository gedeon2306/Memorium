
exports.index = (request, response)=>{
    const actif = {
        'accueil' : true,
        'liste' : false,
        'ajouter' : false,
        'voir' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'history' : false,
        'famille' : false,
    }
    response.status(200).render('layout/index', {actif})
}

exports.liste = (request, response)=>{
    // if (!request.session.userId) {
    //     return response.redirect('/pageConnexion'); // Si l'utilisateur n'est pas connecté, le rediriger
    // }
    const actif = {
        'accueil' : false,
        'liste' : true,
        'ajouter' : false,
        'voir' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'historique' : false,
        'famille' : false,
    }
    response.status(200).render('layout/liste', {actif})
}

exports.ajouter = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : true,
        'voir' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'historique' : false,
        'famille' : false,
    }
    response.status(200).render('layout/ajouter', {actif})
}

exports.voir = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'voir' : true,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'historique' : false,
        'famille' : false,
    }
    response.status(200).render('layout/voir', {actif})
}

exports.utilisateurs = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'voir' : false,
        'utilisateurs' : true,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'historique' : false,
        'famille' : false,
    }
    response.status(200).render('layout/utilisateurs', {actif})
}

exports.stats = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'voir' : false,
        'utilisateurs' : false,
        'statistique' : true,
        'messages' : false,
        'carte' : false,
        'historique' : false,
        'famille' : false,
    }
    response.status(200).render('layout/stats', {actif})
}

exports.messages = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'voir' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : true,
        'carte' : false,
        'historique' : false,
        'famille' : false,
    }
    response.status(200).render('layout/messages', {actif})
}

exports.carte = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'voir' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : true,
        'historique' : false,
        'famille' : false,
    }
    response.status(200).render('layout/carte', {actif})
}

exports.historique = (request, response)=>{
    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'voir' : false,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'historique' : true,
        'famille' : false,
    }
    response.status(200).render('layout/historique', {actif})
}

exports.famille = (request, response)=>{
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
    response.status(200).render('layout/famille', {actif})
}

exports.logout = ('/logout', (request, response) => {
    // Détruire la session
    request.session.destroy((error) => {
        if (error) {
            context = {
                erreur : "Erreur lors de la déconnexion",
                statut : 500,
                url : "/tache.index"
            }
            return response.status(500).render('layout/erreur');
        }

        response.redirect('/');
    });
});


