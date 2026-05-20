// 1. Dom Elemente
// Mit querySelector die HTML-Elemente vorstellen

const form_ct = document.querySelector ('#searchform');
const place_input = document.querySelector ('#place-input');
const sun_img = document.querySelector ('#sun-animation');

console.log('DOM Elemente geladen');

// 2. Daten-Objekte - daten von API speichern - Startwerte leer, weil werden nach Suche befüllt

let sun_details = {
    name:'',                    // Name des Orts zb Chur
    morgendämmerung:'',         // Zeit kommt von API
    sunrise:'',                 // Aufgangzeit kommt von API
    sunset:'',                  // Untergangszeit von API
    abenddämmerung:'',          // Zeit kommt von API
    timezone: 'Europe/Zurich'   //Zeitzone für korrekte Uhrzeit
}

console.log ('Daten-Objekt bereit');

//3. API Funktionen

//Funktion 1: Ort suchen und dann Koordinaten (lat/lng) zurück

async function lade_ort(ort) {
    const url = `https://nominatim.openstreetmap.org/search?city=${ort}&format=json`; 
    try{
        const response = await fetch(url);
        return await response.json();
    } catch (error){
        console.error(error);
        return false;
    }
}

//Funktion 2: Sonnenzeit holen - es braucht lat und lng 

async function lade_sonnenzeiten(lat, lng){
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`;
    try{
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(error);
        return false;
    }
}
console.log('API Funktionen bereit')

