
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".print-btn").forEach(button => {
        button.addEventListener("click", function() {
            let rowId = this.getAttribute("data-id");
            let facture = this.getAttribute("data-facture");
            Swal.fire({
                title: "Êtes-vous sûr ?",
                text: "Voulez-vous imprimer la facture " + facture + " ?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Oui, imprimer",
                cancelButtonText: "Annuler"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.open(`/paiement.print/${rowId}`, '_blank')
                }
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".deleteDefunt").forEach(button => {
        button.addEventListener("click", function() {
            let rowId = this.getAttribute("data-id");
            let token = this.getAttribute("data-token");
            Swal.fire({
                title: "Êtes-vous sûr ?",
                text: "Voulez-vous supprimer ce defunt ?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Oui, supprimer",
                cancelButtonText: "Annuler"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = `/defunt.delete/${rowId}/${token}`
                }
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".incinerer").forEach(button => {
        button.addEventListener("click", function() {
            let rowId = this.getAttribute("data-id");
            let token = this.getAttribute("data-token");
            Swal.fire({
                title: "Êtes-vous sûr ?",
                text: "Voulez-vous incinerer ce defunt ?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Oui, incinerer",
                cancelButtonText: "Annuler"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = `/defunt.incinerer/${rowId}/${token}`
                }
            });
        });
    });
});