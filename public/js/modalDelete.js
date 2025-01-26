// Récupérer tous les boutons "Modifier"
var modalBtns = document.querySelectorAll(".openModalDeleteBtn");

// Pour chaque bouton, associer l'ouverture du modal correspondant
modalBtns.forEach(function(btn) {
  btn.onclick = function() {
    // Récupérer l'id du modal à partir de l'attribut 'data-modal'
    var modalId = btn.getAttribute("data-modal");
    var modal = document.getElementById(modalId);
    
    // Afficher le modal spécifique
    modal.style.display = "block";
  };
});

// Gérer la fermeture des modals lorsque l'on clique sur le <span> (x)
var spans = document.querySelectorAll(".close");
spans.forEach(function(span) {
  span.onclick = function() {
    var modal = document.getElementById(span.getAttribute("data-modal"));
    modal.style.display = "none";
  };
});

var btnClose = document.querySelectorAll(".closeBtn");
btnClose.forEach(function(button) {
  button.onclick = function() {
    var modal = document.getElementById(button.getAttribute("data-modal"));
    modal.style.display = "none";
  };
});

// Lorsque l'utilisateur clique en dehors du modal, le fermer
window.onclick = function(event) {
  document.querySelectorAll('.modal').forEach(function(modal) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });
}
