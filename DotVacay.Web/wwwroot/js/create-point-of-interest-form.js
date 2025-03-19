$(document).ready(function() {
    const startDateInput = document.querySelector('input[name="StartDate"]');
    const endDateInput = document.querySelector('input[name="EndDate"]');
    
    // Format date for input field
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Only set default dates if no dates are already set (empty form)
    if (!startDateInput.value || startDateInput.value === "0001-01-01T00:00") {
        console.log("Setting default dates for new POI");
        const now = new Date();
        startDateInput.value = formatDate(now);
        startDateInput.min = formatDate(now);
        
        const endDate = new Date(now);
        endDate.setHours(endDate.getHours() + 1);
        endDateInput.value = formatDate(endDate);
    }
    
    // Always set minimum end date
    if (startDateInput.value) {
        endDateInput.min = startDateInput.value;
    }
    
    // Add validation to ensure end date is after start date
    startDateInput.addEventListener('change', function() {
        endDateInput.min = this.value;
        const startDate = new Date(this.value);
        const endDate = new Date(endDateInput.value);
        
        if (endDate <= startDate) {
            const newEndDate = new Date(startDate);
            newEndDate.setHours(startDate.getHours() + 1);
            endDateInput.value = formatDate(newEndDate);
        }
    });
}); 