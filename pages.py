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
    """Gets weather information based on the user's current location."""

    req_data = request.get_json() or {}

    # Default to Celsius if the frontend doesn't send anything
    temp_kind = (req_data.get("temp_kind") or "C").upper()

        # --- NEW: Get location using ipinfo.io (no rate limits) ---
    try:
        location_info = requests.get("https://ipinfo.io/json", timeout=5).json()
        print("Location info:", location_info)
    except Exception as e:
        print("Error getting location:", e)
        return jsonify({
            "city": "?",
            "region": "?",
            "temperature": "?",
            "temp_kind": temp_kind,
            "kind": "?"
        })

    city = location_info.get("city")
    region = location_info.get("region")
    country = location_info.get("country")

    if not city:
        return jsonify({
            "city": "?",
            "region": "?",
            "temperature": "?",
            "temp_kind": temp_kind,
            "kind": "?"
        })


    # 3) Choose unit system for python_weather
    unit = pw.METRIC
    if temp_kind == "F":
        unit = pw.IMPERIAL

    # 4) Fetch weather for the detected city
    try:
        async with pw.Client(unit=unit) as client:
            weather = await client.get(location_info["city"])
    except Exception as e:
        print("Weather API error:", e)
        return jsonify({
            "city": city,
            "region": country,
            "temperature": "?",
            "temp_kind": temp_kind,
            "kind": "?"
        })

    print(weather.kind, type(weather.kind), weather.kind.name, weather.kind.value)

    # Use city + country_name so it matches "City, Country"
    return jsonify({
        "city": location_info["city"],
        "region": country,
        "temperature": weather.temperature,
        "temp_kind": temp_kind,
        "kind": weather.kind.name
    })
