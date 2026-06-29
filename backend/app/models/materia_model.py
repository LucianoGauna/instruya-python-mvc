from app.extensions import db
from app.models.carrera_model import Carrera, CarreraModel
from app.models.usuario_model import Usuario


class Materia(db.Model):
    __tablename__ = "materia"

    id = db.Column(db.Integer, primary_key=True)
    carrera_id = db.Column(db.Integer, nullable=False)
    nombre = db.Column(db.String(255), nullable=False)
    docente_id = db.Column(db.Integer, nullable=False)
    activa = db.Column(db.Boolean, nullable=False)


class MateriaModel:
    @staticmethod
    def find_carrera_for_admin(admin_user_id, carrera_id):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            return None

        return (
            Carrera.query
            .filter_by(id=carrera_id, institucion_id=institucion_id)
            .first()
        )

    @staticmethod
    def find_docente_for_admin(admin_user_id, docente_id):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            return None

        return (
            Usuario.query
            .filter_by(
                id=docente_id,
                institucion_id=institucion_id,
                rol="DOCENTE",
                activo=True,
            )
            .first()
        )

    @staticmethod
    def find_by_carrera_for_admin(admin_user_id, carrera_id):
        carrera = MateriaModel.find_carrera_for_admin(admin_user_id, carrera_id)

        if carrera is None:
            return None

        rows = (
            db.session.query(Materia, Usuario)
            .join(Usuario, Usuario.id == Materia.docente_id)
            .filter(Materia.carrera_id == carrera_id)
            .order_by(Materia.nombre)
            .all()
        )

        return [
            {
                "materia_id": materia.id,
                "materia_nombre": materia.nombre,
                "activa": int(materia.activa),
                "docente_id": materia.docente_id,
                "docente_nombre": docente.nombre,
                "docente_apellido": docente.apellido,
                "docente_email": docente.email,
            }
            for materia, docente in rows
        ]

    @staticmethod
    def create_for_admin_in_carrera(admin_user_id, carrera_id, nombre, docente_id):
        carrera = MateriaModel.find_carrera_for_admin(admin_user_id, carrera_id)

        if carrera is None:
            return "CARRERA_NOT_FOUND"

        docente = MateriaModel.find_docente_for_admin(admin_user_id, docente_id)

        if docente is None:
            return "DOCENTE_NOT_FOUND"

        materia = Materia(
            carrera_id=carrera_id,
            nombre=nombre,
            docente_id=docente_id,
            activa=True,
        )

        try:
            db.session.add(materia)
            db.session.commit()

            return {
                "id": materia.id,
                "nombre": materia.nombre,
                "carrera_id": materia.carrera_id,
                "docente_id": materia.docente_id,
            }

        except Exception as error:
            db.session.rollback()
            raise error

    @staticmethod
    def find_for_admin(admin_user_id, materia_id):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            return None

        return (
            db.session.query(Materia)
            .join(Carrera, Carrera.id == Materia.carrera_id)
            .filter(
                Materia.id == materia_id,
                Carrera.institucion_id == institucion_id,
            )
            .first()
        )

    @staticmethod
    def set_activa_for_admin(admin_user_id, materia_id, activa):
        materia = MateriaModel.find_for_admin(admin_user_id, materia_id)

        if materia is None:
            return False

        try:
            materia.activa = activa
            db.session.commit()

            return True

        except Exception as error:
            db.session.rollback()
            raise error

    @staticmethod
    def update_for_admin(admin_user_id, materia_id, nombre, docente_id):
        materia = MateriaModel.find_for_admin(admin_user_id, materia_id)

        if materia is None:
            return "MATERIA_NOT_FOUND"

        docente = MateriaModel.find_docente_for_admin(admin_user_id, docente_id)

        if docente is None:
            return "DOCENTE_NOT_FOUND"

        try:
            materia.nombre = nombre
            materia.docente_id = docente_id
            db.session.commit()

            return "OK"

        except Exception as error:
            db.session.rollback()
            raise error