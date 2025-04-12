function init() {
    loadBuildings();
    addSearch();
}

async function loadBuildings(filters = {}) {
    const $buildingContainer = document.querySelector("#building-container");
    $buildingContainer.innerHTML = "";
    
    try {
        const response = await fetch("data/buildings.json");
        const data = await response.json();
        
        const filteredBuildings = data.results.filter(building => {
            if (filters.insCode && building.mun_code !== filters.insCode) {
                return false;
            }
            
            if (filters.buildingType && filters.buildingType !== "Any" &&
                building.destination !== filters.buildingType) {
                return false;
            }
            
            // Filter by location if provided
            if (filters.location &&
                !(building.municipality?.toLowerCase().includes(filters.location.toLowerCase()) ||
                    building.province?.toLowerCase().includes(filters.location.toLowerCase()))) {
                return false;
            }
            
            // Filter by year if provided
            if (filters.year && parseInt(building.build_year, 10) !== parseInt(filters.year, 10)) {
                return false;
            }
            
            // Filter by energy rating if provided and not "Any"
            if (filters.energyRating && filters.energyRating !== "Any" &&
                building.e_spec_label !== filters.energyRating) {
                return false;
            }
            
            return true;
        });
        
        if (filteredBuildings.length === 0) {
            $buildingContainer.innerHTML = "<p class='col-span-3 text-center text-gray-500 py-8'>No buildings found matching your criteria.</p>";
            return;
        }
        
        filteredBuildings.forEach(building => {
            const color = getColor(building);
            $buildingContainer.insertAdjacentHTML("beforeend", `
                <div class="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition-shadow duration-300 hover:scale-[1.02] transform">
                    <h2 class="text-xl font-semibold mb-2">🏚️ ${building.mun_code || "N/A"}</h2>
                    <ul class="text-sm text-gray-600 space-y-1">
                    <li><em class="fas w-4 fa-home mr-2 text-gray-500"></em>Type: ${building.destination.toLowerCase().replaceAll("_", " ")}</li>
                    <li><em class="fas w-4 fa-map-marker-alt mr-2 text-gray-500"></em>Location: ${building.municipality || "N/A"}, ${building.province}</li>
                    <li><em class="fas w-4 fa-calendar-alt mr-2 text-gray-500"></em>Year: ${building.build_year || "N/A"}</li>
                    <li><em class="fas w-4 fa-bolt mr-2 text-gray-500"></em>Energy rating:
                    <span class="${color} font-semibold">${building.e_spec_label || "N/A"} (${building.e_spec} kWh/m² per year)</span></li>
                    </ul>
                </div>
            `);
        });
        
    } catch (error) {
        $buildingContainer.innerHTML = "<p class='text-red-500'>Failed to load building data.</p>";
    }
}

function addSearch() {
    const $searchButton = document.querySelector("button");
    $searchButton.addEventListener("click", () => {
        const filters = {
            insCode: document.querySelector("#ins-code").value,
            buildingType: document.querySelector("#building-type").value,
            location: document.querySelector("#location").value,
            year: document.querySelector("#year").value,
            energyRating: document.querySelector("#energy-rating").value
        };
        loadBuildings(filters);
    });
}

function getColor(building) {
    const rating = parseInt(building.e_spec, 10);
    if (rating <= 45) {
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
    } else {
        return "text-red-500";
    }
}

init();
