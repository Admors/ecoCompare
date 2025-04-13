function init() {
    loadMunicipality();
    addSearch();
}

async function loadMunicipality(filters = {}) {
    const $municipalityContainer = document.querySelector("#municipality-container");
    $municipalityContainer.innerHTML = "";
    
    try {
        const response = await fetch("./data/municipality.json");
        const data = await response.json();
        
        const filteredMunicipalities = data.results.filter(municipality => {
            
            if (filters.municipality && !(municipality.municipality.toLowerCase().includes(filters.municipality.toLowerCase()))) {
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
            $municipalityContainer.insertAdjacentHTML("beforeend", `
            <article class="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition hover:scale-[1.02] transform border-2 border-${color} opacity-0 animate-fade-in" style="animation-delay: ${animationDelay * 100}ms;">
                <h2 class="text-xl font-semibold mb-2">📍 Municipality: ${m.municipality || "N/A"}</h2>

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
                </article>
            `);
        });
        
    } catch (error) {
        console.error(error);
        $municipalityContainer.innerHTML = "<p class='text-red-500'>Failed to load municipality data.</p>";
    }
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
        case "A+":
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
            document.querySelector("#municipality-container").innerHTML = "<p class='text-red-500'>Failed to load municipality data.</p>";
            console.error("Invalid energy label");
        }
    }
}

init();
