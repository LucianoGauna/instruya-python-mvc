import bcrypt
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.admin_model import Institucion
from app.models.usuario_model import Usuario


def to_datetime_iso(value):
    if value is None:
        return None

    return value.isoformat() if hasattr(value, "isoformat") else str(value)


class SuperadminModel:
    @staticmethod
    def find_instituciones():
        instituciones = (
            Institucion.query
            .order_by(Institucion.nombre)
            .all()
        )

        return [
            {
                "id": institucion.id,
                "nombre": institucion.nombre,
                "email": institucion.email,
                "direccion": institucion.direccion,
                "activa": int(institucion.activa),
                "created_at": to_datetime_iso(institucion.created_at),
            }
            for institucion in instituciones
        ]

    @staticmethod
    def create_institucion_con_admin(institucion_data, admin_data):
        institucion = Institucion(
            nombre=institucion_data["nombre"],
            email=institucion_data["email"],
            direccion=institucion_data["direccion"],
            activa=True,
        )

        try:
            db.session.add(institucion)
            db.session.flush()

        except IntegrityError as error:
            db.session.rollback()

            if getattr(error.orig, "errno", None) == 1062:
                return "INSTITUCION_EMAIL_DUP"

            raise error

        password_hash = bcrypt.hashpw(
            admin_data["contrasenia"].encode("utf-8"),
            bcrypt.gensalt(),
        ).decode("utf-8")

        admin = Usuario(
            nombre=admin_data["nombre"],
            apellido=admin_data["apellido"],
            email=admin_data["email"],
            contrasenia_hash=password_hash,
            rol="ADMIN",
            institucion_id=institucion.id,
            activo=True,
        )

        try:
            db.session.add(admin)
            db.session.commit()

            return {
                "institucion": {
                    "id": institucion.id,
                    "nombre": institucion.nombre,
                    "email": institucion.email,
                    "direccion": institucion.direccion,
                    "activa": 1,
                },
                "admin": {
                    "id": admin.id,
                    "email": admin.email,
                },
            }

        except IntegrityError as error:
            db.session.rollback()

            if getattr(error.orig, "errno", None) == 1062:
                return "ADMIN_EMAIL_DUP"

            raise error

        except Exception as error:
            db.session.rollback()
            raise error

    @staticmethod
    def update_institucion(id, nombre, email, direccion):
        institucion = db.session.get(Institucion, id)

        if institucion is None:
            return None

        try:
            institucion.nombre = nombre
            institucion.email = email
            institucion.direccion = direccion

            db.session.commit()

            return {
                "id": institucion.id,
                "nombre": institucion.nombre,
                "email": institucion.email,
                "direccion": institucion.direccion,
            }

        except Exception as error:
            db.session.rollback()
            raise error

    @staticmethod
    def set_institucion_activa(id, activa):
        institucion = db.session.get(Institucion, id)

        if institucion is None:
            return False

        try:
            institucion.activa = activa
            db.session.commit()

            return True

        except Exception as error:
            db.session.rollback()
            raise error