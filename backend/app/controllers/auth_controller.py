from flask import request

from app.services.auth_service import AuthService


class AuthController:
    @staticmethod
    def login():
        try:
            data = request.get_json() or {}

            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return {
                    "ok": False,
                    "message": "Email y contraseña son requeridos",
                }, 400

            result = AuthService.login(email, password)

            if result is None:
                return {
                    "ok": False,
                    "message": "Credenciales inválidas",
                }, 401

            return {
                "ok": True,
                "token": result["token"],
                "user": result["user"],
            }, 200

        except Exception as error:
            print(error)

            return {
                "ok": False,
                "message": "Error interno en el servidor",
            }, 500