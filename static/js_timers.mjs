/* ------ All timers within this project ------ */

/**
 * A timer that updates every hour, by checking every second.
 */
setInterval(function() {
    let newHour = new Date().getUTCHours();

    if (currentHour != newHour) {
        currentHour = newHour;
        hourlyUpdate(currentHour);
    }
}, 1000);


/**
 * An asynchronous function that updates select things every hour.
 */
async function hourlyUpdate(currentHour) {
    // update the background image
    document.getElementById("main-screen").setAttribute("style", `background-image: url(static/${currentHour}.png);`)

    // update the forecasted weather on the scree
    await updateWeather();
}