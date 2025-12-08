/* ------ All timers within this project ------ */

/* -- Globals -- */
const date = new Date();

/**
 * A timer that updates every hour, by checking every second.
 */
setInterval(function() {
    if (lastHour != date.getUTCHours()) {
        hourlyUpdate();
    }
}, 1000);


/**
 * An asynchronous function that updates select things every hour.
 */
async function hourlyUpdate() {
    // update the forecasted weather on the scree
    lastHour = date.getUTCHours();
    await updateWeather();

    // update the background image
    document.getElementById("main-screen").setAttribute("style", `background-image: url(static/${lastHour}.png);`)

}