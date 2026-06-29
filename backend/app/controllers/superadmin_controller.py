import re

from flask import request
from sqlalchemy.exc import IntegrityError

from app.services.superadmin_service import SuperadminService


EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def is_valid_email(email):
    return EMAIL_REGEX.match(email) is not None


class SuperadminController:
    @staticmethod
    def get_instituciones():
        try:
            instituciones = SuperadminService.get_instituciones()

            return {
                "ok": True,
                "instituciones": instituciones,
            }, 200

        except Exception as error:
            print("Error en get_instituciones:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def create_institucion():
        data = request.get_json() or {}

        institucion_data = data.get("institucion")
        admin_data = data.get("admin")

        if not isinstance(institucion_data, dict) or not isinstance(admin_data, dict):
            return {
                "ok": False,
                "message": "Body inválido",
            }, 400

        nombre_inst = str(institucion_data.get("nombre") or "").strip()
        email_inst = str(institucion_data.get("email") or "").strip()
        direccion = str(institucion_data.get("direccion") or "").strip()

        admin_nombre = str(admin_data.get("nombre") or "").strip()
        admin_apellido = str(admin_data.get("apellido") or "").strip()
        admin_email = str(admin_data.get("email") or "").strip()
        admin_password = str(admin_data.get("contrasenia") or "")

        if (
            not nombre_inst
            or not email_inst
            or not direccion
            or not admin_nombre
            or not admin_apellido
            or not admin_email
            or not admin_password
        ):
            return {
                "ok": False,
                "message": "Faltan campos requeridos",
            }, 400

        if not is_valid_email(email_inst):
            return {
                "ok": False,
                "message": "Email de institución inválido",
            }, 400

        if not is_valid_email(admin_email):
            return {
                "ok": False,
                "message": "Email de administrador inválido",
            }, 400

        try:
            result = SuperadminService.create_institucion_con_admin(
                {
                    "nombre": nombre_inst,
                    "email": email_inst,
                    "direccion": direccion,
                },
                {
                    "nombre": admin_nombre,
                    "apellido": admin_apellido,
                    "email": admin_email,
                    "contrasenia": admin_password,
                },
            )

            if result == "INSTITUCION_EMAIL_DUP":
                return {
                    "ok": False,
                    "message": "Ya existe una institución con ese email",
                }, 409

            if result == "ADMIN_EMAIL_DUP":
                return {
                    "ok": False,
                    "message": "Ya existe un usuario con ese email",
                }, 409

            return {
                "ok": True,
                **result,
            }, 201

        except Exception as error:
            print("Error en create_institucion:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def update_institucion(id):
        institucion_id = int(id)
        data = request.get_json() or {}

        nombre = data.get("nombre")
        email = data.get("email")
        direccion = data.get("direccion")

        nombre = nombre.strip() if isinstance(nombre, str) else ""
        email = email.strip() if isinstance(email, str) else ""
        direccion = direccion.strip() if isinstance(direccion, str) else ""

        if not nombre or not email or not direccion:
            return {
                "ok": False,
                "message": "nombre/email/direccion requeridos",
            }, 400

        if not is_valid_email(email):
            return {
                "ok": False,
                "message": "email inválido",
            }, 400

        try:
            institucion = SuperadminService.update_institucion(
                institucion_id,
                nombre,
                email,
                direccion,
            )

            if institucion is None:
                return {
                    "ok": False,
                    "message": "Institución no encontrada",
                }, 404

            return {
                "ok": True,
                "institucion": institucion,
            }, 200

        except IntegrityError as error:
            if getattr(error.orig, "errno", None) == 1062:
                return {
                    "ok": False,
                    "message": "Email ya usado por otra institución",
                }, 409

            if getattr(error.orig, "errno", None) == 1048:
                return {
                    "ok": False,
                    "message": "direccion no puede ser null",
                }, 400

            print("Error en update_institucion:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

        except Exception as error:
            print("Error en update_institucion:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def activar_institucion(id):
        institucion_id = int(id)

        try:
            updated = SuperadminService.activar_institucion(institucion_id)

            if not updated:
                return {
                    "ok": False,
                    "message": "Institución no encontrada",
                }, 404

            return {
                "ok": True,
            }, 200

        except Exception as error:
            print("Error en activar_institucion:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def desactivar_institucion(id):
        institucion_id = int(id)

        try:
            updated = SuperadminService.desactivar_institucion(institucion_id)

            if not updated:
                return {
                    "ok": False,
                    "message": "Institución no encontrada",
                }, 404

            return {
                "ok": True,
            }, 200

        except Exception as error:
            print("Error en desactivar_institucion:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500
        
    @staticmethod
    def create_admin_en_institucion(id):
        institucion_id = int(id)
        data = request.get_json() or {}

        nombre = str(data.get("nombre") or "").strip()
        apellido = str(data.get("apellido") or "").strip()
        email = str(data.get("email") or "").strip()
        contrasenia = str(data.get("contrasenia") or "")

        if not nombre or not apellido or not email or not contrasenia:
            return {
                "ok": False,
                "message": "Faltan campos requeridos",
            }, 400

        if not is_valid_email(email):
            return {
                "ok": False,
                "message": "Email inválido",
            }, 400

        if len(contrasenia) < 6:
            return {
                "ok": False,
                "message": "La contraseña debe tener al menos 6 caracteres",
            }, 400

        try:
            result = SuperadminService.create_admin_en_institucion(
                institucion_id,
                nombre,
                apellido,
                email,
                contrasenia,
            )

            if result == "INSTITUCION_NOT_FOUND":
                return {
                    "ok": False,
                    "message": "Institución no encontrada",
                }, 404

            if result == "INSTITUCION_INACTIVA":
                return {
                    "ok": False,
                    "message": "La institución está inactiva",
                }, 409

            if result == "ADMIN_EMAIL_DUP":
                return {
                    "ok": False,
                    "message": "Ya existe un usuario con ese email",
                }, 409

            return {
                "ok": True,
                **result,
            }, 201

        except Exception as error:
            print("Error en create_admin_en_institucion:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def get_admins_by_institucion(id):
        institucion_id = int(id)

        try:
            admins = SuperadminService.get_admins_by_institucion(institucion_id)

            if admins is None:
                return {
                    "ok": False,
                    "message": "Institución no encontrada",
                }, 404

            return {
                "ok": True,
                "admins": admins,
            }, 200

        except Exception as error:
            print("Error en get_admins_by_institucion:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def activar_admin(admin_id):
        admin_id = int(admin_id)

        try:
            updated = SuperadminService.activar_admin(admin_id)

            if not updated:
                return {
                    "ok": False,
                    "message": "Administrador no encontrado",
                }, 404

            return {
                "ok": True,
            }, 200

        except Exception as error:
            print("Error en activar_admin:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500

    @staticmethod
    def desactivar_admin(admin_id):
        admin_id = int(admin_id)

        try:
            updated = SuperadminService.desactivar_admin(admin_id)

            if not updated:
                return {
                    "ok": False,
                    "message": "Administrador no encontrado",
                }, 404

            return {
                "ok": True,
            }, 200

        except Exception as error:
            print("Error en desactivar_admin:", error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500