from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db
from app.routes.health_routes import health_routes
from app.routes.auth_routes import auth_routes
from app.routes.admin_routes import admin_routes
from app.routes.superadmin_routes import superadmin_routes
from app.routes.alumno_routes import alumno_routes
from app.routes.docente_routes import docente_routes


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)

    app.register_blueprint(health_routes)
    app.register_blueprint(auth_routes, url_prefix="/auth")
    app.register_blueprint(admin_routes, url_prefix="/admin")
    app.register_blueprint(superadmin_routes, url_prefix="/superadmin")
    app.register_blueprint(alumno_routes, url_prefix="/alumno")
    app.register_blueprint(docente_routes, url_prefix="/docente")

    return app