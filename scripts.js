const key = 'ebf0c0ea17a4be8f0ce223afc0af745f'; // open weather app free key
// current weather request format https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
// coordinates by location name format http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

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

function round(num){
    return Math.round( num * 100 ) / 100
}

function extractLocation(obj){
    return {
        lat: obj.lat,
        lon: obj.lon,
        locName: obj.state || obj.country || '404' 
    }
}

// Example of tested code
// geocodeByName('Maracay').then(array => {
//     return extractLocation(array[0])
// }).then(coords => {
//     return getCurrentWeather(coords.lat,coords.lon).then(weather => console.log(weather))})