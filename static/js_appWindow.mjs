/* --- Window Factory --- */

/**
 * Create a window with a given context to it.
 * @param {string} ctx The context for this new window.
 * @param {HTMLDivElement} window_group The parent that should child this new window object.
 */
async function createWindow(ctx, window_group) {
    let new_window = document.createElement("div");

    switch (ctx) {
        case 'email':
            // send a fetch for the window data with the given context, and then add that data to the new window.
            await bodiedFetch(
                "/get-window",
                {"ctx": ctx},
                add_src, new_window
            );

            break;
    }

    new_window.classList = "app-window hidden";
    addFunctionalities(new_window);
    window_group.appendChild(new_window);
}

/**
 * Adds the windowHTML within the src JSON, to the forwarded element.
 * @param {json} src The json response from the server, via bodiedFetch
 * @param {HTMLDivElement} element The new window element that was created.
 */
function add_src(src, element) {
    element.innerHTML = src["windowHTML"];
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