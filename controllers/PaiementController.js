const uuid = require('uuid')
const moment = require('moment')
const generateNumFacture = require('../config/genereNumFacture')
const PDFDocument = require('pdfkit')
const fs = require('fs')

exports.index = (request, response) => {

    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'paiement' : true,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'notes' : false,
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

        connection.query('SELECT p.*, f.nomFamille, d.nom, u.nomComplet FROM paiements p, familles f, defunts d, users u WHERE p.famille_id = f.id AND p.defunt_id = d.id AND p.user_id = u.id ORDER BY p.id DESC ', [], (error, paiements) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            connection.query('SELECT id, nomFamille, nomGarrant, prenomGarrant FROM familles', [], (error, familles) => {
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }
    
                connection.query('SELECT id, nom, prenom FROM defunts', [], (error, defunts) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error })
                    }
        
                    response.status(200).render('layout/paiement', {
                        token, 
                        actif, 
                        paiements, 
                        moment, 
                        familles, 
                        defunts
                    })
                })
            })
        })
    })
}

exports.storeInh = (request, response) =>{

    const token = request.body.token ? request.body.token : undefined
    const montant = request.body.montant
    const dateIncinerationPrevue = request.body.dateIncinerationPrevue
    const moyenPaiement = request.body.moyenPaiement
    const familleId = request.body.familleId
    const defuntId = request.body.defuntId

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { erreur })
        }

        if (!token || token !== request.session.token) {
            request.flash('error', 'Token invalide')
            return response.status(400).redirect('/paiement.index')
        }

        if (!montant || !dateIncinerationPrevue || !moyenPaiement || !familleId || !defuntId) {
            request.flash('error', 'Tous les champs sont obligatoires')
            return response.status(400).redirect('/paiement.index')
        }

        generateNumFacture(connection, (error, numFacture) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            // Insérer le paiement
            const paiementQuery = `INSERT INTO paiements (numFacture, motif, montant, dateIncinerationPrevue, moyenPaiement, famille_id, defunt_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            const motif = 'Prolanger Inhumation'
            connection.query(paiementQuery, [numFacture, motif, montant, dateIncinerationPrevue, moyenPaiement, familleId, defuntId, request.session.userId], (error, paiementResults) => {
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }

                const paiementId = paiementResults.insertId
                connection.query('UPDATE defunts SET dateIncineration = ? WHERE id = ?', [dateIncinerationPrevue, defuntId], (error, defuntUpdate) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error })
                    }
    
                    request.flash('success', 'Paiement effectué avec succès')
                    return response.status(200).redirect(`/paiement.show/${paiementId}`)
                })
            })
        })
    })
}

exports.storeInc = (request, response) =>{

    const token2 = request.body.token2 ? request.body.token2 : undefined
    const montant2 = request.body.montant2
    const moyenPaiement2 = request.body.moyenPaiement2
    const familleId2 = request.body.familleId2
    const defuntId2 = request.body.defuntId2

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { erreur })
        }

        if (!token2 || token2 !== request.session.token) {
            request.flash('error', 'Token invalide')
            return response.status(400).redirect('/paiement.index')
        }

        if (!montant2 || !moyenPaiement2 || !familleId2 || !defuntId2) {
            request.flash('error', 'Tous les champs sont obligatoires')
            return response.status(400).redirect('/paiement.index')
        }

        connection.query('SELECT dateIncineration FROM defunts WHERE id = ?', [defuntId2], (error, result) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            if (result.length === 0) {
                request.flash('error', 'Défunt Introuvable')
                return response.status(500).redirect('/paiement.index')
            }


            generateNumFacture(connection, (error, numFacture) => {
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }

                // Insérer le paiement
                const paiementQuery = `INSERT INTO paiements (numFacture, motif, montant, dateIncinerationPrevue, moyenPaiement, famille_id, defunt_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                const motif = 'Incineration'
                connection.query(paiementQuery, [numFacture, motif, montant2, result[0].dateIncineration, moyenPaiement2, familleId2, defuntId2, request.session.userId], (error, paiementResults) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error })
                    }

                    const paiementId = paiementResults.insertId
                    connection.query('UPDATE defunts SET statut = ? WHERE id = ?', ['Inhumation Prevue', defuntId2], (error, defuntUpdate) => {
                        if (error) {
                            return response.status(500).render('layout/500', { error })
                        }
        
                        request.flash('success', 'Paiement effectué avec succès')
                        return response.status(200).redirect(`/paiement.show/${paiementId}`)
                    })
                })
            })
        })
    })
}

