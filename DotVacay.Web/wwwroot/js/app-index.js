$(document).ready(function() {
    console.log("App Index page loaded");
    
    // Show modal if there are validation errors
    var isValid = $('#modelState').data('is-valid');
    if (isValid === false) {
        $('#createTripModal').modal('show');
    }

    // Handle modal events
    $('#createTripModal').on('show.bs.modal', function() {
        console.log("Modal is about to show");
    }).on('shown.bs.modal', function() {
        console.log("Modal has been shown");
        // Initialize the form
        if (typeof initializeCreateTripForm === 'function') {
            initializeCreateTripForm();
        }
    });
}); 