console.log("Create trip form script loaded");

// Function to initialize the form
function initializeCreateTripForm() {
    const startDateInput = document.querySelector('input[name="StartDate"]');
    const endDateInput = document.querySelector('input[name="EndDate"]');

    if (!startDateInput || !endDateInput) {
        console.error("Could not find date inputs");
        return;
    }

    // Format current date for date input
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Set default dates
    const now = new Date();
    startDateInput.value = formatDate(now);
    startDateInput.min = formatDate(now); // Prevent selecting past dates
    
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate());
    endDateInput.value = formatDate(endDate);
    endDateInput.min = startDateInput.value; // Initially set end date minimum to start date

    console.log("Dates initialized:", {
        startDate: startDateInput.value,
        endDate: endDateInput.value
    });

    // Add validation to ensure end date is after start date
    startDateInput.addEventListener('change', function() {
        console.log("Start date changed:", this.value);
        // Update end date minimum to be the selected start date
        endDateInput.min = this.value;
        
        const startDate = new Date(this.value);
        const endDate = new Date(endDateInput.value);
        
        if (endDate <= startDate) {
            // Set end date to start date + 3 days
            const newEndDate = new Date(startDate);
            newEndDate.setDate(newEndDate.getDate() + 3);
            endDateInput.value = formatDate(newEndDate);
            console.log("End date adjusted:", endDateInput.value);
        }
    });
}

// Initialize when the modal is shown
document.addEventListener('DOMContentLoaded', function() {
    const createTripModal = document.getElementById('createTripModal');
    
    if (createTripModal) {
        createTripModal.addEventListener('shown.bs.modal', function() {
            initializeCreateTripForm();
        });
    } else {
        console.error("Could not find createTripModal element");
    }
}); 