$(document).ready(function() {
    // Show modal if there are validation errors
    var isValid = $('#modelState').data('is-valid');
    if (isValid === false) {
        $('#createTripModal').modal('show');
    }

    // Handle modal events
    $('#createTripModal').on('shown.bs.modal', function() {
        // Initialize the form
        if (typeof initializeCreateTripForm === 'function') {
            initializeCreateTripForm();
        }
    });
}); 