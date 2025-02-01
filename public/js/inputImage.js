// Fonction pour gérer l'upload et l'aperçu d'image
function handleImageUpload(inputSelector, labelSelector, textSelector) {
  const photoUploadInput = document.querySelector(inputSelector);
  const photoUploadLabel = document.querySelector(labelSelector);
  const uploadText = document.querySelector(textSelector);

  photoUploadInput.addEventListener('change', function (event) {
    const file = event.target.files[0]; // Récupérer le fichier sélectionné
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        photoUploadLabel.style.backgroundImage = `url(${e.target.result})`;
        photoUploadLabel.style.color = 'transparent'; // Cache le texte
        uploadText.style.display = 'none'; // Cache l'icône et le texte
      };

      reader.readAsDataURL(file);
    }
  });
}

// Initialisation pour les deux champs de téléchargement
handleImageUpload('#photo-upload', '#photo-upload-label', '#upload-text');
handleImageUpload('#photo-upload-update', '#photo-upload-label-update', '#upload-text-update');
