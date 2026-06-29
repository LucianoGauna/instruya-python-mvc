from flask import Blueprint

from app.controllers.alumno_controller import AlumnoController
from app.middlewares.auth_middleware import auth_required
from app.middlewares.role_middleware import require_role


alumno_routes = Blueprint("alumno_routes", __name__)


@alumno_routes.get("/dashboard/resumen")
@auth_required
@require_role(["ALUMNO"])
def get_dashboard_resumen():
    return AlumnoController.get_dashboard_resumen()


@alumno_routes.get("/mis-materias")
@auth_required
@require_role(["ALUMNO"])
def get_mis_materias():
    return AlumnoController.get_mis_materias()


@alumno_routes.get("/mis-calificaciones")
@auth_required
@require_role(["ALUMNO"])
def get_mis_calificaciones():
    return AlumnoController.get_mis_calificaciones()


@alumno_routes.get("/materias")
@auth_required
@require_role(["ALUMNO"])
def get_catalogo_materias():
    return AlumnoController.get_catalogo_materias()


@alumno_routes.post("/materias/<int:materia_id>/inscribirse")
@auth_required
@require_role(["ALUMNO"])
def solicitar_inscripcion(materia_id):
    return AlumnoController.solicitar_inscripcion(materia_id)