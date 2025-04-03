// Function to initialize the form
function initializeCreateTripForm() {
    const startDateInput = document.querySelector('input[name="StartDate"]');
    const endDateInput = document.querySelector('input[name="EndDate"]');
    const locationInput = document.getElementById("locationInput");

    locationInput.addEventListener('input', (e) => {
        if (e.target.value.length > 3) {
            console.log('Input value is greater than 3 characters:', e.target.value);
        }
    });


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

    // Add validation to ensure end date is after start date
    startDateInput.addEventListener('change', function() {
        // Update end date minimum to be the selected start date
        endDateInput.min = this.value;
        
        const startDate = new Date(this.value);
        const endDate = new Date(endDateInput.value);
        
        if (endDate <= startDate) {
            // Set end date to start date + 3 days
            const newEndDate = new Date(startDate);
            newEndDate.setDate(newEndDate.getDate() + 3);
            endDateInput.value = formatDate(newEndDate);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const locationInput = document.getElementById('locationInput');
    const locationDropdown = document.getElementById('locationDropdown');
    let debounceTimer;

    locationInput.addEventListener('input', async function (e) {
        clearTimeout(debounceTimer);
        const query = e.target.value;

        if (query.length < 2) {
            hideDropdown();
            return;
        }

        // Show loading state
        showDropdown('<div class="p-2">Loading...</div>');

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/App/SearchLocations?query=${encodeURIComponent(query)}`);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                
                if (data.length === 0) {
                    showDropdown('<div class="p-2">No locations found</div>');
                    return;
                }

                const locationOptions = data.map(location => `
                    <div class="location-option" data-location='${JSON.stringify(location)}'>
                        <div class="location-name">${location.display_name.split(',')[0]}</div>
                        <div class="location-details text-muted small">${location.display_name.split(',').slice(1, 3).join(',')}</div>
                    </div>
                `).join('');

                showDropdown(locationOptions);
                setupLocationClickHandlers();

            } catch (error) {
                console.error('Error fetching locations:', error);
                showDropdown('<div class="p-2 text-danger">Error loading locations</div>');
            }
        }, 300);
    });

    function showDropdown(content) {
        locationDropdown.innerHTML = content;
        locationDropdown.style.display = 'block';
    }

    function hideDropdown() {
        locationDropdown.style.display = 'none';
    }

    function setupLocationClickHandlers() {
        const options = locationDropdown.querySelectorAll('.location-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                const location = JSON.parse(this.dataset.location);
                locationInput.value = location.display_name.split(',')[0];
                
                // Add hidden inputs for coordinates if they don't exist
                updateOrCreateHiddenInput('Latitude', location.lat);
                updateOrCreateHiddenInput('Longitude', location.lon);
                
                hideDropdown();
            });
        });
    }

    function updateOrCreateHiddenInput(name, value) {
        let input = document.querySelector(`input[name="${name}"]`);
        if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            document.querySelector('form').appendChild(input);
        }
        input.value = value;
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!locationInput.contains(e.target) && !locationDropdown.contains(e.target)) {
            hideDropdown();
        }
    });
}); 