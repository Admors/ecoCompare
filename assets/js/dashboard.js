async function init() {
    const response = await fetch("data/municipality.json");
    const data = await response.json();
    
    if (!data) return;
    
    const bestCommune = data.results.map(commune => (
        {name: commune.commune, espec: commune.e_spec}
    )).sort((a, b) => a.espec - b.espec).splice(0, 10);
    
    new Chart(document.querySelector("#chartForBest"), {
        type: "bar",
        data: {
            labels: bestCommune.map(row => row.name),
            datasets: [
                {
                    label: "Annual energy consumption (in kWh/m² per year)",
                    data: bestCommune.map(row => row.espec),
                    backgroundColor: "oklch(72.3% 0.219 149.579)"
                }
            ]
        }
    });
    
    const worstCommune = data.results.map(commune => (
        {name: commune.commune, espec: commune.e_spec}
    )).sort((a, b) => b.espec - a.espec).splice(0, 10);
    
    new Chart(document.querySelector("#chartForWorst"), {
        type: "bar",
        data: {
            labels: worstCommune.map(row => row.name),
            datasets: [
                {
                    label: "Annual energy consumption (in kWh/m² per year)",
                    data: worstCommune.map(row => row.espec),
                    backgroundColor: "oklch(63.7% 0.237 25.331)"
                }
            ]
        }
    });
}

await init();
