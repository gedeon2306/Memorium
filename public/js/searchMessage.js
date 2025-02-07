function filterMessages() {
  var input, filter, container, messages, messageDiv, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  container = document.getElementById("messagesContainer");
  messages = container.getElementsByClassName("w3-row");

  // Parcourt tous les messages
  for (i = 0; i < messages.length; i++) {
      messageDiv = messages[i].getElementsByClassName("w3-container")[0];
      if (messageDiv) {
          txtValue = messageDiv.textContent || messageDiv.innerText;
          // Vérifie si le texte contient le filtre
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
              messages[i].style.display = "";
          } else {
              messages[i].style.display = "none";
          }
      }
  }
}
