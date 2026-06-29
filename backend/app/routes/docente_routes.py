from flask import Blueprint

from app.controllers.docente_controller import DocenteController
from app.middlewares.auth_middleware import auth_required
from app.middlewares.role_middleware import require_role


docente_routes = Blueprint("docente_routes", __name__)


@docente_routes.get("/dashboard/resumen")
@auth_required
@require_role(["DOCENTE"])
def get_dashboard_resumen():
    return DocenteController.get_dashboard_resumen()


@docente_routes.get("/mis-materias")
@auth_required
@require_role(["DOCENTE"])
def get_mis_materias():
    return DocenteController.get_mis_materias()


@docente_routes.get("/materias/<int:materia_id>/inscriptos")
@auth_required
@require_role(["DOCENTE"])
def get_inscriptos_by_materia(materia_id):
    return DocenteController.get_inscriptos_by_materia(materia_id)


@docente_routes.post("/materias/<int:materia_id>/calificaciones")
@auth_required
@require_role(["DOCENTE"])
def create_calificacion(materia_id):
    return DocenteController.create_calificacion(materia_id)


@docente_routes.patch("/calificaciones/<int:calificacion_id>")
@auth_required
@require_role(["DOCENTE"])
def update_calificacion(calificacion_id):
    return DocenteController.update_calificacion(calificacion_id)