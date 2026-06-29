from flask import Blueprint

from app.controllers.superadmin_controller import SuperadminController
from app.middlewares.auth_middleware import auth_required
from app.middlewares.role_middleware import require_role


superadmin_routes = Blueprint("superadmin_routes", __name__)


@superadmin_routes.get("/instituciones")
@auth_required
@require_role(["SUPERADMIN"])
def get_instituciones():
    return SuperadminController.get_instituciones()


@superadmin_routes.post("/instituciones")
@auth_required
@require_role(["SUPERADMIN"])
def create_institucion():
    return SuperadminController.create_institucion()


@superadmin_routes.patch("/instituciones/<int:id>")
@auth_required
@require_role(["SUPERADMIN"])
def update_institucion(id):
    return SuperadminController.update_institucion(id)


@superadmin_routes.patch("/instituciones/<int:id>/activar")
@auth_required
@require_role(["SUPERADMIN"])
def activar_institucion(id):
    return SuperadminController.activar_institucion(id)


@superadmin_routes.patch("/instituciones/<int:id>/desactivar")
@auth_required
@require_role(["SUPERADMIN"])
def desactivar_institucion(id):
    return SuperadminController.desactivar_institucion(id)