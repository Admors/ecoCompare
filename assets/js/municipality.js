function init() {
    loadMunicipality();
    addSearch();
}

async function loadMunicipality(filters = {}) {
    const $municipalityContainer = document.querySelector("#municipality-container");
    $municipalityContainer.innerHTML = "";
    
    try {
        let municipalityData;
        const storedMunicipalityData = sessionStorage.getItem("municipalityData");
        
        if (storedMunicipalityData) {
            municipalityData = JSON.parse(storedMunicipalityData);
        } else {
            const municipalityResponse = await fetch("./data/municipality.json");
            municipalityData = await municipalityResponse.json();
            sessionStorage.setItem("municipalityData", JSON.stringify(municipalityData));
        }
        
        let buildingsData = [];
        const storedBuildingsData = sessionStorage.getItem("buildingsData");
        
        if (storedBuildingsData) {
            buildingsData = JSON.parse(storedBuildingsData);
        } else {
            const maxRecords = 5000;
            const limit = 100;
            const totalCalls = maxRecords / limit;
            
            for (let i = 0; i < totalCalls; i++) {
                const offset = i * limit;
                const response = await fetch(`https://www.odwb.be/api/explore/v2.1/catalog/datasets/peb-certification-residentielle-batiment-existant/records?select=communes%2C%20e_spec_label%2C%20e_spec%2C%20destination%2C%20build_period_v2%2C%20build_year%2C%20province%2C%20mun_code&limit=${limit}&offset=${offset}`);
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                    buildingsData.push(...data.results);
                } else break;
            }
            
            sessionStorage.setItem("buildingsData", JSON.stringify(buildingsData));
        }
        
        const epcCountsByMunicipality = processEpcRatings(buildingsData);
        
        const filteredMunicipalities = municipalityData.results.filter(municipality => {
            if (filters.municipality && !(municipality.commune.toLowerCase().includes(filters.municipality.toLowerCase()))) {
                return false;
            }
            
            if (filters.e_spec_label && filters.e_spec_label !== "Any" &&
                municipality.e_spec_label !== filters.e_spec_label) {
                return false;
            }
            
            return true;
        });
        
        if (filteredMunicipalities.length === 0) {
            $municipalityContainer.innerHTML = "<p class='col-span-3 text-center text-gray-500 py-8'>No municipality found matching your criteria.</p>";
            return;
        }
        
        filteredMunicipalities.forEach((m, i) => {
            const color = getColor(m);
            const animationDelay = i > 15 ? 15 : i;
            const municipalityId = `chart-${m.commune.replace(/\s+/g, "-").toLowerCase()}`;
            
            $municipalityContainer.insertAdjacentHTML("beforeend", `
    <article class="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition hover:scale-[1.02] transform border-2 border-${color} opacity-0 animate-fade-in" style="animation-delay: ${animationDelay * 100}ms;">
        <h2 class="text-xl font-semibold mb-2">📍 ${m.commune || "N/A"}</h2>
        <ul class="text-sm text-gray-600 space-y-1">
            <li>
            <em class="fas w-4 fa-certificate mr-2 text-gray-500"></em>Number of Energy Performance Certificates: ${m.certificates}
            </li>
            <li>
            <em class="fas w-4 fa-gauge mr-2 text-gray-500"></em>Average Energy Efficiency Rating: ${m.e_spec}
            </li>
            <li>
            <em class="fas w-4 fa-bolt mr-2 text-gray-500"></em>Average Energy Efficiency Label:
            <span class="text-${color} font-semibold">${m.e_spec_label}</span>
            </li>
        </ul>
        <div class="mt-4">
            <h3 class="text-sm font-medium">Estimation of EPC Distribution</h3>
            <canvas class="mx-auto w-3/4" id="${municipalityId}"></canvas>
        </div>
    </article>
`);
            
            const epcData = epcCountsByMunicipality[m.commune.toLowerCase()] || createEmptyEpcData();
            createChart(municipalityId, epcData);
        });
        
    } catch (error) {
        console.error(error);
        $municipalityContainer.innerHTML = "<p class='text-red-500'>Failed to load municipality data.</p>";
    }
}

function processEpcRatings(buildings) {
    const epcCountsByMunicipality = {};
    
    buildings.forEach(building => {
        if (!building.communes) return;
        
        const municipalityKey = building.communes.toLowerCase().trim();
        
        if (!epcCountsByMunicipality[municipalityKey]) {
            epcCountsByMunicipality[municipalityKey] = {
                "A+": 0, "A": 0, "B": 0, "C": 0, "D": 0, "E": 0, "F": 0, "G": 0
            };
        }
        
        if (building.e_spec_label) {
            epcCountsByMunicipality[municipalityKey][building.e_spec_label]++;
        }
    });
    
    return epcCountsByMunicipality;
}

function createEmptyEpcData() {
    return {"A+": 0, "A": 0, "B": 0, "C": 0, "D": 0, "E": 0, "F": 0, "G": 0};
}

function createChart(canvasId, epcData) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    
    const orderedLabels = ["A+", "A", "B", "C", "D", "E", "F", "G"];
    const orderedData = orderedLabels.map(label => epcData[label] || 0);
    
    const hasData = orderedData.some(value => value > 0);
    
    if (!hasData) {
        const container = document.getElementById(canvasId).parentNode;
        container.innerHTML = "<p class=\"text-center text-gray-500 py-4\">No EPC data available</p>";
        return;
    }
    
    const backgroundColor = [
        "#166534",
        "#16a34a",
        "#22c55e",
        "#84cc16",
        "#facc15",
        "#fb923c",
        "#ef4444",
        "#b91c1c"
    ];
    
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: orderedLabels,
            datasets: [{
                data: orderedData,
                backgroundColor: backgroundColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

function addSearch() {
    const $searchButton = document.querySelector("#search");
    
    $searchButton.addEventListener("click", () => {
        const filters = {
            municipality: document.querySelector("#municipality").value.trim().toLowerCase(),
            e_spec_label: document.querySelector("#e_spec_label").value.trim()
        };
        
        loadMunicipality(filters);
    });
}

function getColor(municipality) {
    switch (municipality.e_spec_label) {
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
            console.error("Invalid energy label", municipality.e_spec_label);
            return "gray-500";
        }
    }
}

init();
