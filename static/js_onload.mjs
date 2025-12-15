/* -- Globals -- */
var currentHour = new Date().getUTCHours();


/**
 * When all the html, stylesheets and js has been loaded, update hourly once immediately, and begin hiding the loader once everything is finished.
 */
document.addEventListener("DOMContentLoaded", async function() {
    /* -------- Add listeners to the new background  */
    document.getElementById("new-background").addEventListener("animationend", (e) => {e.target.classList.remove("fade-in-anim");});

    await hourlyUpdate(currentHour);

    let pageLoader = document.getElementById("page-loader");
    pageLoader.classList.add("loader-fade-out");
    pageLoader.classList.add("suspend-pointer");

    active_emails["ocean1-intro"] = false;  // doesn't use updateMailList because no email windows nor group exist onload.
    active_emails["topic-order"] = ["ocean1-intro"];
})


/**
 When the page loads, apply all necessary event listeners and make any necessary function calls without manual intervention.
 */
window.onload = async function() {
    /* -------- Add (taskbar) app events -------- */
    let apps = document.getElementsByClassName("app");

    for (var i = 0; i < apps.length; i++) {
        // When you hover over the app button
        apps[i].addEventListener("mouseover", function() { this.querySelector(".app-previews").classList.remove("hidden"); });

        // When the mouse leaves the app previews
        apps[i].addEventListener("mouseout", function() { this.querySelector(".app-previews").classList.add("hidden"); });

        // When the mouse clicks the app icon
        apps[i].querySelector(".app-icon button").addEventListener("click", function() {
            let app = this.parentNode.parentNode;

            // Indicate that the app has been opened
            app.classList.add("opened-app");

            toggleWindow(app.id.split('-')[0]);  // toggle the window of the app context
        });
    }
}
