from flask import Blueprint

from app.controllers.admin_controller import AdminController
from app.middlewares.auth_middleware import auth_required
from app.middlewares.role_middleware import require_role

admin_routes = Blueprint("admin_routes", __name__)

@admin_routes.get("/dashboard/resumen")
@auth_required
@require_role(["ADMIN"])
def get_dashboard_resumen():
    return AdminController.get_dashboard_resumen()


@admin_routes.get("/carreras")
@auth_required
@require_role(["ADMIN"])
def get_carreras():
    return AdminController.get_carreras()


@admin_routes.post("/carreras")
@auth_required
@require_role(["ADMIN"])
def create_carrera():
    return AdminController.create_carrera()


@admin_routes.get("/carreras/<int:id>")
@auth_required
@require_role(["ADMIN"])
def get_carrera_by_id(id):
    return AdminController.get_carrera_by_id(id)


@admin_routes.patch("/carreras/<int:id>")
@auth_required
@require_role(["ADMIN"])
def update_carrera(id):
    return AdminController.update_carrera(id)


@admin_routes.patch("/carreras/<int:id>/activar")
@auth_required
@require_role(["ADMIN"])
def activar_carrera(id):
    return AdminController.activar_carrera(id)


@admin_routes.patch("/carreras/<int:id>/desactivar")
@auth_required
@require_role(["ADMIN"])
def desactivar_carrera(id):
    return AdminController.desactivar_carrera(id)


@admin_routes.get("/docentes")
@auth_required
@require_role(["ADMIN"])
def get_docentes():
    return AdminController.get_docentes()


@admin_routes.get("/carreras/<int:id>/materias")
@auth_required
@require_role(["ADMIN"])
def get_materias_de_carrera(id):
    return AdminController.get_materias_de_carrera(id)


@admin_routes.post("/carreras/<int:id>/materias")
@auth_required
@require_role(["ADMIN"])
def create_materia_en_carrera(id):
    return AdminController.create_materia_en_carrera(id)


@admin_routes.patch("/materias/<int:id>/activar")
@auth_required
@require_role(["ADMIN"])
def activar_materia(id):
    return AdminController.activar_materia(id)


@admin_routes.patch("/materias/<int:id>/desactivar")
@auth_required
@require_role(["ADMIN"])
def desactivar_materia(id):
    return AdminController.desactivar_materia(id)


@admin_routes.patch("/materias/<int:id>")
@auth_required
@require_role(["ADMIN"])
def update_materia(id):
    return AdminController.update_materia(id)