exports.updateInh = (request, response) =>{

    const id = request.body.id ? request.body.id : undefined
    const token = request.body.token ? request.body.token : undefined
    const montant = request.body.montant
    const dateIncinerationPrevue = request.body.dateIncinerationPrevue
    const moyenPaiement = request.body.moyenPaiement
    const familleId = request.body.familleId
    const defuntId = request.body.defuntId

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { erreur })
        }

        if (!token || token !== request.session.token) {
            request.flash('error', 'Token invalide')
            return response.status(400).redirect('/paiement.index')
        }

        if (!montant || !dateIncinerationPrevue || !moyenPaiement || !familleId || !defuntId) {
            request.flash('error', 'Tous les champs sont obligatoires')
            return response.status(400).redirect('/paiement.index')
        }

        connection.query('SELECT * FROM paiements WHERE id = ?', [id], (error, results) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            if (results.length < 0) {
                request.flash('error', 'Facture introuvable')
                return response.status(400).redirect('/paiement.index')
            }

            const paiementQuery = `UPDATE paiements SET montant = ?, dateIncinerationPrevue = ?, moyenPaiement = ?, famille_id = ?, defunt_id = ?, user_id = ? WHERE id = ?`
        
            connection.query(paiementQuery, [montant, dateIncinerationPrevue, moyenPaiement, familleId, defuntId, request.session.userId, id], (error, paiementResults) => {
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }

                connection.query('UPDATE defunts SET dateIncineration = ? WHERE id = ?', [dateIncinerationPrevue, defuntId], (error, defuntUpdate) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error })
                    }

                    request.flash('success', 'Facture modifiée avec succès')
                    return response.status(200).redirect('/paiement.index')
                })
            })
        })
    })
}

exports.updateInc = (request, response) =>{

    const id2 = request.body.id2 ? request.body.id2 : undefined
    const token2 = request.body.token2 ? request.body.token2 : undefined
    const montant2 = request.body.montant2
    const moyenPaiement2 = request.body.moyenPaiement2
    const familleId2 = request.body.familleId2
    const defuntId2 = request.body.defuntId2

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { erreur })
        }

        if (!token2 || token2 !== request.session.token) {
            request.flash('error', 'Token invalide')
            return response.status(400).redirect('/paiement.index')
        }

        if (!montant2 || !moyenPaiement2 || !familleId2 || !defuntId2) {
            request.flash('error', 'Tous les champs sont obligatoires')
            return response.status(400).redirect('/paiement.index')
        }

        connection.query('SELECT dateIncineration FROM defunts WHERE id = ?', [defuntId2], (error, result) => {
            if (error) {
                return response.status(500).render('layout/500', { error })
            }

            if (result.length === 0) {
                request.flash('error', 'Défunt Introuvable')
                return response.status(500).redirect('/paiement.index')
            }

            connection.query('SELECT * FROM paiements WHERE id = ?', [id2], (error, results) => {
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }

                if (results.length < 0) {
                    request.flash('error', 'Facture introuvable')
                    return response.status(400).redirect('/paiement.index')
                }

                const paiementQuery = `UPDATE paiements SET montant = ?, dateIncinerationPrevue = ?, moyenPaiement = ?, famille_id = ?, defunt_id = ?, user_id = ? WHERE id = ?`
            
                connection.query(paiementQuery, [montant2, result[0].dateIncineration, moyenPaiement2, familleId2, defuntId2, request.session.userId, id2], (error, paiementResults) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error })
                    }

                    request.flash('success', 'Facture modifiée avec succès')
                    return response.status(200).redirect('/paiement.index')
                })
            })
        })
    })
}

exports.delete = (request, response) =>{
    
    const id = request.params.id ? request.params.id : undefined
    const token = request.params.token ? request.params.token : undefined

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        if (token!=request.session.token || token === undefined || token === '' ) {
            request.flash('error', "Token invalide")
            return response.status(400).redirect('/paiement.index')
        }

        connection.query('SELECT * FROM paiements WHERE id = ?', [id], (error, resultat)=>{
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
            
            if(resultat.length === 0){
                request.flash('error', "Paiement non trouvé")
                return response.status(400).redirect('/paiement.index')
            }

            connection.query('DELETE FROM paiements WHERE id = ?', [id], (error)=>{
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }
                request.flash('success', "Paiement supprimé")
                return response.status(300).redirect('/paiement.index')
            })
        })
    })
}

