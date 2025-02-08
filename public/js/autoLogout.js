let inactivityTime = 10 * 60 * 1000; // 10 minutes
let timeout;

function resetTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        fetch('/logout') // Déconnexion automatique
            .then(() => window.location.href = '/');
    }, inactivityTime);
}

// Détecter les activités de l'utilisateur
document.addEventListener("mousemove", resetTimer);
document.addEventListener("keypress", resetTimer);
document.addEventListener("click", resetTimer);
document.addEventListener("scroll", resetTimer);

resetTimer(); // Lancer le timer au chargement de la page
