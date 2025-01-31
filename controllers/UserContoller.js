const bcrypt = require('bcrypt')  // Utilisation de bcrypt pour sécuriser les mots de passe
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
        cb(null, uploadPath) // Dossier où les images seront enregistrées
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('image') // Champ 'image' dans le formulaire

exports.index = (request, response)=>{
    if (!request.session.userId) {
        return response.redirect('/connexion')
    }

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
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
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

        const token = request.body.token;
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

                if (!token || token !== request.session.token) {
                    request.flash('error', 'Token invalide');
                    return response.status(400).redirect('/user.index');
                }
        
                if (!nomComplet || !userName || !passWord || !role) {
                    request.flash('error', 'Tous les champs sont obligatoires');
                    return response.status(400).redirect('/user.index');
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

exports.update = (request, response) => {
    if (!request.session.userId) {
        return response.redirect('/connexion')
    }

    upload(request, response, (error) => {
        if (error) {
            return response.status(500).render('layout/500', { error });
        }

        const nomComplet = request.body.nomComplet;
        const userName = request.body.userName;
        const passWord = request.body.passWord;
        const role = request.body.role;
        const userId = request.body.id;
        const imagePath = request.file ? request.file.path.replace(/\\/g, '/').replace('public/images/imagesUsers/', '') : null;

        // Vérifier l'unicité du `username`
        request.getConnection((error, connection) => {
            if (error) {
                return response.status(500).render('layout/500', { error });
            }

            if (error) {
                return response.status(500).render('layout/500', { error });
            }

            if (!token || token !== request.session.token) {
                request.flash('error', 'Token invalide');
                return response.status(400).redirect('/user.index');
            }

            connection.query('SELECT * FROM users WHERE userName = ? AND id != ?', [userName, userId], (error, results) => {
                if (error) {
                    return response.status(500).render('layout/500', { error });
                }

                if (results.length > 0) {
                    request.flash('error', 'Nom d\'utilisateur déjà utilisé. Veuillez en choisir un autre.');
                    return response.status(400).redirect('/user.edit/' + userId);
                }

                // Si le nom d'utilisateur est unique, continuer la mise à jour
                function prepareUpdate() {
                    let updateQuery = 'UPDATE users SET nomComplet = ?, userName = ?, role = ?';
                    let params = [nomComplet, userName, role];
                    
                    // Si un mot de passe est fourni, hashez-le
                    if (passWord) {
                        bcrypt.hash(passWord, 10, (error, hashedPassword) => {
                            if (error) {
                                return response.status(500).render('layout/500', { error });
                            }
                            updateQuery += ', passWord = ?';
                            params.push(hashedPassword);
                            executeUpdate(updateQuery, params);
                        });
                    } else {
                        executeUpdate(updateQuery, params);
                    }
                }

                function executeUpdate(query, params) {
                    // Vérifiez si une nouvelle image est uploadée
                    if (imagePath) {
                        query += ', photo = ?';
                        params.push(imagePath);
                        
                        // Suppression de l'ancienne image si elle existe
                        connection.query('SELECT photo FROM users WHERE userId = ?', [userId], (error, results) => {
                            if (error) {
                                return response.status(500).render('layout/500', { error });
                            }
                            if (results[0].photo) {
                                const oldImagePath = `public/images/imagesUsers/${results[0].photo}`;
                                fs.unlink(oldImagePath, (err) => {
                                    if (err) console.error("Erreur lors de la suppression de l'image:", err);
                                });
                            }
                            
                            finalUpdate(query, params);
                        });
                    } else {
                        finalUpdate(query, params);
                    }
                }

                function finalUpdate(query, params) {
                    query += ' WHERE id = ?';
                    params.push(userId);
                    
                    connection.query(query, params, (error) => {
                        if (error) {
                            return response.status(500).render('layout/500', { error });
                        }
                        request.flash('success', 'Utilisateur mis à jour');
                        return response.status(200).redirect('/user.index');
                    });
                }

                prepareUpdate();
            });
        });
    });
};

exports.login = (request, response) => {
    const userName = request.body.userName;
    const passWord = request.body.passWord;

    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error });
        }

        // Vérifier si l'utilisateur existe dans la base de données
        connection.query('SELECT * FROM users WHERE userName = ?', [userName], (error, results) => {
            if (error) {
                return response.status(500).render('layout/500', { error });
            }

            if (results.length === 0) {
                const error = "Utilisateur non trouvé."
                return response.status(400).render('layout/500', { error });
            }

            // Récupérer l'utilisateur trouvé
            const user = results[0];

            // Comparer le mot de passe fourni avec le mot de passe haché stocké
            bcrypt.compare(passWord, user.passWord, (err, isMatch) => {
                if (error) {
                    return response.status(500).render('layout/500', { error });
                }

                if (!isMatch) {
                    const error = "Mot de passe incorrect."
                    return response.status(400).render('layout/500', { error });
                }

                // Si l'authentification réussit
                request.session.userId = user.id 
                request.session.nom = user.nomComplet;
                request.session.photo = user.photo;

                // Rediriger vers la liste des taches de l'utilisateur
                response.status(300).redirect('/') 
            });
        });
    });
};

exports.delete = (request, response) =>{
    // if (!request.session.userId) {
    //     return response.redirect('/pageConnexion') // Si l'utilisateur n'est pas connecté, le rediriger
    // }
    
    const id = request.params.id
    const token = request.params.token ? request.params.token : undefined

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        if (token!=request.session.token || token === undefined || token === '' ) {
            request.flash('error', "token invalide")
            return response.status(400).redirect('/user.index')
        }

        connection.query('SELECT * FROM users WHERE id = ?', [id], (error, resultat)=>{
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
            
            if(resultat.length === 0){
                request.flash('error', "Utilisateur non trouvé")
                return response.status(400).redirect('/famille.index')
            }

            connection.query('DELETE FROM users WHERE id = ?', [id], (error)=>{
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }
                request.flash('success', "Utilisateur supprimé")
                return response.status(300).redirect('/user.index')
            })
        })
    })
}