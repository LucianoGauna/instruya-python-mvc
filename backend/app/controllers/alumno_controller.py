from flask import g

from app.services.alumno_service import AlumnoService


class AlumnoController:
    @staticmethod
    def get_dashboard_resumen():
        try:
            alumno_id = g.user["id"]
            resumen = AlumnoService.get_dashboard_resumen(alumno_id)

            if resumen is None:
                return {
                    "ok": False,
                    "message": "Alumno no encontrado",
                }, 404

            return {
                "ok": True,
                "resumen": resumen,
            }, 200

        except Exception as error:
            print("Error en get_dashboard_resumen_alumno:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def get_mis_materias():
        try:
            alumno_id = g.user["id"]
            materias = AlumnoService.get_mis_materias(alumno_id)

            return {
                "ok": True,
                "materias": materias,
            }, 200

        except Exception as error:
            print("Error en get_mis_materias:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def get_mis_calificaciones():
        try:
            alumno_id = g.user["id"]
            calificaciones = AlumnoService.get_mis_calificaciones(alumno_id)

            return {
                "ok": True,
                "calificaciones": calificaciones,
            }, 200

        except Exception as error:
            print("Error en get_mis_calificaciones:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def get_catalogo_materias():
        try:
            alumno_id = g.user["id"]
            result = AlumnoService.get_catalogo_materias(alumno_id)

            if result == "ALUMNO_SIN_CARRERA":
                return {
                    "ok": False,
                    "message": "Perfil de alumno no encontrado",
                }, 404

            return result, 200

        except Exception as error:
            print("Error en get_catalogo_materias:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def solicitar_inscripcion(materia_id):
        try:
            alumno_id = g.user["id"]

            result = AlumnoService.solicitar_inscripcion(
                alumno_id,
                materia_id,
            )

            if result == "ALUMNO_SIN_CARRERA":
                return {
                    "ok": False,
                    "message": "Perfil de alumno no encontrado",
                }, 404

            if result == "MATERIA_NOT_FOUND":
                return {
                    "ok": False,
                    "message": "Materia no encontrada",
                }, 404

            if result == "YA_INSCRIPTO":
                return {
                    "ok": False,
                    "message": "Ya tenés una inscripción para esa materia",
                }, 409

            return {
                "ok": True,
                "inscripcion": result,
            }, 201

        except Exception as error:
            print("Error en solicitar_inscripcion:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500