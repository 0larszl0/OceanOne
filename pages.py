from flask import Blueprint, render_template, request, jsonify, Response
import python_weather as pw
import requests

BP = Blueprint("pages", __name__)

@BP.route("/")
def home() -> str:
    """Returns the template of the home page"""
    return render_template("pages/desktop.html")


@BP.route('/get-window', methods=["POST"])
def get_window() -> Response:
    """Extract html data of a window of a given context."""

    ctx = request.get_json()["ctx"]

    # uses render_template so the Jinja is parsed properly beforehand.
    return jsonify({"windowHTML": render_template(f"windows/{ctx}_window.html")})


@BP.route("/get-preview-template", methods=["POST"])
def get_preview_template() -> Response:
    """Get the html containing the template for an app-preview."""
    return jsonify({"previewHTML": render_template("app_preview_base.html")})


@BP.route("/get-weather", methods=["POST"])
async def get_weather() -> Response:
    """Gets weather information based on the users current location."""

    req_data = request.get_json()

    # -- Get location based on user IP
    # - Get IP address using ipify API
    # https://www.ipify.org/
    ip = requests.get("https://api64.ipify.org?format=json").json()["ip"]
    print(ip)

    # - Get location using apapi API
    # https://ipapi.co/api/
    location_info = requests.get(f"https://ipapi.co/{ip}/json").json()
    print(location_info)

    if location_info.get("error"):
        return jsonify({"city": '?', "region": '?', "temperature": '?', "temperature-unit": '?', "kind": '?', "humidity": '?',
                        "feels-like": '?', "wind-speed": '?', "wind-direction": '?'})

    # -- Get weather information
    # - Adjust weather client unit type based on preference in js_hourlyWeather.mjs
    unit = pw.METRIC
    if req_data["temperature-unit"].upper() == 'F':
        unit = pw.IMPERIAL

    # - Get weather info based on city.
    async with pw.Client(unit=unit) as client:  # Defaults to metric system like degrees celsius
        # - Fetch forecast for nearest city
        weather = await client.get(location_info["city"])

    print(weather.kind, type(weather.kind), weather.kind.name, weather.kind.value)

    return jsonify({
        "city": location_info["city"],
        "region": location_info["region"],
        "temperature": weather.temperature,
        "temperature-unit": req_data["temperature-unit"],
        "kind": weather.kind.name,
        "humidity": weather.humidity,
        "feels-like": weather.feels_like,
        "wind-speed": weather.wind_speed,
        "wind-direction": weather.wind_direction.name
    })
