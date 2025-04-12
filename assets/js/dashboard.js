async function init2() {
    try {
        const response = await fetch("data/municipality.json");
        const data = await response.json();

        if (data) {
            const bestCommune = data.results.map(commune => (
                {name : commune.municipality, espec : commune.e_spec}
            )).sort((a,b) => a.espec - b.espec).splice(0, 10);

            new Chart(document.querySelector("#chartForBest"), {
                type: "bar",
                data: {
                    labels: bestCommune.map(row => row.name),
                    datasets: [
                        {
                            label: "Annual energy consumption",
                            data: bestCommune.map(row => row.espec),
                            backgroundColor: "#14532D"
                        }
                    ]
                }
            });

            const worstCommune = data.results.map(commune => (
                {name : commune.municipality, espec : commune.e_spec}
            )).sort((a,b) => b.espec - a.espec).splice(0, 10);

            new Chart(document.querySelector("#chartForWorst"), {
                type: "bar",
                data: {
                    labels: worstCommune.map(row => row.name),
                    datasets: [
                        {
                            label: "Annual energy consumption",
                            data: worstCommune.map(row => row.espec),
                            backgroundColor: "#ad1328"
                        }
                    ]
                }
            });
        }
    } catch (error) {
        console.log(error)
    }
}

await init2();
