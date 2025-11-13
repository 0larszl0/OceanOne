// setInterval(async () => {
//     await bodiedFetch();
// }, 1000 * 60 * 60);


async function updateWeather() {
    await bodiedFetch(
        "/get-weather",
        {"temp_kind": "C"},  // change temp_kind to 'F' if value is to be in Fahrenheit instead of Celsius
        x
    );
}

function x(weather_details){
    let temp_span = document.getElementById("temperature-val");
    let temp_sym_span = document.getElementById("temperature-unit");

    let location_span = document.getElementById("location");

    temp_span.innerText = weather_details["temperature"];
    temp_sym_span.innerText = weather_details["temp_kind"];
    location_span.innerText = `${weather_details['city']}, ${weather_details['region']}`;

    console.log(weather_details);
    console.log(weather_details.json());
}

