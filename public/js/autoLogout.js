let inactivityTime = 15 * 60 * 1000; // 15 minutes
let timeout;

function resetTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        fetch('/user/logout') // Déconnexion automatique
            .then(() => window.location.href = '/login');
    }, inactivityTime);
}

// Détecter les activités de l'utilisateur
document.addEventListener("mousemove", resetTimer);
document.addEventListener("keypress", resetTimer);
document.addEventListener("click", resetTimer);
document.addEventListener("scroll", resetTimer);

resetTimer(); // Lancer le timer au chargement de la page
