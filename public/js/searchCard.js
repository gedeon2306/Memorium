function myFunction() {
    var input, filter, cards, card, name, surname, statut, i, txtValue;
    
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    cards = document.getElementsByClassName("card"); // Récupère toutes les cartes

    for (i = 0; i < cards.length; i++) {
        card = cards[i];
        name = card.querySelector(".card-name"); // Récupère le nom
        surname = card.querySelector(".card-surname"); // Récupère le prénom
        statut = card.querySelector(".card-statut"); // Récupère le statut

        // Récupère le texte des éléments (nom, prénom, statut)
        txtValue = (name?.textContent || "") + " " + (surname?.textContent || "") + " " + (statut?.textContent || "");

        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            card.style.display = ""; // Afficher la carte si correspondance
        } else {
            card.style.display = "none"; // Masquer sinon
        }
    }
}
