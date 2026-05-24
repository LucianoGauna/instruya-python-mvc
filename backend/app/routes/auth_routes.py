from flask import Blueprint

from app.controllers.auth_controller import AuthController

auth_routes = Blueprint("auth_routes", __name__)


@auth_routes.post("/login")
def login():
    return AuthController.login()