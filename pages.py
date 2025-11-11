from flask import Blueprint, render_template, request

BP = Blueprint("pages", __name__)


@BP.route("/")
def home() -> str:
    """Returns the template of the home page"""
    return render_template("pages/desktop.html")

