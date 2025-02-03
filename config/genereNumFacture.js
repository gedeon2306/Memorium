const generateNumFacture = (connection, callback) => {
    const query = "SELECT numFacture FROM paiements ORDER BY id DESC LIMIT 1";

    connection.query(query, (error, results) => {
        if (error) {
            return callback(error, null);
        }

        let newNum;
        if (results.length > 0) {
            // Extraire le numéro et l'incrémenter
            const lastNum = results[0].numFacture;
            const lastNumber = parseInt(lastNum.replace("FAC", ""), 10); // Convertir la partie numérique
            newNum = `FAC${String(lastNumber + 1).padStart(3, "0")}`; // Générer le nouveau numéro
        } else {
            // Premier enregistrement
            newNum = "FAC001";
        }

        callback(null, newNum);
    });
};

module.exports = generateNumFacture;
