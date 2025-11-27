// setInterval(async () => {
//     await bodiedFetch();
// }, 1000 * 60 * 60);


async function updateWeather() {
    const widget = document.getElementById("weather-widget");
    if (widget) widget.classList.add("loading");

    await bodiedFetch(
        "/get-weather",
        { temp_kind: "C" },
        (weather_details) => {
            x(weather_details);
            if (widget) widget.classList.remove("loading");
        }
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
}

