// 1. Dom Elemente
// Mit querySelector die HTML-Elemente vorstellen

const form_ct = document.querySelector ('#searchform');
const place_input = document.querySelector ('#place-input');
const sun_img = document.querySelector ('#sun-animation');

// Lottie Ping-Pong: Sonne geht runter, dann wieder hoch
let lottie_richtung = 1;
sun_img.addEventListener('complete', function () {
    lottie_richtung *= -1;
    sun_img.setDirection(lottie_richtung);
    sun_img.play();
});


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
    const url = `https://nominatim.openstreetmap.org/search?q=${ort}&format=json`; 
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

//4. Anzeige Funktion 

function zeige_ergebnis(){

    const zeitformat = {
        timeZone: sun_details.timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    }

    const zeit_morgen    = new Date(sun_details.morgendämmerung).toLocaleTimeString('de-CH', zeitformat);
    const zeit_aufgang   = new Date(sun_details.sunrise).toLocaleTimeString('de-CH', zeitformat);
    const zeit_untergang = new Date(sun_details.sunset).toLocaleTimeString('de-CH', zeitformat);
    const zeit_abend     = new Date(sun_details.abenddämmerung).toLocaleTimeString('de-CH', zeitformat);

    const datum = new Date().toLocaleDateString('de-CH', {
        timeZone: sun_details.timezone,
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    // Ortsname + Datum ins HTML schreiben 
    document.querySelector('#city-name').innerText = `${sun_details.name} - ${datum}`;

    // Zeiten in die Karten schreiben 
    document.querySelector('#zeit-morgen').innerText    = zeit_morgen;
    document.querySelector('#zeit-aufgang').innerText   = zeit_aufgang;
    document.querySelector('#zeit-untergang').innerText = zeit_untergang;
    document.querySelector('#zeit-abend').innerText     = zeit_abend;

    // Ergebnis sichtbar machen 
    document.querySelector('#result').classList.remove('hidden');

    // Sonne verstecken 
    document.querySelector('.sun-wrapper').classList.add('hidden');

    // Hintergrund Sonnen einblenden
    document.querySelectorAll('.bg-sonne').forEach(function(sonne) {
        sonne.classList.add('sichtbar');
    });

    console.log('Ergebnis angezeigt ✅');
}


// 5. Event Listener - warten bis User auf "suchen" klickt 

form_ct.addEventListener('submit', async function(e) {

    // Verhindert dass die Seite neu lädt
    e.preventDefault();

    // Wert aus Eingabefeld holen
    const ort = place_input.value;

    // Ort laden via API
    const ort_daten = await lade_ort(ort);

    // Prüfen ob Ort gefunden wurde
    if (ort_daten && ort_daten.length > 0) {

        // Koordinaten holen
        const lat = ort_daten[0].lat;
        const lng = ort_daten[0].lon;

        // Name speichern
        sun_details.name = ort_daten[0].display_name.split(',')[0];

        // Sonnenzeiten laden
        const sonnen_daten = await lade_sonnenzeiten(lat, lng);

        if (sonnen_daten) {
            // Daten ins Objekt speichern
            sun_details.morgendämmerung = sonnen_daten.results.civil_twilight_begin;
            sun_details.sunrise         = sonnen_daten.results.sunrise;
            sun_details.sunset          = sonnen_daten.results.sunset;
            sun_details.abenddämmerung  = sonnen_daten.results.civil_twilight_end;

            // Ergebnis anzeigen
            zeige_ergebnis();
        }

    } else {
        alert('Ort nicht gefunden. Bitte versuche es erneut.');
    }

});


// 6. Karten Detail EventListener - beim Klick auf die Karte wird Detail Box geöffnet - beim Klick auf Sonne wieder zu 

// Alle Detail Boxen zuerst verstecken 

function verstecke_alle_details() {
    document.querySelector('#detail-morgen').classList.add('hidden');
    document.querySelector('#detail-aufgang').classList.add('hidden');
    document.querySelector('#detail-untergang').classList.add('hidden');
    document.querySelector('#detail-abend').classList.add('hidden');
}

// Karte 1: Morgendämmerung
document.querySelector('#karte-morgen').addEventListener('click', function() {
    verstecke_alle_details();
    document.querySelector('#detail-morgen').classList.remove('hidden');
});

// Karte 2: Sonnenaufgang
document.querySelector('#karte-aufgang').addEventListener('click', function() {
    verstecke_alle_details();
    document.querySelector('#detail-aufgang').classList.remove('hidden');
});

// Karte 3: Sonnenuntergang
document.querySelector('#karte-untergang').addEventListener('click', function() {
    verstecke_alle_details();
    document.querySelector('#detail-untergang').classList.remove('hidden');
});

// Karte 4: Abenddämmerung
document.querySelector('#karte-abend').addEventListener('click', function() {
    verstecke_alle_details();
    document.querySelector('#detail-abend').classList.remove('hidden');
});

// Klick auf Detail Box → schliessen
document.querySelectorAll('.detail-box').forEach(function(box) {
    box.addEventListener('click', function() {
        this.classList.add('hidden');
    });
});

// 7. Tagesverlauf

const tagesverlauf_btn = document.querySelector('#tagesverlauf-btn');
const tagesverlauf_ct  = document.querySelector('#tagesverlauf');

// Button Klick → Tagesverlauf ein/ausblenden
tagesverlauf_btn.addEventListener('click', function() {
    if (tagesverlauf_ct.classList.contains('hidden')) {
        tagesverlauf_ct.classList.remove('hidden');
        zeige_tagesverlauf();
    } else {
        tagesverlauf_ct.classList.add('hidden');
    }
});

// Klick auf tagesverlauf-icon → Tagesverlauf schliessen 
document.querySelector('.tv-icon').addEventListener('click', function() {
    tagesverlauf_ct.classList.add('hidden');
});

// Tagesverlauf berechnen und anzeigen
function zeige_tagesverlauf() {

    const zeitformat = {
        timeZone: sun_details.timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    }

    // Zeiten holen
    const zeit_morgen    = new Date(sun_details.morgendämmerung).toLocaleTimeString('de-CH', zeitformat);
    const zeit_aufgang   = new Date(sun_details.sunrise).toLocaleTimeString('de-CH', zeitformat);
    const zeit_untergang = new Date(sun_details.sunset).toLocaleTimeString('de-CH', zeitformat);
    const zeit_abend     = new Date(sun_details.abenddämmerung).toLocaleTimeString('de-CH', zeitformat);

    // Zeiten unten anzeigen
    document.querySelector('#tv-morgen-zeit').innerText   = zeit_morgen;
    document.querySelector('#tv-abend-zeit').innerText    = zeit_abend;

    // Berechne aktuelle Position der Sonne auf dem Balken
    const start   = new Date(sun_details.morgendämmerung).getTime();
    const ende    = new Date(sun_details.abenddämmerung).getTime();
    const jetzt   = new Date(new Date().toLocaleString('en-US', { timeZone: sun_details.timezone })).getTime();
    const gesamt  = ende - start;
    const vergangen = jetzt - start;

    // Position in % (zwischen 0% und 100%)
    let position = (vergangen / gesamt) * 100;
    position = Math.max(0, Math.min(100, position));  // zwischen 0-100 begrenzen

    // Sonne erst links starten, dann animieren
    const sonne_el = document.querySelector('#tv-sonne');
    sonne_el.style.left = '0%';          // Start links

    // Nach kurzer Pause zur echten Position fahren
    setTimeout(function() {
        sonne_el.style.left = `${position}%`;
    }, 100);
}


