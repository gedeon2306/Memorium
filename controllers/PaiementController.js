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

exports.store = (request, response) =>{

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
            const paiementQuery = `INSERT INTO paiements (numFacture, montant, dateIncinerationPrevue, moyenPaiement, famille_id, defunt_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`
            
            connection.query(paiementQuery, [numFacture, montant, dateIncinerationPrevue, moyenPaiement, familleId, defuntId, request.session.userId], (error, paiementResults) => {
                if (error) {
                    return response.status(500).render('layout/500', { error })
                }

                connection.query('UPDATE defunts SET dateIncineration = ? WHERE id = ?', [dateIncinerationPrevue, defuntId], (error, defuntUpdate) => {
                    if (error) {
                        return response.status(500).render('layout/500', { error })
                    }
    
                    request.flash('success', 'Paiement effectué avec succès')
                    return response.status(200).redirect('/paiement.index')
                })
            })
        })
    })
}

exports.update = (request, response) =>{

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

exports.print = (request, response) =>{
    
    const id = request.params.id ? request.params.id : undefined

    request.getConnection((error, connection)=>{
        if (error) {
            return response.status(500).render('layout/500', { error })
        }

        connection.query('SELECT p.*, f.*, d.nom, d.prenom, u.nomComplet FROM paiements p, familles f, defunts d, users u WHERE p.famille_id = f.id AND p.defunt_id = d.id AND p.user_id = u.id AND p.id = ?', [id], (error, facture)=>{
            if (error) {
                return response.status(500).render('layout/500', { error })
            }
            
            if(facture.length === 0){
                request.flash('error', "Facture non trouvée")
                return response.status(400).redirect('/paiement.index')
            }

            const row = facture[0]

            // Créer un PDF en mémoire
            const doc = new PDFDocument()
            response.setHeader('Content-Type', 'application/pdf')
            response.setHeader('Content-Disposition', 'inline filename="document.pdf"')

            doc.pipe(response)

            const imagePath = 'public/images/logo/memoriumLogo.png';
            if (fs.existsSync(imagePath)) {
                doc.image(imagePath, 50, 50, { width: 80 });
            }

            doc.fontSize(20)
            .text('Memorium Reçu', 150, 70, { align: 'center' });

            doc.moveDown(2);

            function drawTable(doc, startX, startY, headers, rows) {
                const columnWidths = [150, 350];
                const rowHeight = 25;
                let y = startY;

                doc.font('Helvetica-Bold').fontSize(12);
                headers.forEach((header, i) => {
                    doc.text(header, startX + (i === 0 ? 0 : columnWidths[0] + 10), y, { width: columnWidths[i], align: 'left' });
                });

                y += rowHeight;
                doc.moveTo(startX, y).lineTo(startX + columnWidths[0] + columnWidths[1] + 10, y).stroke();

                doc.font('Helvetica').fontSize(10);
                rows.forEach((row, rowIndex) => {
                    y += rowHeight;
                    row.forEach((cell, i) => {
                        doc.text(cell, startX + (i === 0 ? 0 : columnWidths[0] + 10), y, { width: columnWidths[i], align: 'left' });
                    });

                    doc.moveTo(startX, y + 20).lineTo(startX + columnWidths[0] + columnWidths[1] + 10, y + 20).stroke();
                });
            }

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

        })
    })
}

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

        connection.query('SELECT p.*, f.*, d.nom, d.prenom, u.nomComplet FROM paiements p, familles f, defunts d, users u WHERE p.famille_id = f.id AND p.defunt_id = d.id AND p.user_id = u.id AND p.id = ?', [id], (error, facture)=>{
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