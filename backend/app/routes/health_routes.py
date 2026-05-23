from flask import Blueprint
from app.controllers.health_controller import HealthController

health_routes = Blueprint("health_routes", __name__)


@health_routes.get("/health")
def health():
    return HealthController.health()