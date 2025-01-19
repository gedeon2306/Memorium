
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
        'parametre' : false,
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
        'parametre' : false,
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
        'parametre' : false,
    }
    response.status(200).render('layout/ajouter', {actif})
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


