/**
 * Once a window is created this function adds the relevant information into its body.
 * @param {string} ctx The context of the created window.
 * @param {HTMLDivElement} win_group The group containing the currently created window..
 */
function initWindowBody(ctx, win_group) {
    // Get the currently focussed window / the one that was just created.
    let focussed_win = win_group.querySelector(".focussed-window");

    // Depending on the context, give it an appropriate body or event listener.
    switch(ctx) {
        case "email":
            // attach all the relevant emails into the body of the current
            for (var i = 0; i < active_emails.length; i++) {
                addMail(focussed_win, active_emails[i]);
            }

            break;
    }
}

