const bcrypt = require('bcrypt');  // Utilisation de bcrypt pour sécuriser les mots de passe
const uuid = require('uuid')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Chemin vers le dossier public/uploads
const uploadPath = path.join('./public/images/imagesUsers');

// Vérifier et créer le dossier public/uploads s'il n'existe pas
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuration de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath); // Dossier où les images seront enregistrées
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('image'); // Champ 'image' dans le formulaire

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

exports.store = (request, response) => {
    upload(request, response, (error) => {
        if (error) {
            return response.status(500).render('layout/500', { error });
        }

        const nomComplet = request.body.nomComplet;
        const userName = request.body.userName;
        const passWord = request.body.passWord;
        const role = request.body.role;
        const imagePath = request.file ? request.file.path.replace(/\\/g, '/').replace('public/images/imagesUsers/', '') : null;

        bcrypt.hash(passWord, 10, (error, hashedPassword) => {
            if (error) {
                return response.status(500).render('layout/500', { error });
            }

            request.getConnection((error, connection) => {
                if (error) {
                    return response.status(500).render('layout/500', { error });
                }

                connection.query('SELECT * FROM users WHERE userName = ?', [userName], (error, results) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error });
                    }

                    if (results.length > 0) {
                        request.flash('error', 'Nom d\'utilisateur invalide Réesayez');
                        return response.status(400).redirect('/user.index');
                    }

                    const query = 'INSERT INTO users (nomComplet, userName, passWord, role, photo) VALUES (?, ?, ?, ?, ?)';
                    connection.query(query, [nomComplet, userName, hashedPassword, role, imagePath], (error, results) => {
                        if (error) {
                            return response.status(500).render('layout/500', { error });
                        }

                        request.flash('success', 'Utilisateur enregistré');
                        return response.status(400).redirect('/user.index');
                    });
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
            const error = {
                erreur: error,
                statut: 500,
                url: "/pageConnexion"
            };
            return response.status(500).render('layout/500', { error });
        }

        // Vérifier si l'utilisateur existe dans la base de données
        connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
            if (error) {
                const error = {
                    erreur: error,
                    statut: 500,
                    url: "/pageConnexion"
                };
                return response.status(500).render('layout/500', { error });
            }

            if (results.length === 0) {
                const error = {
                    erreur: "Utilisateur non trouvé.",
                    statut: 400,
                    url: "/pageConnexion"
                };
                return response.status(400).render('layout/404', { error });
            }

            // Récupérer l'utilisateur trouvé
            const user = results[0];

            // Comparer le mot de passe fourni avec le mot de passe haché stocké
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    const error = {
                        erreur: err,
                        statut: 500,
                        url: "/pageConnexion"
                    };
                    return response.status(500).render('layout/500', { error });
                }

                if (!isMatch) {
                    const error = {
                        titre : "400 | Requete invalide",
                        erreur: "Mot de passe incorrect.",
                        statut: 400,
                        url: "/pageConnexion"
                    };
                    return response.status(400).render('layout/404', { error });
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