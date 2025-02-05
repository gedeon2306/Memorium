
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
