from flask import Flask
import pages


def create_app():
    """Initialises and returns the app"""
    app = Flask(__name__)

    app.register_blueprint(pages.BP)
    return app


if __name__ == "__main__":
    ocean_one = create_app()
    ocean_one.run("localhost", 8080, True)