from flask import Blueprint, render_template, request, jsonify
import python_weather as pw
from requests import *

BP = Blueprint("pages", __name__)


@BP.route("/")
def home() -> str:
    """Returns the template of the home page"""
    return render_template("pages/desktop.html")


@BP.route("/get-weather", methods=["POST"])
async def get_weather() -> Response:
    """Gets weather information based on the users current location."""

    # -- Get location based on user IP
    # - Get IP address using ipify API
    # https://www.ipify.org/
    ip = get("https://api64.ipify.org?format=json").json()["ip"]
    print(ip)

    # - Get location using apapi API
    # https://ipapi.co/api/
    location_info = get(f"https://ipapi.co/{ip}/json").json()
    print(location_info)

    if location_info.get("error"):
        return jsonify({"city": '?', "region": '?', "temperature": '?', "kind": '?'})

    # -- Get weather information
    async with pw.Client() as client:  # Defaults to metric system like degrees celsius
        # - Fetch forecast for nearest city
        weather = await client.get(location_info["city"])

    return jsonify({
        "city": location_info["city"],
        "region": location_info["region"],
        "temperature": weather.temperature,
        "kind": weather.kind  # THIS IS NOT SERIALIZABLE, SORT THIS OUT
    })
