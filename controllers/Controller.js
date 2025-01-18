
exports.index = (request, response)=>{
    const titre = 'TODOLIST'
    response.status(200).render('layout/index', {titre})
}

exports.about = (request, response)=>{
    if (!request.session.userId) {
        return response.redirect('/pageConnexion'); // Si l'utilisateur n'est pas connecté, le rediriger
    }
    const titre = 'A propos'
    response.status(200).render('layout/apropos', {titre})
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


