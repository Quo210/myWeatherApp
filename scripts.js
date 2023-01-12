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
            const coordObj = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${str}&limit=5&appid=${key}`)
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

    async function getClimateGif(obj){
        try {
            const gifResponse = await fetch(`https://api.giphy.com/v1/gifs/translate?api_key=P94o4DBJDiZLCQ5yRXonVgA4CZ4ICarl&s=${obj.weather}`,{ mode: 'cors'}).then(res => res.json())
            return gifResponse.data.images.original.url
        } catch(err){
            console.error(err)
        }
        
    }
     

    return {
        byCoords: getCurrentWeather,
        byName: geocodeByName,
        extractLocation,
        getCuratedInfo: makeReportObj,
        getClimateGif
    }
} )();

const interface = (() => {
    const nameBox = document.querySelector('#searchByName')
    const latBox = document.querySelector('#lat')
    const lonBox = document.querySelector('#lon')
    const upperReport = document.querySelector('div.top')
    const lowerReport = document.querySelector('div.bottom')
    const getName = () => nameBox.value;
    const getLat = () => latBox.value;
    const getLon = () => lonBox.value;

    function createHumanReport(weatherObj){
        const x = weatherObj;
        const a = `The current weather in ${x.city} qualifies as "${x.weather}-ish", reported mostly as ${x.description}.`; 
        const b = `This information was taken at ${x.time}, temperature: ${x.temp}, humidity: ${x.humidity} and the sky was ${x.clouds} clouds. `
        return [a,b]
    }

    function showReport(array){
        upperReport.textContent = array[0]
        lowerReport.textContent = array[1]
    }

    function viableCoords(){
        const a = parseInt( getLat() )
        const b = parseInt( getLon() )
        switch(true){
            case (a == undefined || b == undefined):
            case (isNaN(a) || isNaN(b)):
            case (a > 90 || a < -90):
            case (b > 180 || b < -180):
                return false
                break;
            default: 
                return true
        }
    }

    function clearCoords(){
        [latBox,lonBox].forEach(a => a.value = '')
    }

    function makeOptionBox(obj){
        const container = document.createElement('div');
        const header = document.createElement('h2');
        [container, header].forEach(e => e.classList.add('optionBox'));
        let dataKey = `${obj.lat},${obj.lon}`;
        let information = `"${obj.name}" - ${obj.country}`; 
        if(obj.state){
            //dataKey += `,${obj.state}`;
            information += ` (${obj.state})`;
        } 
        container.setAttribute('data-key',dataKey);
        header.textContent = information;
        container.appendChild(header)
        return container
    }

    function showGif(url){
        document.querySelector('img.gif').setAttribute('src',url)
    }

    function clearLocationBoxes(){
        interface.getOptionsBox().innerHTML = '';
    }

    function getOptionsBox(){
        return document.querySelector('div.options')
    }

    return {
        getName, getLat, getLon, humanReport: createHumanReport, showReport, isCoordViable: viableCoords, clearCoords,
        makeOptionBox, showGif, getOptionsBox, clearLocationBoxes
    }

})()

const searchFunctionWrapper = async (coords) => {
    const weather = await weatherApp.byCoords(coords[0],coords[1]); // use coords to fetch and jsonify current weather on the selected location
    const reportItems = weatherApp.getCuratedInfo(weather) // extract information from response to be used, save in object
    const humanReport = interface.humanReport(reportItems) // Create a string of human readable information about the weather
    interface.showReport(humanReport) // Show information in the interface
}

//Name button
const byNameButton = document.querySelector('button.ByName')
byNameButton.addEventListener('click',async () => {
    try {
        const input = interface.getName(); // take the name of the location from user input 
        const locationArray = await weatherApp.byName(input) // fetch and jsonify server response
        interface.clearLocationBoxes();
        for (let i = 0; i < locationArray.length; i++){
            const box = interface.makeOptionBox(locationArray[i])
            box.addEventListener('click', function() {
                const coords = this.getAttribute('data-key').split(",")
                searchFunctionWrapper(coords)
            })
            interface.getOptionsBox().appendChild(box)
        }
        const firstLocation = weatherApp.extractLocation(locationArray[0]) // extract coordinates from response
        const weather = await weatherApp.byCoords(firstLocation.lat,firstLocation.lon); // use coords to fetch and jsonify current weather on the selected location
        const reportItems = weatherApp.getCuratedInfo(weather) // extract information from response to be used, save in object
        const gif = await weatherApp.getClimateGif(reportItems) // gyphy search API
        interface.showGif(gif)
        const humanReport = interface.humanReport(reportItems) // Create a string of human readable information about the weather
        interface.showReport(humanReport) // Show information in the interface
    } catch (error) {
        console.error(error)
    }
});

// Coords button
const coButton = document.querySelector('button.byCoords');
coButton.addEventListener('click',async () => {

    try {
        if (!interface.isCoordViable()){
            alert('One of the coordinates entered is not viable.\nLATITUDE: 90 to -90 / LONGITUDE: 180 to -180')
            interface.clearCoords()
        }
        const searchResult = await weatherApp.byCoords(interface.getLat(),interface.getLon());
        if (searchResult.cod == "400") { throw new Error('Bad Request') }
        const reportItems = weatherApp.getCuratedInfo(searchResult);
        interface.showReport( interface.humanReport(reportItems))
        const gif = await weatherApp.getClimateGif(reportItems) // gyphy search API
        interface.showGif(gif)
    } catch (error) {
        console.error(error)
    }
    

})
