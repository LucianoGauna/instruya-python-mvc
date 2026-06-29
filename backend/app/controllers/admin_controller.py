from sqlalchemy.exc import IntegrityError

from flask import request, g

from app.services.carrera_service import CarreraService
from app.services.docente_service import DocenteService
from app.services.materia_service import MateriaService


class AdminController:
    @staticmethod
    def get_carreras():
        try:
            admin_user_id = g.user["id"]
            carreras = CarreraService.get_carreras(admin_user_id)

            return {
                "ok": True,
                "carreras": carreras,
            }, 200

        except Exception as error:
            print("Error en get_carreras:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def create_carrera():
        try:
            admin_user_id = g.user["id"]
            data = request.get_json() or {}

            nombre = data.get("nombre")

            if not isinstance(nombre, str) or len(nombre.strip()) == 0:
                return {
                    "ok": False,
                    "message": "El nombre es requerido",
                }, 400

            nombre_limpio = nombre.strip()

            carrera = CarreraService.create_carrera(admin_user_id, nombre_limpio)

            return {
                "ok": True,
                "carrera": carrera,
            }, 201

        except IntegrityError as error:
            if getattr(error.orig, "errno", None) == 1062:
                return {
                    "ok": False,
                    "message": "Ya existe una carrera con ese nombre en la institución",
                }, 409

            print("Error en create_carrera:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

        except Exception as error:
            print("Error en create_carrera:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def get_carrera_by_id(id):
        carrera_id = int(id)

        try:
            admin_user_id = g.user["id"]
            carrera = CarreraService.get_carrera_by_id(admin_user_id, carrera_id)

            if carrera is None:
                return {
                    "ok": False,
                    "message": "Carrera no encontrada",
                }, 404

            return {
                "ok": True,
                "carrera": carrera,
            }, 200

        except Exception as error:
            print("Error en get_carrera_by_id:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def update_carrera(id):
        carrera_id = int(id)
        data = request.get_json() or {}

        nombre = data.get("nombre")

        if not isinstance(nombre, str) or len(nombre.strip()) == 0:
            return {
                "ok": False,
                "message": "El nombre es requerido",
            }, 400

        try:
            admin_user_id = g.user["id"]
            nombre_limpio = nombre.strip()

            carrera = CarreraService.update_carrera(
                admin_user_id,
                carrera_id,
                nombre_limpio,
            )

            if carrera is None:
                return {
                    "ok": False,
                    "message": "Carrera no encontrada",
                }, 404

            return {
                "ok": True,
                "carrera": carrera,
            }, 200

        except IntegrityError as error:
            if getattr(error.orig, "errno", None) == 1062:
                return {
                    "ok": False,
                    "message": "Ya existe una carrera con ese nombre en la institución",
                }, 409

            print("Error en update_carrera:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

        except Exception as error:
            print("Error en update_carrera:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def activar_carrera(id):
        carrera_id = int(id)

        try:
            admin_user_id = g.user["id"]
            updated = CarreraService.activar_carrera(admin_user_id, carrera_id)

            if not updated:
                return {
                    "ok": False,
                    "message": "Carrera no encontrada",
                }, 404

            return {
                "ok": True,
            }, 200

        except Exception as error:
            print("Error en activar_carrera:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def desactivar_carrera(id):
        carrera_id = int(id)

        try:
            admin_user_id = g.user["id"]
            updated = CarreraService.desactivar_carrera(admin_user_id, carrera_id)

            if not updated:
                return {
                    "ok": False,
                    "message": "Carrera no encontrada",
                }, 404

            return {
                "ok": True,
            }, 200

        except Exception as error:
            print("Error en desactivar_carrera:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500
        
    @staticmethod
    def get_docentes():
        try:
            admin_user_id = g.user["id"]
            docentes = DocenteService.get_docentes(admin_user_id)

            return {
                "ok": True,
                "docentes": docentes,
            }, 200

        except Exception as error:
            print("Error en get_docentes:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500
        
    @staticmethod
    def get_materias_de_carrera(id):
        carrera_id = int(id)

        try:
            admin_user_id = g.user["id"]

            materias = MateriaService.get_materias_de_carrera(
                admin_user_id,
                carrera_id,
            )

            if materias is None:
                return {
                    "ok": False,
                    "message": "Carrera no encontrada",
                }, 404

            return {
                "ok": True,
                "materias": materias,
            }, 200

        except Exception as error:
            print("Error en get_materias_de_carrera:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

        
    @staticmethod
    def create_materia_en_carrera(id):
        carrera_id = int(id)
        data = request.get_json() or {}

        nombre = data.get("nombre")
        docente_id = data.get("docente_id")

        if not isinstance(nombre, str) or len(nombre.strip()) == 0:
            return {
                "ok": False,
                "message": "El nombre es requerido",
            }, 400

        try:
            docente_id = int(docente_id)
        except (TypeError, ValueError):
            return {
                "ok": False,
                "message": "docente_id inválido",
            }, 400

        try:
            admin_user_id = g.user["id"]

            result = MateriaService.create_materia_en_carrera(
                admin_user_id,
                carrera_id,
                nombre.strip(),
                docente_id,
            )

            if result == "CARRERA_NOT_FOUND":
                return {
                    "ok": False,
                    "message": "Carrera no encontrada",
                }, 404

            if result == "DOCENTE_NOT_FOUND":
                return {
                    "ok": False,
                    "message": "Docente no encontrado",
                }, 404

            return {
                "ok": True,
                "materia": result,
            }, 201

        except IntegrityError as error:
            if getattr(error.orig, "errno", None) == 1062:
                return {
                    "ok": False,
                    "message": "Ya existe una materia con ese nombre en la carrera",
                }, 409

            print("Error en create_materia_en_carrera:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

        except Exception as error:
            print("Error en create_materia_en_carrera:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500
        
    @staticmethod
    def activar_materia(id):
        materia_id = int(id)

        try:
            admin_user_id = g.user["id"]
            updated = MateriaService.activar_materia(admin_user_id, materia_id)

            if not updated:
                return {
                    "ok": False,
                    "message": "Materia no encontrada",
                }, 404

            return {
                "ok": True,
            }, 200

        except Exception as error:
            print("Error en activar_materia:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500
        
    @staticmethod
    def desactivar_materia(id):
        materia_id = int(id)

        try:
            admin_user_id = g.user["id"]
            updated = MateriaService.desactivar_materia(admin_user_id, materia_id)

            if not updated:
                return {
                    "ok": False,
                    "message": "Materia no encontrada",
                }, 404

            return {
                "ok": True,
            }, 200

        except Exception as error:
            print("Error en desactivar_materia:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def update_materia(id):
        materia_id = int(id)
        data = request.get_json() or {}

        nombre = data.get("nombre")
        docente_id = data.get("docente_id")

        if not isinstance(nombre, str) or len(nombre.strip()) == 0:
            return {
                "ok": False,
                "message": "El nombre es requerido",
            }, 400

        try:
            docente_id = int(docente_id)
        except (TypeError, ValueError):
            return {
                "ok": False,
                "message": "docente_id inválido",
            }, 400

        try:
            admin_user_id = g.user["id"]

            result = MateriaService.update_materia(
                admin_user_id,
                materia_id,
                nombre.strip(),
                docente_id,
            )

            if result == "DOCENTE_NOT_FOUND":
                return {
                    "ok": False,
                    "message": "Docente no encontrado",
                }, 404

            if result == "MATERIA_NOT_FOUND":
                return {
                    "ok": False,
                    "message": "Materia no encontrada",
                }, 404

            return {
                "ok": True,
            }, 200

        except IntegrityError as error:
            if getattr(error.orig, "errno", None) == 1062:
                return {
                    "ok": False,
                    "message": "Ya existe una materia con ese nombre en la carrera",
                }, 409

            print("Error en update_materia:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

        except Exception as error:
            print("Error en update_materia:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500