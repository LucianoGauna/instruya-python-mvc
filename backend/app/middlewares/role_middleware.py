from functools import wraps

from flask import g


def require_role(allowed_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = getattr(g, "user", None)

            if user is None:
                return {
                    "ok": False,
                    "message": "No autenticado",
                }, 401

            if user["rol"] not in allowed_roles:
                return {
                    "ok": False,
                    "message": "No autorizado",
                }, 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator