/* --- Globals --- */
var unread_emails = 0;


/**
 * Gets the relevant topic for an email, organises the retrieved data into a preview and body, and updates all email windows.
 * @param {string} topic The topic, that the email will be containing.
 */
function sendMail(topic) {
    let email_preview = document.createElement("div");
    let email_body = document.createElement("div");

    await bodiedFetch(
        "/get-email",
        {"topic": topic},
        addDetails
    );



    unread_emails += 1;
}


/**
 * Adds the details retrieved from the backend into the main email body, while summarising for the email preview.
 * @param {JSON} details The response containing email information
 */
function addDetails(details) {

}
