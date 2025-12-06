/* --- GLOBALS --- */
var id = 0
var active_windows = {}


/* --- Window Factory --- */

/**
 * Create a window with a given context to it.
 * @param {string} ctx The context for this new window.
 * @param {HTMLDivElement} window_group The parent that should child this new window object.
 */
async function createWindow(ctx, window_group) {
    let new_window = document.createElement("div");

    // send a fetch for the window data with the given context, and then add that data to the new window.
    switch (ctx) {
        case 'email':
            await bodiedFetch(
                "/get-window",
                {"ctx": ctx},
                add_src, new_window
            );

            break;
    }

    // Add any classes and functionalities before adding the element into the group (and also the screen)
    new_window.classList.add("app-window");
    new_window.id = `${window_group.id.split('-')[0]}-window-${id}`;
    addFunctionalities(new_window);
    window_group.appendChild(new_window);

    await bodiedFetch(
        "/get-preview-template",
        {},
        add_preview, ctx, new_window
    )

    // Add window to active windows list.
    if (active_windows[ctx] == null) { active_windows[ctx] = []; }
    active_windows[ctx].push(new_window)

    id += 1;
}

/**
 * Adds the windowHTML within the src JSON, to the forwarded element.
 * @param {json} src The json response from the server, via bodiedFetch
 * @param {HTMLDivElement} win The new window element that was created.
 */
function add_src(src, win) {
    win.innerHTML = src["windowHTML"];

    // - Assigns relevant event actions to the buttons within the title bar of the window.
    let window_actions = win.querySelector(".title-bar").getElementsByTagName("button");
    console.log(window_actions);
    for (var i = 0; i < window_actions.length; i++) {
        let button_action = window_actions[i];

        switch (button_action.innerText) {
            case '_':
                button_action.addEventListener("click", (_) => win.classList.toggle("hidden"));
                break;

            case '×':
                button_action.addEventListener('click', (e) => closeWindow(e));
                break;
        }
    }

}


/**
 * Adds a preview for a new window.
 * @param {JSON} response_of_temp The response containing the template HTML
 * @param {string} ctx The current context for the passed window.
 * @param {HTMLDivElement} win The new window
 */
function add_preview(response_of_temp, ctx, win) {
    // -- Add the template of the preview into a container --
    // create a div to contain the preview template
    let preview_container = document.createElement("div");

    // add the template to the div and assign any classes too.
    preview_container.innerHTML = response_of_temp["previewHTML"];
    preview_container.classList.add("preview-container");
    preview_container.id = `${ctx}-preview-${id}`

    // Add an event listener to the buttons inside the preview.
    let preview_actions = preview_container.querySelector(".preview-actions");
    for (var i = 0; i < preview_actions.childElementCount; i++) {
        current_child = preview_actions.children[i];

        switch (current_child.innerText) {
            case '+':
                current_child.addEventListener("click", async function() {await createWindow(ctx, win.parentNode);})
                break;

            case 'x':
                current_child.addEventListener('click', (e) => closePreview(e));
                break;
        }
    }

    // -- Clone the window we are creating to show a preview of it --
    let win_clone = win.cloneNode(true);
    win_clone.classList = "";  // remove any classes that were attached to the created window.

    // Set some essential styles.
    let win_style = getComputedStyle(win);  // Get the styles contained in the new window to use similar values.

    win_clone.style.cssText += `
        position: relative;
        transform: scale(0.85, 0.9);
        height: 100%;
        background-color: ${win_style.backgroundColor};
    `;

    let app_previews = document.getElementById(`${ctx}-app`).querySelector(".app-previews");
    let preview_body = preview_container.querySelector(".preview-body");

    preview_body.appendChild(win_clone);  // add the cloned window to the body of the preview container

    // Add an event listener to the preview body that toggles its corresponding window.
    preview_body.addEventListener("click", (_) => win.classList.toggle("hidden"));

    // -- Adjust headers of the preview container --
    // - Make the title the same as the context -
    preview_container.querySelector(".preview-title").innerText = ctx[0].toUpperCase() + ctx.substring(1);

    // -- Ensure the app label is hidden --
    document.getElementById(`${ctx}-label`).classList.add("hidden");  // classList is like a set, where even if you add the same class again, it won't repeat.

    // add the preview container into the app-previews container for this given context.
    app_previews.appendChild(preview_container);
}


