from flask import Blueprint, render_template, request, jsonify, Response
import python_weather as pw
import requests
from python_weather import RequestError

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

    req_data = request.get_json()
    response_template = {"location": "", "temperature-val": "", "temperature-unit": "", "temperature-sym": ""}

    # -- Get location using ipinfo.io (no rate limits)
    try:
        location_response = requests.get("https://ipinfo.io/json", timeout=5)
    except Exception as e:
        print("Error getting location:", e)
        return jsonify(response_template)

    location_json = location_response.json()

    # print(location_info)

    # -- Choose unit system for python_weather
    unit = pw.METRIC
    if req_data["temp_kind"].upper() == "F":
        unit = pw.IMPERIAL

    # -- Fetch weather for the detected city
    try:
        async with pw.Client(unit=unit) as client:
            weather = await client.get(location_json["city"])
    except RequestError as e:
        print("Weather API error:", e)
        return jsonify(response_template)

    except ConnectionResetError as cre:
        print(f"The connection was reset by the API service. For more info look at:\n{cre}")
        return jsonify(response_template)

    # print(weather.kind, type(weather.kind), weather.kind.name, weather.kind.value)

    response_template["location"] = f"{location_json['city']}, {location_json['country']}"
    response_template["temperature-val"] = str(weather.temperature)
    response_template["temperature-sym"] = '°'
    response_template["temperature-unit"] = req_data["temp_kind"]

    return jsonify(response_template)


@BP.route("/get-email", methods=["POST"])
def get_email() -> Response:
    """Get the relevant details and structure for an email."""
    req_data = request.get_json()
    response = {}

    match req_data["topic"]:
        case "ocean1-intro":
            response = {
                "sender": "0larszl0",
                "sender-email": "HaddmfNyiBvshsl@ocean.one",
                "subject": "Welcome",
                "message": render_template("emails/content/ocean1_intro.html")
            }

        case "phishing-intro":
            response = {
                "sender": "0larszl0",
                "sender-email": "HaddmfNyiBvshsl@ocean.one",
                "subject": "Lesson #1: Phishing",
                "message": render_template("emails/content/phishing_intro.html")
            }

        case "phishing-test":
            response = {
                "sender": "cnggwailw",
                "sender-email": "cnggwailw@0cean.one",
                "subject": "Unauthorised Account Access, 04:32",
                "message": render_template("emails/content/phishing_test.html")
            }

    response["body-structure"] = render_template("emails/email_body.html")
    response["preview-structure"] = render_template("emails/email_preview.html")

    return jsonify(response)
