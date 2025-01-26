const bcrypt = require('bcrypt');  // Utilisation de bcrypt pour sécuriser les mots de passe
const uuid = require('uuid')

exports.index = (request, response)=>{
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
    
    request.session.token = uuid.v4()
    let token = request.session.token

    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        connection.query('SELECT * FROM users', [], (error, users) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            response.status(200).render('layout/utilisateurs', {token, actif, users})
        })
    })
}

exports.signup = (request, response) => {
    const nom = request.body.nom;
    const email = request.body.email;
    const password = request.body.password;

    // Hacher le mot de passe avant de l'enregistrer
    bcrypt.hash(password, 10, (error, hashedPassword) => {
        if (error) {
            const context = {
                erreur : error,
                statut : 500,
                url : "/pageInscription"
            }
            return response.status(500).render('layout/erreur', { context });
        }

        request.getConnection((error, connection) => {
            if (error) {
                const context = {
                    erreur : error,
                    statut : 500,
                    url : "/pageInscription"
                }
                return response.status(500).render('layout/erreur', { context });
            }

            // Vérifier si l'email est déjà pris
            connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
                if (error) {
                    const context = {
                        erreur : error,
                        statut : 500,
                        url : "/pageInscription"
                    }
                    return response.status(500).render('layout/erreur', { context });
                }

                if (results.length > 0) {
                    const context = {
                        titre : "400 | Requete invalide",
                        erreur : "Cet email est déjà utilisé.",
                        statut : 400,
                        url : "/pageInscription"
                    }
                    return response.status(400).render('layout/404', { context });
                }

                // Insérer le nouvel utilisateur dans la base de données
                const query = 'INSERT INTO users (nom, email, password) VALUES (?, ?, ?)';
                connection.query(query, [nom, email, hashedPassword], (error, results) => {
                    if (error) {
                        const context = {
                            erreur : error,
                            statut : 500,
                            url : "/pageInscription"
                        }
                        return response.status(500).render('layout/erreur', { context });
                    }

                    // Rediriger l'utilisateur vers la page de connexion après l'inscription
                    response.status(300).redirect('/pageConnexion');
                });
            });
        });
    });
};

exports.login = (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    request.getConnection((error, connection) => {
        if (error) {
            const context = {
                erreur: error,
                statut: 500,
                url: "/pageConnexion"
            };
            return response.status(500).render('layout/erreur', { context });
        }

        // Vérifier si l'utilisateur existe dans la base de données
        connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
            if (error) {
                const context = {
                    erreur: error,
                    statut: 500,
                    url: "/pageConnexion"
                };
                return response.status(500).render('layout/erreur', { context });
            }

            if (results.length === 0) {
                const context = {
                    erreur: "Utilisateur non trouvé.",
                    statut: 400,
                    url: "/pageConnexion"
                };
                return response.status(400).render('layout/404', { context });
            }

            // Récupérer l'utilisateur trouvé
            const user = results[0];

            // Comparer le mot de passe fourni avec le mot de passe haché stocké
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    const context = {
                        erreur: err,
                        statut: 500,
                        url: "/pageConnexion"
                    };
                    return response.status(500).render('layout/erreur', { context });
                }

                if (!isMatch) {
                    const context = {
                        titre : "400 | Requete invalide",
                        erreur: "Mot de passe incorrect.",
                        statut: 400,
                        url: "/pageConnexion"
                    };
                    return response.status(400).render('layout/404', { context });
                }

                // Si l'authentification réussit
                request.session.userId = user.id; 
                request.session.userName = user.name;

                // Rediriger vers la liste des taches de l'utilisateur
                response.status(300).redirect('/tache.index'); 
            });
        });
    });
};

exports.pageConnexion = (request, response) =>{
    const titre = 'Connexion'
    response.status(200).render('layout/login', {titre})
}

exports.pageInscription = (request, response) =>{
    const titre = 'Inscription'
    response.status(200).render('layout/register', {titre})
}