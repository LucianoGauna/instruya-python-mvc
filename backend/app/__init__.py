from flask import Flask
from flask_cors import CORS

from app.routes.health_routes import health_routes
from app.routes.auth_routes import auth_routes


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(health_routes)
    app.register_blueprint(auth_routes, url_prefix="/auth")

    return app