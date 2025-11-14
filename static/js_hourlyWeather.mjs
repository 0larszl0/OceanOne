// setInterval(async () => {
//     await bodiedFetch();
// }, 1000 * 60 * 60);


async function updateWeather() {
    await bodiedFetch(
        "/get-weather",
        {"temperature-unit": "C"},  // change temp_kind to 'F' if value is to be in Fahrenheit instead of Celsius
        x
    );
}

function x(weather_details){

    // -- Set each weather detail with the relevant information
    let ids = ["city", "region", "temperature", "temperature-unit", "humidity", "feels-like", "wind-speed", "wind-direction"];

    for (var i = 0; i < ids.length; i++) {
        var span = document.getElementById(ids[i]);
        span.innerText = weather_details[ids[i]];
    }
}

