module.exports = (request, response, next) => {
    if (request.session.role === 'Administrateur') {
        return next();
    } else {
        request.flash('errorAcces', 'Accès refusé. Vous devez être administrateur.');
        return response.redirect('/');
    }
};
