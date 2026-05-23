from flask import Flask
from flask_cors import CORS
from app.routes.health_routes import health_routes


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(health_routes)

    return app