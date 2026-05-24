from flask import Blueprint, g

from app.controllers.health_controller import HealthController
from app.middlewares.auth_middleware import auth_required
from app.middlewares.role_middleware import require_role

health_routes = Blueprint("health_routes", __name__)


@health_routes.get("/health")
def health():
    return HealthController.health()

@health_routes.get("/health/db")
def database_health():
    return HealthController.database_health()

@health_routes.get("/health/auth")
@auth_required
def auth_health():
    return {
        "ok": True,
        "message": "Token válido",
        "user": g.user,
    }, 200

@health_routes.get("/health/admin")
@auth_required
@require_role(["ADMIN"])
def admin_health():
    return {
        "ok": True,
        "message": "Acceso permitido para ADMIN",
        "user": g.user,
    }, 200