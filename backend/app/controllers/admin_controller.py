import mysql.connector

from flask import request, g

from app.services.carrera_service import CarreraService


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

        except mysql.connector.Error as error:
            if error.errno == 1062:
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

        except mysql.connector.Error as error:
            if error.errno == 1062:
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