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

    function makeReportObj(weatherResponse){
        const a = weatherResponse;
        return {
            weather: a.weather[0].main,
            description: a.weather[0].description,
            humidity: `${a.main.humidity}%`,
            temp: `${a.main.temp}° F`,
            clouds: `${a.clouds.all}%`,
            time: new Date(a.dt * 1000).toGMTString(),
            city: a.name
        }}

    return {
        byCoords: getCurrentWeather,
        byName: geocodeByName,
        extractLocation,
        getCuratedInfo: makeReportObj,
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

    function createHumanReport(weatherObj){
        const x = weatherObj;
        const a = `The current weather in ${x.city} qualifies as "${x.weather}-ish", reported mostly as ${x.description}.`; 
        const b = `This information was taken at ${x.time}, temperature: ${x.temp}, humidity: ${x.humidity} and the sky was ${x.clouds} clouds. `
        return [a,b]
    }

    return {
        getName, getLat, getLon, humanReport: createHumanReport,
    }

})()

const byNameButton = document.querySelector('button.ByName')
byNameButton.addEventListener('click',async () => {
    try {
        const input = interface.getName();
        const locationArray = await weatherApp.byName(input)
        const firstLocation = weatherApp.extractLocation(locationArray[0])
        const weather = await weatherApp.byCoords(firstLocation.lat,firstLocation.lon);
        const reportItems = weatherApp.getCuratedInfo(weather)
        const humanReport = interface.humanReport(reportItems)
        console.log(humanReport)
    } catch (error) {
        console.error(error)
    }

    
    // then(coords => {
    //     return .then(weather => console.log(weather))})
})