exports.print = (request, response) => {
    const id = request.params.id ? request.params.id : undefined;

    request.getConnection((error, connection) => {
        if (error) {
            return response.status(500).render('layout/500', { error });
        }

        connection.query(
            'SELECT p.*, f.*, d.nom, d.prenom, u.nomComplet FROM paiements p, familles f, defunts d, users u WHERE p.famille_id = f.id AND p.defunt_id = d.id AND p.user_id = u.id AND p.id = ?', 
            [id], 
            (error, facture) => {
                if (error) {
                    return response.status(500).render('layout/500', { error });
                }

                if (facture.length === 0) {
                    request.flash('error', "Facture non trouvée");
                    return response.status(400).redirect('/paiement.index');
                }

                const row = facture[0];
                const doc = new PDFDocument({ margin: 50 });

                response.setHeader('Content-Type', 'application/pdf');
                response.setHeader('Content-Disposition', 'inline; filename="facture.pdf"');

                doc.pipe(response);

                // Ajouter le logo
                const imagePath = 'public/images/logo/memoriumLogo.png';
                if (fs.existsSync(imagePath)) {
                    doc.image(imagePath, 50, 30, { width: 80 });
                }

                // Titre de la facture
                doc.fontSize(20)
                    .fillColor("#007bff")
                    .text('Memorium - Reçu de Paiement', 0, 70, { align: 'center' });

                doc.moveDown(2);

                // Fonction pour dessiner des tableaux stylisés
                function drawTable(doc, startX, startY, headers, rows) {
                    const columnWidths = [150, 350];
                    const rowHeight = 25;
                    let y = startY;

                    doc.font('Helvetica-Bold').fontSize(12).fillColor('#007bff');

                    headers.forEach((header, i) => {
                        doc.text(header, startX + (i === 0 ? 0 : columnWidths[0] + 10), y, {
                            width: columnWidths[i], 
                            align: 'left'
                        });
                    });

                    y += rowHeight;
                    doc.moveTo(startX, y).lineTo(startX + columnWidths[0] + columnWidths[1] + 10, y).stroke();

                    doc.font('Helvetica').fontSize(10).fillColor('#333');

                    rows.forEach((row) => {
                        y += rowHeight;
                        row.forEach((cell, i) => {
                            doc.text(cell, startX + (i === 0 ? 0 : columnWidths[0] + 10), y, {
                                width: columnWidths[i], 
                                align: 'left'
                            });
                        });

                        doc.moveTo(startX, y + 20).lineTo(startX + columnWidths[0] + columnWidths[1] + 10, y + 20).stroke();
                    });
                }

                // Tableaux avec bordures fines
                drawTable(doc, 50, doc.y, ['Famille', 'Informations'], [
                    ['Famille', row.nomFamille],
                    ['Nom Garrant', row.nomGarrant],
                    ['Prénom Garrant', row.prenomGarrant],
                    ['Téléphone', row.telephone]
                ]);

                doc.moveDown(2);

                drawTable(doc, 50, doc.y, ['Défunt', 'Informations'], [
                    ['Nom', row.nom],
                    ['Prénom', row.prenom],
                    ['Date Incinération Prévue', moment(row.dateIncinerationPrevue).format('DD/MM/YYYY')]
                ]);

                doc.moveDown(2);

                drawTable(doc, 50, doc.y, ['Facture', 'Détails'], [
                    ['N° Facture', row.numFacture],
                    ['Montant', `${row.montant} FCFA`],
                    ['Date Paiement', moment(row.datePaiement).format('DD/MM/YYYY HH:mm')],
                    ['Moyen de Paiement', row.moyenPaiement]
                ]);

                doc.moveDown(2);

                drawTable(doc, 50, doc.y, ['Memorium', 'Détails'], [
                    ['Imprimé par', 'Admin (Session)'],
                    ['Fait par', row.nomComplet],
                    ['Date', new Date().toLocaleString()]
                ]);

                doc.end();
            }
        );
    });
};

exports.show = (request, response) =>{

    const actif = {
        'accueil' : false,
        'liste' : false,
        'ajouter' : false,
        'paiement' : true,
        'utilisateurs' : false,
        'statistique' : false,
        'messages' : false,
        'carte' : false,
        'notes' : false,
        'historique' : false,
        'famille' : false,
        'nomUser' : request.session.nom,
        'photoUser' : request.session.photo
    }

    const id = request.params.id ? request.params.id : undefined

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        connection.query('SELECT p.*, f.nomFamille, f.nomGarrant, f.prenomGarrant, f.telephone, d.nom, d.prenom, u.nomComplet FROM paiements p, familles f, defunts d, users u WHERE p.famille_id = f.id AND p.defunt_id = d.id AND p.user_id = u.id AND p.id = ?', [id], (error, facture)=>{
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
            
            if(facture.length === 0){
                request.flash('error', "Facture non trouvée")
                return response.status(400).redirect('/paiement.index')
            }

            return response.status(200).render('layout/detailFacture', {facture : facture[0], actif, moment})

        })
    })
}