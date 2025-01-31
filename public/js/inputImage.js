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