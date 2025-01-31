// Get the modal
var modalLogout = document.getElementById('modalLogout');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modalLogout) {
    modal.style.display = "none";
  }
}

// Gérer la fermeture des modals lorsque l'on clique sur le <span> (x)
var spans = document.querySelectorAll(".closeLogout");
spans.forEach(function(span) {
  span.onclick = function() {
    var modalLogout = document.getElementById(span.getAttribute("data-modal"));
    modalLogout.style.display = "none";
  };
});

var btnClose = document.querySelectorAll(".closeBtn");
btnClose.forEach(function(button) {
  button.onclick = function() {
    var modal = document.getElementById(button.getAttribute("data-modal"));
    modal.style.display = "none";
  };
});