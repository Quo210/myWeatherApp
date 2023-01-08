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

const x = getCurrentWeather(12,15)
x.then(info => console.log(info))