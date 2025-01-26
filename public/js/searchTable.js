function myFunction() {
    // Déclare les variables
    var input, filter, table, tr, td, i, j, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
  
    // Parcourt toutes les lignes du tableau (sauf l'en-tête)
    for (i = 1; i < tr.length; i++) {
      tr[i].style.display = "none"; // Masque la ligne par défaut
      td = tr[i].getElementsByTagName("td");
      // Parcourt toutes les colonnes de la ligne
      for (j = 0; j < td.length; j++) {
        if (td[j]) {
          txtValue = td[j].textContent || td[j].innerText;
          // Si une colonne correspond au filtre, affiche la ligne
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
            break; // Arrête la vérification pour cette ligne
          }
        }
      }
    }
  }