/* --- Window Visibility --- */

/**
 * Toggles a selected window, and creates a group for a particular set of windows under a particular context.
 * @param {string} ctx The context for a group and window.
 */
async function toggleWindow(ctx) {
    let window_container = document.getElementById("window-container");
    let window_group = document.getElementById(`${ctx}-group`);

    if (window_group == null) {  // if there is no window group for this context
        // then create one-
        window_group = document.createElement("div");
        window_group.id = `${ctx}-group`;
        window_group.classList.add("window-group");

        window_container.appendChild(window_group);  // append the new group into the window container
        await createWindow(ctx, window_group);  // wait till the new window has been created before continuing.

        return null;
    }

    if (window_group.childElementCount >= 1) {  // when there's more than one child in the group of windows
        // toggle the window that's at the front of the active windows list for that context.
        active_windows[ctx][0].classList.toggle("hidden");

        return null;
    }

    // When a group exists but it's empty
    await createWindow(ctx, window_group);
}


/* Window Functionality */

/**
 * Adds events that induce:
 *      - Drag
 *      - Resizing
 * functionalities to a given window.
 * @param {HTMLDivElement} win The window to add event functionality for.
 */
function addFunctionalities(win) {
    const titleBar = win.querySelector(".title-bar");
    const resizeHandle = win.querySelector(".resize-handle");

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    titleBar.addEventListener("mousedown", (e) => {
        isDragging = true;
        const rect = win.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;

        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", stopDrag);
    });

    function onDrag(e) {
        if (!isDragging) return;
        win.style.left = (e.clientX - dragOffsetX) + "px";
        win.style.top  = (e.clientY - dragOffsetY) + "px";
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener("mousemove", onDrag);
        document.removeEventListener("mouseup", stopDrag);
    }

    let isResizing = false;
    let startWidth, startHeight, startX, startY;

    resizeHandle.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        isResizing = true;

        const rect = win.getBoundingClientRect();
        startWidth  = rect.width;
        startHeight = rect.height;
        startX = e.clientX;
        startY = e.clientY;

        document.addEventListener("mousemove", onResize);
        document.addEventListener("mouseup", stopResize);
    });

    function onResize(e) {
        if (!isResizing) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const newWidth  = Math.max(250, startWidth  + dx);
        const newHeight = Math.max(150, startHeight + dy);

        win.style.width  = newWidth  + "px";
        win.style.height = newHeight + "px";
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener("mousemove", onResize);
        document.removeEventListener("mouseup", stopResize);
    }
}


/**
 * Removes a window and its preview from the document.
 * @param {Event} event The click event on the close-btn class within the title bar of a window.
 */
function closeWindow(event) {
    console.log(event.target)
    // Get the window holding the button and the group its contained in.
    let app_window = event.target.parentNode.parentNode.parentNode;
    let app_group = app_window.parentNode;

    // Get the previews list of the app corresponding to the window
    let split_win_id = app_window.id.split('-');
    let app_previews = document.getElementById(`${split_win_id[0]}-app`).querySelector(".app-previews");

    // Remove the preview that matches the id of the window
    app_previews.removeChild(document.getElementById(`${split_win_id[0]}-preview-${split_win_id[split_win_id.length - 1]}`));

    // Remove app_window from active_windows
    active_windows[split_win_id[0]].splice(active_windows[split_win_id[0]].indexOf(app_window), 1);

    // Get the group that this window is in and remove the window from it.
    app_group.removeChild(app_window);

    // Check whether the app_group has no children left
    if (app_group.childElementCount == 0) {
        // toggle the app previews to be hidden
        app_previews.setAttribute("style", "visibility: hidden");

        // remove the hidden state from the app label.
        document.getElementById(`${split_win_id[0]}-label`).classList.remove("hidden");
    }
}


/**
 * When the close preview button is clicked, search for the close window action at the preview's corresponding button, and activate CloseWindow()
 * @param {Event} event An event containing details of what triggered this function call.
 */
function closePreview(event) {
    // Split the id of the preview to easily find meaningful data within.
    let preview_id_split = event.target.parentNode.parentNode.parentNode.id.split('-');

    // Get the preview's corresponding window, then click its close button.
    document.getElementById(`${preview_id_split[0]}-window-${preview_id_split[preview_id_split.length - 1]}`).querySelector(".close-btn").click();
}