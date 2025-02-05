// Gestion du modal pour le paiement de l'incinération
var modalIncineration = document.getElementById("myModal2");
var btnIncineration = document.getElementById("myBtn2");
var closeIncineration = document.getElementsByClassName("closeAdd2")[0];

btnIncineration.onclick = function () {
    modalIncineration.style.display = "block";
};

closeIncineration.onclick = function () {
    modalIncineration.style.display = "none";
};

window.onclick = function (event) {
    if (event.target == modalIncineration) {
        modalIncineration.style.display = "none";
    }
};
