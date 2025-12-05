/* --- GLOBALS --- */
id = 0


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

    id += 1;
}

/**
 * Adds the windowHTML within the src JSON, to the forwarded element.
 * @param {json} src The json response from the server, via bodiedFetch
 * @param {HTMLDivElement} element The new window element that was created.
 */
function add_src(src, element) {
    element.innerHTML = src["windowHTML"];

    // - Assigns relevant event actions to the buttons within the title bar of the window.
    let window_actions = element.querySelector(".title-bar").getElementsByTagName("button");
    for (var i = 0; i < window_actions.length; i++) {
        let button_action = window_actions[i];

        switch (button_action.innerText) {
            case '×':
                button_action.addEventListener('click', (e) => closeWindow(e));
                break;
        }
    }

}


/**
 * Adds a preview for a new window.
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

    // -- Adjust headers of the preview container --
    // - Make the title the same as the context -
    preview_container.querySelector(".preview-title").innerText = ctx[0].toUpperCase() + ctx.substring(1);

    // -- Ensure the app label is hidden --
    document.getElementById("app-label").classList.add("hidden");  // classList is like a set, where even if you add the same class again, it won't repeat.

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

    if (window_group.childElementCount >= 1) {  // if there's only one window for this group
        window_group.firstChild.classList.toggle("hidden");

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
    // Get the window holding the button
    let app_window = event.target.parentNode.parentNode;
    console.log(app_window);

    // Get the previews list of the app corresponding to the window
    let split_win_id = app_window.id.split('-');
    let app_previews = document.getElementById(`${split_win_id[0]}-app`).querySelector(".app-previews");
    console.log(app_previews);

    // Remove the preview that matches the id of the window
    app_previews.removeChild(document.getElementById(`${split_win_id[0]}-preview-${split_win_id[split_win_id.length - 1]}`));

    // Get the group that this window is in and remove the window from it.
    app_window.parentNode.removeChild(app_window);
}


/**
 * Removes a preview and its associated window from the document. This is essentially does the same as closeWindow but in reverse order.
 * @param {Event} event The click event on the close-button class within the preview actions bar.
 */
function closePreview(event) {
    console.log(event.target)
    // Get the preview holding this button's action
    let preview = event.target.parentNode.parentNode.parentNode;

    // Get the group related to the context of the preview.
    let split_preview_id = preview.id.split('-');
    let ctx_group = document.getElementById(`${split_preview_id[0]}-group`);

    // Remove the window related to the preview.
    ctx_group.removeChild(document.getElementById(`${split_preview_id[0]}-window-${split_preview_id[split_preview_id.length - 1]}`));

    // Remove the preview
    preview.parentNode.removeChild(preview);
}