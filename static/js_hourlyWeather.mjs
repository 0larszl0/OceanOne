// setInterval(async () => {
//     await bodiedFetch();
// }, 1000 * 60 * 60);


async function updateWeather() {
    await bodiedFetch(
        "/get-weather",
        {},
        x
    );
}

function x(response){
    console.log(response);
}

