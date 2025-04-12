function init() {
    loadMunicipality();
    addSearch();
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
            return "green-500";
        case "A":
            return "green-800";
        case "B":
            return "green-500";
        case "C":
            return "yellow-500";
        case "D":
            return "orange-500";
        case "E":
            return "orange-500";
        case "F":
            return "red-500";
        case "G":
            return "red-500";
        default:
            return "gray-300";
    }
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

        filteredMunicipalities.forEach(m => {
            const color = getColor(m);
            $municipalityContainer.insertAdjacentHTML("beforeend", `
                <article class="bg-white p-6 rounded-2xl shadow-md mb-8 border border-${color} my-[1rem]">
                    <h2 class="text-xl font-semibold mb-2">📍 Municipality: ${m.municipality || "N/A"}</h2>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>Certificates: ${m.certificates}</li>
                        <li>E-spec average: ${m.e_spec}</li>
                        <li>Average label: <span class="text-${color} font-semibold">${m.e_spec_label}</span></li>
                    </ul>
                </article>
            `);
        });

    } catch (error) {
        console.error(error);
        $municipalityContainer.innerHTML = "<p class='text-red-500'>Failed to load municipality data.</p>";
    }
}

init();