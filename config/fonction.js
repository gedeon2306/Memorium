const {request} = require('express')
exports.vc = function verifConnexion(){
    if (!request.session.userId) {
        return response.redirect('/connexion')
    }
}