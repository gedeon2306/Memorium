const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Chemin vers le dossier public/images/imagesDefunts
const uploadPath = path.join(__dirname, '../public/images/imagesDefunts')

// Vérifier et créer le dossier public/images/imagesDefunts s'il n'existe pas
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
}

// Configuration de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath) // Dossier où les images seront enregistrées
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

// Exporter l'instance de Multer
const upload = multer({ storage: storage })

module.exports = upload
