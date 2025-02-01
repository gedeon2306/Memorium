// config/fonction.js
function checkAuth(request, response, next) {
    if (!request.session.userId) {
        return response.redirect('/connexion')
    }
    next()
}

module.exports = checkAuth