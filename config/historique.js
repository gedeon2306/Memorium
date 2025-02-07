const dbConfig = require('../database/database')

function addToHistory(request, actionEffectuee) {
    if (!request.session || !request.session.userId) {
        console.error("Utilisateur non authentifié")
        return
    }

    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        const query = 'INSERT INTO historiques (actionEffectuee, user_id) VALUES (?, ?)'
        connection.query(query, [actionEffectuee, request.session.userId], (error) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
        })
    })
}

module.exports = { addToHistory }
