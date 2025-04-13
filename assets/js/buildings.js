async function loadBuildings(filters = {}) {
    const $buildingContainer = document.querySelector("#buildings-graph");
    $buildingContainer.innerHTML = "";

    try {
        const response = await fetch("data/batiments_lannee_construction.json");
        const data = await response.json();

        const filteredBuildings = data.filter(building => {
            //Filter by INS code if provided
            if (filters.insCode && building.ins !== filters.insCode) {
                return false;
            }

            if (filters.entitySelector && filters.entitySelector !== "Any" &&
                building.type_entite !== filters.entitySelector) {
                return false;
            }

            // Filter by location if provided
            return !(filters.location &&
                !(building.entite?.toLowerCase().includes(filters.location.toLowerCase()) ||
                    building.type_entite?.toLowerCase().includes(filters.location.toLowerCase())));
        });

        if (filteredBuildings.length === 0) {
            $buildingContainer.innerHTML = "<p class='col-span-3 text-center text-gray-500 py-8'>No buildings found matching your criteria.</p>";
            return;
        }

        filteredBuildings.forEach(building => {
            const color = getColor(building);
            const buildingDiv = document.createElement("div");
            buildingDiv.classList.add("bg-white", "p-6", "rounded-2xl", "shadow-md", "mb-8", "w-fit", "mx-auto");

            const title = document.createElement("h2");
            title.classList.add("text-xl", "font-bold", "mb-2");

            let originalTitle = building.type_et_entite || "Building Data";
            let words = originalTitle.split(" ");

            if (words[0] === "Commune") {
                words[0] = "Municipality";
            } else if (words[0] === "Arrondissement") {
                words[0] = "Borough";
            }

            title.textContent = words.join(" ");

            const canvas = document.createElement("canvas");
            canvas.id = `building-chart-${building.ins}`;
            canvas.width = 680;

            buildingDiv.appendChild(title);
            buildingDiv.appendChild(canvas);
            $buildingContainer.appendChild(buildingDiv);

            // Prepare data for the chart
            const labels = [
                "Before 1900",
                "1900-1918",
                "1919-1945",
                "1946-1961",
                "1962-1970",
                "1971-1981",
                "1982-2001",
                "2002-2011",
                "After 2011",
                "Not Avaible"
            ];
            const dataValues = [
                building.part_des_batiments_eriges_avant_1900,
                building.part_des_batiments_eriges_entre_1900_et_1918,
                building.part_des_batiments_eriges_entre_1919_et_1945,
                building.part_de_batiments_eriges_entre_1946_et_1961,
                building.part_de_batiments_eriges_entre_1962_et_1970,
                building.part_de_batiments_eriges_entre_1971_et_1981,
                building.part_de_batiments_eriges_entre_1982_et_2001,
                building.part_de_batiments_eriges_entre_2002_et_2011,
                building.part_de_batiments_eriges_apres_2011,
                building.part_de_batiments_pour_lesquels_l_annee_d_achevement_de_la_construction_n_est_pas_disponible
            ];

            new Chart(canvas, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Distribution of buildings by construction period (%)",
                        data: dataValues,
                        backgroundColor: color
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Pourcentage'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Construction period'
                            }
                        }
                    }
                }
            });
        });

    } catch (error) {
        $buildingContainer.innerHTML = "<p class='text-red-500'>Failed to load building data.</p>";
    }
}


function addSearch() {
    const $searchButton = document.querySelector("button");
    $searchButton.addEventListener("click", () => {
        const filters = {
            insCode: document.querySelector("#ins-code-building").value,
            location: document.querySelector("#locationBuilding").value,
            entitySelector: document.querySelector("#entity-selector").value,
        };
        loadBuildings(filters);
    });
}

function getColor(building) {
    if (building.type_entite === "Province") {
        return "#36A2EB";
    } else if (building.type_entite === "Commune") {
        return "#FF6384";
    } else {
        return "#4BC0C0";
    }
}

addSearch();
loadBuildings();