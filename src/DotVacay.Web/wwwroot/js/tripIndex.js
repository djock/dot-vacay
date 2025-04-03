$(document).ready(function() {
    // Handle add modal events - use Bootstrap's event handling
    $('#addPoiModal').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const form = $(this).find('form');
        
        // Reset form
        form[0].reset();
        form.find('input[name="Id"]').remove();
        
        // Get the selected date from the button's data attribute
        const selectedDate = button.data('date');
        
        if (selectedDate) {
            // Set default start and end times for new POI
            const startDateTime = `${selectedDate}T09:00`;
            const endDateTime = `${selectedDate}T10:00`;
            
            form.find('input[name="StartDate"]').val(startDateTime);
            form.find('input[name="EndDate"]').val(endDateTime);
        }
    });

    // Handle edit modal events
    $('#editPoiModal').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const form = $(this).find('form');
        
        // Fill in form fields from data attributes
        form.find('input[name="Title"]').val(button.data('poi-title'));
        form.find('textarea[name="Description"]').val(button.data('poi-description'));
        form.find('select[name="Type"]').val(button.data('poi-type'));
        
        // Handle dates
        const startDate = button.data('poi-start-date');
        const endDate = button.data('poi-end-date');
        
        if (startDate) {
            form.find('input[name="StartDate"]').val(startDate);
        }
        
        if (endDate) {
            form.find('input[name="EndDate"]').val(endDate);
        }
        
        // Remove any existing ID field to prevent duplicates
        form.find('input[name="Id"]').remove();
        
        // Add POI ID to form
        form.append(`<input type="hidden" name="Id" value="${button.data('poi-id')}" />`);
    });
}); 