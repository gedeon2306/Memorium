// Get the modal
var modal = document.getElementById("myModal");
    
// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("closeAdd")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Récupérer les éléments HTML
const photoUploadInput = document.getElementById('photo-upload');
const photoUploadLabel = document.getElementById('photo-upload-label');
const uploadText = document.getElementById('upload-text');

// Ajouter un écouteur d'événement pour détecter la sélection de fichier
photoUploadInput.addEventListener('change', function (event) {
  const file = event.target.files[0]; // Récupérer le fichier sélectionné
  if (file) {
    const reader = new FileReader();

    // Lire le fichier et afficher un aperçu
    reader.onload = function (e) {
      // Ajouter l'image comme arrière-plan du label
      photoUploadLabel.style.backgroundImage = `url(${e.target.result})`;
      photoUploadLabel.style.color = 'transparent'; // Cache le texte
      uploadText.style.display = 'none'; // Cache l'icône et le texte
    };

    // Lire le contenu du fichier
    reader.readAsDataURL(file);
  }
});