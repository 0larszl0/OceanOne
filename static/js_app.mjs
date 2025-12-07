/* --- Add events for apps --- */

/**
 When the page loads, find all the apps using the class name 'app'. Then add each app's proper event.
 */
window.onload = function() {
    console.log("Complete");
    let apps = document.getElementsByClassName("app");

    for (var i = 0; i < apps.length; i++) {
        // When you hover over the app button
        apps[i].addEventListener("mouseover", function(event) { this.querySelector(".app-previews").classList.remove("hidden"); });

        // When the mouse leaves the app previews
        apps[i].addEventListener("mouseout", function(event) { this.querySelector(".app-previews").classList.add("hidden"); });
    }
}
