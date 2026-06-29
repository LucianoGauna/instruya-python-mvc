from flask import g, request

from app.models.docente_model import TIPOS_CALIFICACION
from app.services.docente_service import DocenteService


class DocenteController:
    @staticmethod
    def get_dashboard_resumen():
        try:
            docente_id = g.user["id"]
            resumen = DocenteService.get_dashboard_resumen(docente_id)

            if resumen is None:
                return {
                    "ok": False,
                    "message": "Docente no encontrado",
                }, 404

            return {
                "ok": True,
                "resumen": resumen,
            }, 200

        except Exception as error:
            print("Error en get_dashboard_resumen_docente:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def get_mis_materias():
        try:
            docente_id = g.user["id"]
            materias = DocenteService.get_mis_materias(docente_id)

            return {
                "ok": True,
                "materias": materias,
            }, 200

        except Exception as error:
            print("Error en get_mis_materias_docente:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def get_inscriptos_by_materia(materia_id):
        try:
            docente_id = g.user["id"]

            inscriptos = DocenteService.get_inscriptos_by_materia(
                docente_id,
                materia_id,
            )

            if inscriptos is None:
                return {
                    "ok": False,
                    "message": "Materia no encontrada",
                }, 404

            return {
                "ok": True,
                "inscriptos": inscriptos,
            }, 200

        except Exception as error:
            print("Error en get_inscriptos_by_materia:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def create_calificacion(materia_id):
        data = request.get_json() or {}

        alumno_id = data.get("alumno_id")
        tipo = data.get("tipo")
        fecha = data.get("fecha")
        nota = data.get("nota")
        descripcion = data.get("descripcion")

        try:
            alumno_id = int(alumno_id)
        except (TypeError, ValueError):
            return {
                "ok": False,
                "message": "alumno_id inválido",
            }, 400

        if (
            not isinstance(tipo, str)
            or not isinstance(fecha, str)
            or not isinstance(nota, str)
        ):
            return {
                "ok": False,
                "message": "Datos inválidos",
            }, 400

        if tipo not in TIPOS_CALIFICACION:
            return {
                "ok": False,
                "message": "tipo inválido",
            }, 400

        try:
            docente_id = g.user["id"]

            result = DocenteService.create_calificacion(
                docente_id,
                materia_id,
                alumno_id,
                tipo,
                fecha,
                nota,
                descripcion.strip() if isinstance(descripcion, str) else None,
            )

            if result == "MATERIA_NOT_FOUND":
                return {
                    "ok": False,
                    "message": "Materia no encontrada",
                }, 404

            if result == "ALUMNO_NO_INSCRIPTO":
                return {
                    "ok": False,
                    "message": "Alumno no inscripto",
                }, 400

            if result == "FINAL_YA_EXISTE":
                return {
                    "ok": False,
                    "message": "Ya existe una calificación FINAL para ese alumno en la materia",
                }, 409

            if result == "NOTA_MATERIA_YA_EXISTE":
                return {
                    "ok": False,
                    "message": "Ya existe una calificación NOTA_MATERIA para ese alumno en la materia",
                }, 409

            return {
                "ok": True,
                "calificacion": result,
            }, 201

        except ValueError:
            return {
                "ok": False,
                "message": "Datos inválidos",
            }, 400

        except Exception as error:
            print("Error en create_calificacion:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def update_calificacion(calificacion_id):
        data = request.get_json() or {}

        tipo = data.get("tipo")
        fecha = data.get("fecha")
        nota = data.get("nota")
        descripcion = data.get("descripcion")

        if (
            not isinstance(tipo, str)
            or not isinstance(fecha, str)
            or not isinstance(nota, str)
        ):
            return {
                "ok": False,
                "message": "Datos inválidos",
            }, 400

        if tipo not in TIPOS_CALIFICACION:
            return {
                "ok": False,
                "message": "tipo inválido",
            }, 400

        try:
            docente_id = g.user["id"]

            result = DocenteService.update_calificacion(
                docente_id,
                calificacion_id,
                tipo,
                fecha,
                nota,
                descripcion.strip() if isinstance(descripcion, str) else None,
            )

            if result == "CALIFICACION_NOT_FOUND":
                return {
                    "ok": False,
                    "message": "Calificación no encontrada",
                }, 404

            return {
                "ok": True,
            }, 200

        except ValueError:
            return {
                "ok": False,
                "message": "Datos inválidos",
            }, 400

        except Exception as error:
            print("Error en update_calificacion:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500