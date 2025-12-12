/**
 * The function that initiates a conversation with the backend regarding the weather.
 */
async function updateWeather() {
    await bodiedFetch(
        "/get-weather",
        { temp_kind: "C" },
        displayWeather
    );
}


/**
 * Changes some known span values to allow new weather details to be seen.
 * @param {JSON} weather_details The weather details responded from the backend.
 */
function displayWeather(weather_details){
    for (var span_name in weather_details) {
        document.getElementById(span_name).innerText = weather_details[span_name];
    }
}

