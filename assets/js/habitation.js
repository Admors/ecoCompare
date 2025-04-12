async function loadHouses() {
    const $houseContainer = document.querySelector(".houses-container");
    try {
        const response = await fetch("data/JsonBatiment.json");
        const data = await response.json();

        if (data) {
            $houseContainer.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
            data.results.forEach(house => {
                const houseDiv = document.createElement("div");
                const color = getColor(house);
                houseDiv.className = "bg-white p-6 rounded-2xl shadow hover:shadow-xl transition-shadow duration-300 hover:scale-[1.02] transform";
                houseDiv.innerHTML = `<h2 class="text-xl font-semibold mb-2">🏚️ ${house.mun_code || "N/A"}</h2>
                                    <ul class="text-sm text-gray-600 space-y-1">
                                    <li><em class="fas w-4 fa-home mr-2 text-gray-500"></em>Type: Residential</li>
                                    <li><em class="fas w-4 fa-map-marker-alt mr-2 text-gray-500"></em>Location: ${house.municipalitys || "N/A"}, ${house.province}</li>
                                    <li><em class="fas w-4 fa-calendar-alt mr-2 text-gray-500"></em>Year: ${house.build_year || "N/A"}</li>
                                    <li><em class="fas w-4 fa-bolt mr-2 text-gray-500"></em>Energy rating: 
                                    <span class="${color} font-semibold">${house.e_spec_label || "N/A"} (${house.e_spec} kWh/m² per year)</span></li>
                                    </ul>`;

                $houseContainer.appendChild(houseDiv);
            });
        }

    } catch (error) {
        $houseContainer.innerHTML = "<p class='text-red-500'>Failed to load house data. Please try again later.</p>";
    }
}

function getColor(house) {
    const rating = parseInt(house.e_spec, 10);
    if (rating > 0 && rating < 45) {
        return "text-green-800";
    } else if (rating > 45 && rating < 85) {
        return "text-green-800";
    } else if (rating > 85 && rating < 170) {
        return "text-green-500";
    } else if (rating > 170 && rating < 225) {
        return "text-green-500";
    } else if (rating > 255 && rating < 340) {
        return "text-amber-400";
    } else if (rating > 340 && rating < 425) {
        return "text-amber-400";
    } else if (rating > 425 && rating < 510) {
        return "text-red-500";
    } else if (rating >= 510) {
        return "text-red-500";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.querySelector('button');
    searchButton.addEventListener('click', () => {
        const filters = {
            insCode: document.querySelector('input[placeholder="INS-code"]').value,
            housingType: document.querySelector('select:first-of-type').value,
            location: document.querySelector('input[placeholder="📍 Location"]').value,
            year: document.querySelector('input[placeholder="📅 Year"]').value,
            energyRating: document.querySelector('select:last-of-type').value
        };
        console.log(filters)
        loadHouses(filters);
    });

    // Load all houses initially
    loadHouses();
});
