import mysql.connector

from app.database import get_connection
from app.extensions import db
from app.models.usuario_model import Usuario

class Carrera(db.Model):
    __tablename__ = "carrera"

    id = db.Column(db.Integer, primary_key=True)
    institucion_id = db.Column(db.Integer, nullable=False)
    nombre = db.Column(db.String(255), nullable=False)
    activa = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP"),
    )


class CarreraModel:
    @staticmethod
    def find_institucion_id_by_user_id(user_id):
        usuario = db.session.get(Usuario, user_id)

        if usuario is None:
            return None

        return usuario.institucion_id      

    @staticmethod
    def find_all_by_admin_user_id(admin_user_id):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            return []

        carreras = (
            Carrera.query
            .filter_by(institucion_id=institucion_id)
            .order_by(Carrera.nombre)
            .all()
        )

        return [
            {
                "id": carrera.id,
                "nombre": carrera.nombre,
                "activa": int(carrera.activa),
                "created_at": carrera.created_at,
            }
            for carrera in carreras
        ]

    @staticmethod
    def create_for_admin(admin_user_id, nombre):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            raise Exception("El admin no tiene institución asignada")

        carrera = Carrera(
            institucion_id=institucion_id,
            nombre=nombre,
            activa=True,
        )

        try:
            db.session.add(carrera)
            db.session.commit()

            return {
                "id": carrera.id,
                "nombre": carrera.nombre,
                "institucion_id": carrera.institucion_id,
            }

        except Exception as error:
            db.session.rollback()
            raise error

    @staticmethod
    def find_by_id_for_admin(admin_user_id, carrera_id):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            return None

        carrera = (
            Carrera.query
            .filter_by(id=carrera_id, institucion_id=institucion_id)
            .first()
        )

        if carrera is None:
            return None

        return {
            "id": carrera.id,
            "nombre": carrera.nombre,
            "activa": int(carrera.activa),
            "created_at": carrera.created_at,
        }

    @staticmethod
    def set_activa_for_admin(admin_user_id, carrera_id, activa):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            return False

        carrera = (
            Carrera.query
            .filter_by(id=carrera_id, institucion_id=institucion_id)
            .first()
        )

        if carrera is None:
            return False

        try:
            carrera.activa = activa
            db.session.commit()

            return True

        except Exception as error:
            db.session.rollback()
            raise error

    @staticmethod
    def update_nombre_for_admin(admin_user_id, carrera_id, nombre):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            return None

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            exists_query = """
                SELECT id
                FROM carrera
                WHERE id = %s
                  AND institucion_id = %s
                LIMIT 1;
            """

            cursor.execute(exists_query, (carrera_id, institucion_id))
            exists_row = cursor.fetchone()

            if exists_row is None:
                return None

            update_query = """
                UPDATE carrera
                SET nombre = %s
                WHERE id = %s
                  AND institucion_id = %s;
            """

            cursor.execute(update_query, (nombre, carrera_id, institucion_id))
            connection.commit()

            return {
                "id": carrera_id,
                "nombre": nombre,
            }

        except mysql.connector.Error as error:
            connection.rollback()
            raise error

        finally:
            cursor.close()
            connection.close()