async function something() {
    const $houseContainer = document.querySelector('.houses-container')
    try {
        const response = await fetch('data/JsonBatiment.json');
        const data = await response.json();

        if (data) {
            $houseContainer.innerHTML = '<h1>TEST</h1>';
        }
        
    } catch (error) {
        $houseContainer.innerHTML = '<p class="text-red-500">Failed to load house data. Please try again later.</p>';
    }
}

await something();