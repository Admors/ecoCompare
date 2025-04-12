function init() {
    loadMunicipality();
}

async function loadMunicipality(filters = {}) {
    const $municipalityContainer = document.querySelector("#municipality-container");
    $municipalityContainer.innerHTML = "";

    try {
        const response = await fetch("./data/municipality.json");
        const data = await response.json();
        console.log(data.results);

        data.results.forEach(municipality => {
            const color = getColor(municipality);
            $municipalityContainer.insertAdjacentHTML("beforeend", `
                <article class="bg-white p-6 rounded-2xl shadow-md mb8 border border-${color} my-[1rem]">
                    <h2 class="text-xl font-semibold mb-2">📍 Municipality: ${municipality.municipality || "N/A"}</h2>
                    <ul class="text-sm text-gray-600 space-y-1">
                    <li>E-spec average : ${municipality.e_spec}</li>
                    <li>Certificates: ${municipality.certificates}</li>
                    <li>Average label : <span class="text-${color}">${municipality.e_spec_label}</span> </li>
                </article>
            `);
        });

    } catch (error) {
        $municipalityContainer.innerHTML = "<p class='text-red-500'>Failed to load municipality data.</p>";
        console.error(error)
    }
}

// function addSearch() {
//     const $searchButton = document.querySelector("button");
//     $searchButton.addEventListener("click", () => {
//         const filters = {
//             insCode: document.querySelector("#ins-code").value,
//             buildingType: document.querySelector("#building-type").value,
//             location: document.querySelector("#location").value,
//             year: document.querySelector("#year").value,
//             energyRating: document.querySelector("#energy-rating").value
//         };
//         loadBuildings(filters);
//     });
// }

function getColor(municipality) {
    switch (municipality.e_spec_label){
        case "A+": return "green-500";
        case "A" : return "green-800";
        case "B" : return "green-500";
        case "C" : return "orange-500";
        case "D" : return "orange-500";
        case "E" : return "orange-500";
        case "F" : return "red-500";
        case "G" : return "red-500";
    }
}

init();
