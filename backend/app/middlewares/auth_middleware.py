from functools import wraps

import jwt
from flask import request, g

from app.config import Config

VALID_ROLES = ["SUPERADMIN", "ADMIN", "DOCENTE", "ALUMNO"]


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return {
                "ok": False,
                "message": "Falta Authorization",
            }, 401

        parts = auth_header.split(" ")
        scheme = parts[0] if len(parts) > 0 else None
        token = parts[1] if len(parts) > 1 else None

        if scheme != "Bearer" or not token:
            return {
                "ok": False,
                "message": "Formato inválido (Bearer)",
            }, 401

        try:
            payload = jwt.decode(
                token,
                Config.JWT_SECRET,
                algorithms=["HS256"],
            )

            if (
                not payload.get("id")
                or not payload.get("email")
                or not payload.get("rol")
            ):
                return {
                    "ok": False,
                    "message": "Token inválido (payload incompleto)",
                }, 401

            if payload["rol"] not in VALID_ROLES:
                return {
                    "ok": False,
                    "message": "Token inválido (rol inválido)",
                }, 401

            g.user = {
                "id": int(payload["id"]),
                "email": str(payload["email"]),
                "rol": payload["rol"],
            }

            return fn(*args, **kwargs)

        except jwt.PyJWTError:
            return {
                "ok": False,
                "message": "Token inválido o expirado",
            }, 401

    return wrapper