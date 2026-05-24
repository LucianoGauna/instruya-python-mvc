from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.config import Config
from app.models.usuario_model import UsuarioModel


class AuthService:
    @staticmethod
    def login(email, password):
        usuario = UsuarioModel.find_by_email(email)

        if usuario is None:
            return None

        if not usuario.esta_activo():
            return None

        password_bytes = password.encode("utf-8")
        hash_bytes = usuario.contrasenia_hash.encode("utf-8")

        password_valida = bcrypt.checkpw(password_bytes, hash_bytes)

        if not password_valida:
            return None

        payload = {
            "id": usuario.id,
            "email": usuario.email,
            "rol": usuario.rol,
            "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        }

        token = jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")

        return {
            "token": token,
            "user": {
                "id": usuario.id,
                "email": usuario.email,
                "rol": usuario.rol,
            },
        }