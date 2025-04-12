async function something(){
    try {
        const response = await fetch('data/JsonBatiment.json');
        const data = await response.json();
  
        housesContainer.innerHTML = '<h1>TEST</h1>';
        console.log("non error");
      } catch (error) {
        console.log(error);
        document.querySelector('.houses-container').innerHTML =  '<p class="text-red-500">Failed to load house data. Please try again later.</p>';
      }
  }
  await something();