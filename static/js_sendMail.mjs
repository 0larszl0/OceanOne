/* --- Globals --- */
var active_emails = []  // a list containing different topics of an email.


/**
 * Instead of directly adding emails to active_emails, this function is used for this whilst updating any active email
 * windows.
 * @param {string} topic The topic to add to the emails.
 */
function AddToMailList(topic) {
    active_emails.push(topic);

    let email_windows = document.getElementById("email-group");
    for (var i = 0; i < email_windows.childElementCount; i++) {
        addMail(email_windows.childNodes[i], topic);
    }
}


/**
 * Gets the relevant topic for an email, organises the retrieved data into a preview and body, and updates all email windows.
 * @param {HTMLDivElement} win The email window that will be filled with mail.
 * @param {string} topic The topic, that the email will be containing.
 */
async function addMail(win, topic) {
    let email_preview = document.createElement("div");
    let email_body = document.createElement("div");

    await bodiedFetch(
        "/get-email",
        {"topic": topic},
        addDetails, email_preview, email_body
    );

    email_preview.classList = "email-preview unread";
    email_body.classList = "email-body hidden";

    // - Add the email preview to the top of the list of emails -
    let win_email_list = win.querySelector(".email-list");
    win_email_list.insertBefore(email_preview, win_email_list.childNodes[0]);

    // - Add the email body to the top of the list of email bodies -
    let win_body_list = win.querySelector(".email-view");
    win_body_list.insertBefore(email_body, win_body_list.childNodes[0]);

    // Add eventlisteners to both preview and button within the body, that toggles between email body and email list.
    email_preview.addEventListener("click", function() {toggleEmailView(email_preview, email_body); email_preview.classList.remove("unread");} );
    email_body.querySelector(".view-email-list").addEventListener("click", function() {toggleEmailView(email_preview, email_body)});


    // check whether any group or whether the selected window is selected. If they're not, add a notification icon on the email app.

}


/**
 * Adds the details retrieved from the backend into the main email body, while summarising for the email preview.
 * @param {JSON} details The response containing email information
 * @param {HTMLDivElement} email_preview The div element associated with the email preview.
 * @param {HTMLDivElement} email_body The div element associated with the email body.
 */
function addDetails(details, email_preview, email_body) {
    // Set the structure of the email body.
    email_body.innerHTML = details["body-structure"];

    // Add the details into the related divs within the body.
    email_body.querySelector(".sender").innerText = details["sender"];
    email_body.querySelector(".senders-email").innerText = `<${details["sender-email"]}>`;
    email_body.querySelector(".email-title").innerText = details["subject"];
    email_body.querySelector(".email-content").innerHTML = details["message"];

    // Set the structure of the email preview.
    email_preview.innerHTML = details["preview-structure"];

    // Add the details into the related divs within the preview.
    email_preview.querySelector(".email-from").innerText = details["sender"];
    email_preview.querySelector(".email-subject").innerText = details["subject"];
    email_preview.querySelector(".email-message").innerText = ` - ${details["message"].replaceAll("<p>", '').replaceAll("</p>", '').replaceAll('\n', '')}`;
}


/**
 * Show the visibility and access available between the email body and the email list.
 * @param {HTMLDivElement} email_preview The email that was clicked.
 * @param {HTMLDivElement} email_body The div containing the contents of the email.
 */
function toggleEmailView(email_preview, email_body) {
    // Toggle the visibility and restrictions for the email list
    email_preview.parentNode.classList.toggle("hidden");
    email_preview.parentNode.classList.toggle("suspend-pointer");

    // Toggle the visibility and restrictions for the email body.
    email_body.classList.toggle("hidden");
    email_body.parentNode.classList.toggle("suspend-pointer");
}

