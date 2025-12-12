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
    // Update the background image (smoothly)
    let old_background = document.getElementById("old-background");
    let new_background = document.getElementById("new-background");

    old_background.style.backgroundImage = new_background.style.backgroundImage;
    new_background.style.backgroundImage = `url(static/${currentHour}.png)`;

    new_background.classList.add("fade-in-anim");

    // update the forecasted weather on the scree
    await updateWeather();
}