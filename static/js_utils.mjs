/**
 * A universal fetching function which goes to an internal link with a given body, and executes a function on the expected response.
 * @param {string} target_dest A string of the internal function to go to.
 * @param body A dictionary object containing relevant data to send to the target destination.
 * @param func A function to execute once a response has been received.
 * @param func_args Additional arguments that were required by the function, apart from the response.
 * @returns null
 */
async function bodiedFetch(target_dest, body = {}, func = function(x){}, ...func_args) {
    await fetch(
        target_dest,
        {
            method: "POST",
            headers: {  // details that the payload is in a JSON format
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify(body)
        }
    ).then(function(response) {  // catches the response
        return response.json();  // returns the json object, once the Promise of the response has been fulfilled.

    }).then(function(response) {  // pushes the json object to whatever function was queued with any arguments.
        func(response, ...func_args);

    }).catch(function(error) {
        console.log(error);

    })
}