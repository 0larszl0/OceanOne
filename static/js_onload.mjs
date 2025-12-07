/* - Globals - */


/**
 When the page loads, apply all necessary event listeners and make any necessary function calls without manual intervention.
 */
window.onload = function() {

    /* -------- Add (taskbar) app events -------- */
    let apps = document.getElementsByClassName("app");

    for (var i = 0; i < apps.length; i++) {
        // When you hover over the app button
        apps[i].addEventListener("mouseover", function(event) { this.querySelector(".app-previews").classList.remove("hidden"); });

        // When the mouse leaves the app previews
        apps[i].addEventListener("mouseout", function(event) { this.querySelector(".app-previews").classList.add("hidden"); });
    }

    /* -------- Update the forecasted temperature -------- */
}
