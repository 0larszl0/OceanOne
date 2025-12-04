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
    new_window.id = `${window_group.id.split('-')[0]}-window-${window_group.childElementCount}`
    addFunctionalities(new_window);
    window_group.appendChild(new_window);

    await bodiedFetch(
        "/get-preview-template",
        {},
        add_preview, ctx, new_window
    )

    new_window.classList.add("hidden");  // adds the hidden class at the end, because the clone in the preview may need to use the display attribute
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
    let split_win_id = win.id.split('-')
    preview_container.id = `${ctx}-preview-${split_win_id[split_win_id.length - 1]}`  // '[ctx]-preview-[windowID]'

    // Add an event listener to the buttons inside the preview.
    let preview_actions = preview_container.querySelector(".preview-actions");
    for (var i = 0; i < preview_actions.childElementCount; i++) {
        current_child = preview_actions.children[i];

        switch (current_child.innerText) {
            case 'x':
                current_child.addEventListener('click', (e) => closePreview(e));
                break;
        }
    }

    // -- Clone the window we are creating to show a preview of it --
    let win_clone = win.cloneNode(true);

    win_clone.classList = "";  // remove any classes that were attached to the created window.
    let win_style = getComputedStyle(win);  // Get the styles contained in the new window to use similar values.

    // Set some essential styles that make it look identical to the window we are previewing
    win_clone.setAttribute("style", `
        display: ${win_style.display};
        flex-flow: ${win_style.flexFlow};

        width: ${win_style.width};
        height: ${win_style.height};
        background-color: ${win_style.backgroundColor};
    `);

    let app_previews = document.getElementById(`${ctx}-app`).querySelector(".app-previews");
    let preview_body = preview_container.querySelector(".preview-body");

    preview_body.appendChild(win_clone);  // add the cloned window to the body of the preview container

    // -- Adjust headers of the preview container --
    // - Make the title the same as the context -
    preview_container.querySelector(".preview-title").innerText = capitalise(ctx);

    // -- Ensure the app label is hidden --
    document.getElementById("app-label").classList.add("hidden");  // classList is like a set, where even if you add the same class again, it won't repeat.

    // add the preview container into the app-previews container for this given context.
    app_previews.appendChild(preview_container);

    // Once everything has now been added to the screen in which the css values are now set up
    fitContainer(preview_body, win_clone);  // fit the new window inside the preview body
}


/**
 * Scales an element's dimensions to match the containers, while also retaining position.
 * @param {HTMLDivElement} container The container the element will fit to
 * @param {HTMLDivElement} element The element to fit in the container
 */
function fitContainer(container, element) {
    let container_style = getComputedStyle(container);
    let element_style = getComputedStyle(element);

    let el_width = stripUnit(element_style.width);
    let el_height = stripUnit(element_style.height);
    let con_width = stripUnit(container_style.width);
    let con_height = stripUnit(container_style.height);

    element.style.cssText += `
        position: relative;
        transform: scale(${(con_width / el_width) * 0.85}, ${(con_height / el_height) * 0.9});
        left: ${(con_width - el_width) / 2}px;
        top: ${(con_height - el_height) / 2}px;
    `;
}


/**
 * Strips any unit off of a given style value, and parses the result to a float.
 * i.e. '11.1px' becomes 11.1 <float>
 * @param {string} value The value to strip and convert.
 */
function stripUnit(value) {
    return parseFloat(value.substring(0, value.length - 2));
}


/**
 * Capitalises some text, i.e. email -> Email.
 * @param {string} text The text to capitalise.
 */
function capitalise(text) {
    return text[0].toUpperCase() + text.substring(1);
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
    }

    if (window_group.childElementCount == 1) {  // if there's only one window for this group
        // toggle the visibility of that window
        window_group.firstChild.classList.toggle("hidden");
    }
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
 * @param {string} ctx The context of the window/ the type of window that is being removed.
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


function closePreview(event) {
    console.log(event)
}