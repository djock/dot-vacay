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
                const response = await fetch(`/Trip/SearchPointsOfInterest?query=${encodeURIComponent(query)}`);

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
            option.addEventListener('click', function () {
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
    document.addEventListener('click', function (e) {
        if (!locationInput.contains(e.target) && !locationDropdown.contains(e.target)) {
            hideDropdown();
        }
    });
}); 