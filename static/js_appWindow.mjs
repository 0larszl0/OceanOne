/**
 * Create a window with a given context to it.
 * @param {string} ctx The context for this new window.
 */
async function createWindow(ctx) {
    let window_container = document.getElementById("window-container");
    let new_window = document.createElement("div");

    switch (ctx) {
        case 'email':
            // Check if a group for emails has been made and if so group the new window inside it, if not create that group and add the new window inside it.

            // send a fetch for the window data with the given context, and then add that data to the new window.
            await bodiedFetch(
                '/get-window',
                {"ctx": ctx},
                add_src, new_window
            );

            break;
    }

    window_container.appendChild(new_window);
}

/**
 * Adds the windowHTML within the src JSON, to the forwarded element.
 * @param {src} json The json response from the server, via bodiedFetch
 * @param {element} Element The new window element that was created.
 */
function add_src(src, element) {
    element.innerHTML = src["windowHTML"];
}

















function openEmailWindow() {
    const win = document.getElementById("email-window");
    if (win) win.classList.remove("hidden");
}

function closeEmailWindow() {
    const win = document.getElementById("email-window");
    if (win) win.classList.add("hidden");
}

function makeWindowDraggableAndResizable(win) {
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

window.addEventListener("DOMContentLoaded", () => {
    const emailWin = document.getElementById("email-window");
    if (emailWin) {
        makeWindowDraggableAndResizable(emailWin);
    }
});