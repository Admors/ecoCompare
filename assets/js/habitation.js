function init() {
    loadBuildings();
    addSearch();
}

async function loadBuildings(filters = {}) {
    const $buildingContainer = document.querySelector("#building-container");
    $buildingContainer.innerHTML = "<p class='col-span-3 text-center text-gray-500 py-8'>Loading buildings...</p>";
    
    try {
        let allBuildings = [];
        const storedBuildingsData = sessionStorage.getItem("buildingsData-habitation");
        
        if (storedBuildingsData) {
            allBuildings = JSON.parse(storedBuildingsData);
        } else {
            const maxRecords = 500;
            const limit = 100;
            const totalCalls = maxRecords / limit;
            
            for (let i = 0; i < totalCalls; i++) {
                const offset = i * limit;
                const response = await fetch(`https://www.odwb.be/api/explore/v2.1/catalog/datasets/peb-certification-residentielle-batiment-existant/records?select=communes%2C%20e_spec_label%2C%20e_spec%2C%20destination%2C%20build_period_v2%2C%20build_year%2C%20province%2C%20mun_code&limit=${limit}&offset=${offset}`);
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                    allBuildings.push(...data.results);
                } else break;
            }
            
            sessionStorage.setItem("buildingsData-habitation", JSON.stringify(allBuildings));
        }
        
        $buildingContainer.innerHTML = "";
        
        const filteredBuildings = allBuildings.filter(building => {
            if (filters.insCode && building.mun_code !== filters.insCode) return false;
            
            if (filters.buildingType && filters.buildingType !== "Any" &&
                building.destination !== filters.buildingType) {
                return false;
            }
            
            if (filters.location && !(building.communes.toLowerCase().includes(filters.location.toLowerCase()) ||
                building.province?.toLowerCase().includes(filters.location.toLowerCase()))) {
                return false;
            }
            
            if (filters.year && parseInt(building.build_year, 10) !== parseInt(filters.year, 10)) {
                return false;
            }
            
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
        
        filteredBuildings.forEach((building, i) => {
            const color = getColor(building);
            const animationDelay = i > 15 ? 15 : i;
            $buildingContainer.insertAdjacentHTML("beforeend", `
            <article class="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition hover:scale-[1.02] transform border-2 border-${color} opacity-0 animate-fade-in" style="animation-delay: ${animationDelay * 100}ms;">
                    <h2 class="text-xl font-semibold mb-2">🏚️ ${building.mun_code || "N/A"}</h2>
                    <ul class="text-sm text-gray-600 space-y-1">
                    <li><em class="fas w-4 fa-home mr-2 text-gray-500"></em>Type: ${building.destination.toLowerCase().replaceAll("_", " ")}</li>
                    <li><em class="fas w-4 fa-map-marker-alt mr-2 text-gray-500"></em>Location: ${building.communes || "N/A"}, ${building.province}</li>
                    <li><em class="fas w-4 fa-calendar-alt mr-2 text-gray-500"></em>Construction Year: ${building.build_year || "N/A"}</li>
                    <li><em class="fas w-4 fa-bolt mr-2 text-gray-500"></em>EPC:
                    <span class="text-${color} font-semibold">${building.e_spec_label || "N/A"} (${building.e_spec} kWh/m² per year)</span></li>
                    </ul>
                </article>
            `);
        });
        
    } catch (error) {
        $buildingContainer.innerHTML = "<p class='text-red-500'>Failed to load building data.</p>";
        console.error("Error loading building data:", error);
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
    switch (building.e_spec_label) {
        case "++A":
            return "green-800";
        case "+A":
            return "green-800";
        case "A":
            return "green-800";
        case "B":
            return "green-500";
        case "C":
            return "green-500";
        case "D":
            return "amber-400";
        case "E":
            return "amber-400";
        case "F":
            return "red-500";
        case "G":
            return "red-500";
        default: {
            console.error("Invalid energy label", building.e_spec_label);
            return "gray-500";
        }
    }
}

init();
