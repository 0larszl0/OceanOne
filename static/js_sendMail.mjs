/* --- Globals --- */
var active_emails = {}  // a dictionary containing different emails referenced by their topic, as keys, and whether they have been read as values.


/**
 * Instead of directly adding emails to active_emails, this function is used for updating any active email windows.
 * @param {string} topic The topic to add to the emails.
 */
function addToMailList(topic) {
    if (topic in active_emails) { return null; }

    active_emails["topic-order"].push(topic);
    active_emails[topic] = false;

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

    // - Set appropriate class attributes to the preview and body elements -
    email_preview.classList.add("email-preview");
    if (!active_emails[topic]) {  // determines whether the email has been read before or not.
        email_preview.classList.add("unread");
    }

    email_body.classList = "email-body hidden";

    // - Mark the div elements with the topic used -
    email_preview.dataset.topic = topic;
    email_body.dataset.topic = topic;

    // - Add the email preview to the top of the list of emails -
    let win_email_list = win.querySelector(".email-list");
    win_email_list.insertBefore(email_preview, win_email_list.childNodes[0]);

    // - Add the email body to the top of the list of email bodies -
    let win_body_list = win.querySelector(".email-view");
    win_body_list.insertBefore(email_body, win_body_list.childNodes[0]);

    // - Add eventlisteners to preview -
    email_preview.addEventListener("click", function() {  // when the email preview is clicked
        toggleEmailView(email_preview, email_body);  // change views
        active_emails[topic] = true;  // Ensure the email of this topic is marked as being read.

        updateEmailReadStatus(win.parentNode, topic);  // update "read" status across other open windows.
    });

    // - Add eventlisteners to body of email -
    email_body.querySelector(".view-email-list").addEventListener("click", function() { toggleEmailView(email_preview, email_body); });

    // - Add any additional eventlisteners based on the topic. -
    addTopicListener(email_body, topic);
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
    email_preview.querySelector(".email-message").innerText = ` - ${details["message"].replaceAll(new RegExp("</.*>", 'g'), '').replaceAll(new RegExp("<.*>", 'g'), '').replaceAll('\n', '')}`;
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


/**
 * Updates the read status of an email, of a particular topic, in all windows in the current window group.
 * @param {HTMLDivElement} win_group The group the email window is in.
 * @param {string} topic The topic of the email to have its read status changed.
 */
function updateEmailReadStatus(win_group, topic) {
    for (var i = 0; i < win_group.childElementCount; i++) {  // for each window in the group of windows.
        // get the email preview that has the read topic.
        let selected_mail = win_group.childNodes[i].querySelector(`[data-topic='${topic}']`);

        if (!active_emails[topic]) {
            selected_mail.classList.add("unread");
            continue;
        }

        selected_mail.classList.remove("unread");
    }
}


/**
 * Based on the topic add a relevant event listener in the email body that will activate something.
 * @param {HTMLDivElement} email_body The body of the email.
 * @param {string} topic The
 */
function addTopicListener(email_body, topic) {
    switch (topic) {
        case "ocean1-intro":
            // if you click back out of the Welcome email AND it's the only email being shown, add the phishing-intro email to the list.
            email_body.querySelector(".view-email-list").addEventListener("click", function() { addToMailList("phishing-intro"); });

            break;

        case "phishing-intro":
            // if you click the back button out of the phishing intro email, add the phishing test as the next mail.
            email_body.querySelector(".view-email-list").addEventListener("click", function() { addToMailList("phishing-test"); });

            break;

        case "phishing-test":
            // if you click the link, you get the 'death' screen.
            email_body.querySelector("#verify-account").addEventListener("click", async function() { window.location.replace("/death-screen"); });

            // if you click the report button, you get to proceed to the next lesson.
            email_body.querySelector(".report-email").addEventListener("click", function() { addToMailList("congratulations"); } );

            break;
    }
}
