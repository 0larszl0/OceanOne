/* --- Add events for apps --- */

/**
 When the page loads, find all the apps using the class name 'app'. Then add each app's proper event.
 */
window.onload = function() {
    console.log("Complete");
    let apps = document.getElementsByClassName("app");

    for (var i = 0; i < apps.length; i++) {
        apps[i].addEventListener("mouseover", function(event) {  // When you hover over the app button
            console.log("Hovering");
            let app_previews = this.querySelector(".app-previews");

//             app_previews.setAttribute("style", "visibility: visible;")  // make the preview visible
        });

        apps[i].addEventListener("mouseout", function(event) {  // When the mouse leaves the app family
            let app_previews = this.querySelector(".app-previews");

//             app_previews.setAttribute("style", "visibility: hidden;")  // hide the preview.
        });
    }
}
