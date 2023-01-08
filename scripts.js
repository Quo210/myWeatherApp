const key = 'ebf0c0ea17a4be8f0ce223afc0af745f'; // open weather app free key
// current weather request format https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
// coordinates by location name format http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

function round(num){
    return Math.round( num * 100 ) / 100
}

const weatherApp = ( () => {
    async function getCurrentWeather(lat,lon){
        try {
            const weatherInfo = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`,{ mode: 'cors' });
            return await weatherInfo.json()
        } catch (error) {
            console.error(error)
            throw new Error(error)
        }
    }
    
    async function geocodeByName(str){
        try {
            const coordObj = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${str}&limit=3&appid=${key}`)
            .then(response => response.json());
            return coordObj
        } catch (err) {
            console.error(err)
        }
    }
    
    function extractLocation(obj){
        return {
            lat: obj.lat,
            lon: obj.lon,
            locName: obj.state || obj.country || '404' 
        }
    }

    return {
        byCoords: getCurrentWeather,
        byName: geocodeByName,
        extractLocation,
    }
} )();



// Example of tested code
// geocodeByName('Maracay').then(array => {
//     return extractLocation(array[0])
// }).then(coords => {
//     return getCurrentWeather(coords.lat,coords.lon).then(weather => console.log(weather))})

const interface = (() => {
    const nameBox = document.querySelector('#searchByName')
    const latBox = document.querySelector('#lat')
    const lonBox = document.querySelector('#lot')
    const getName = () => nameBox.value;
    const getLat = () => latBox.value;
    const getLon = () => lonBox.value;

    return {
        getName, getLat, getLon,
    }

})()

const byNameButton = document.querySelector('button.ByName')
byNameButton.addEventListener('click',async () => {
    try {
        const input = interface.getName();
        const locationArray = await weatherApp.byName(input)
        const firstLocation = weatherApp.extractLocation(locationArray[0])
        const weather = await weatherApp.byCoords(firstLocation.lat,firstLocation.lon);
        console.log(weather)
    } catch (error) {
        console.error(error)
    }

    
    // then(coords => {
    //     return .then(weather => console.log(weather))})
})