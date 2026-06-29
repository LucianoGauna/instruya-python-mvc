from sqlalchemy import case, func

from app.extensions import db
from app.models.carrera_model import Carrera, CarreraModel
from app.models.materia_model import Materia


class Institucion(db.Model):
    __tablename__ = "institucion"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)


class InscripcionMateria(db.Model):
    __tablename__ = "inscripcion_materia"

    id = db.Column(db.Integer, primary_key=True)
    materia_id = db.Column(db.Integer, nullable=False)
    estado = db.Column(db.String(20), nullable=False)


class AdminModel:
    @staticmethod
    def find_dashboard_resumen_by_admin_user_id(admin_user_id):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            return None

        institucion = db.session.get(Institucion, institucion_id)

        if institucion is None:
            return None

        carreras_total, carreras_activas = (
            db.session.query(
                func.count(Carrera.id),
                func.coalesce(
                    func.sum(
                        case(
                            (Carrera.activa.is_(True), 1),
                            else_=0,
                        )
                    ),
                    0,
                ),
            )
            .filter(Carrera.institucion_id == institucion_id)
            .one()
        )

        materias_total, materias_activas = (
            db.session.query(
                func.count(Materia.id),
                func.coalesce(
                    func.sum(
                        case(
                            (Materia.activa.is_(True), 1),
                            else_=0,
                        )
                    ),
                    0,
                ),
            )
            .join(Carrera, Carrera.id == Materia.carrera_id)
            .filter(Carrera.institucion_id == institucion_id)
            .one()
        )

        pendientes_total = (
            db.session.query(func.count(InscripcionMateria.id))
            .join(Materia, Materia.id == InscripcionMateria.materia_id)
            .join(Carrera, Carrera.id == Materia.carrera_id)
            .filter(
                Carrera.institucion_id == institucion_id,
                InscripcionMateria.estado == "PENDIENTE",
            )
            .scalar()
        )

        return {
            "institucion": {
                "id": int(institucion.id),
                "nombre": institucion.nombre,
            },
            "carreras": {
                "total": int(carreras_total or 0),
                "activas": int(carreras_activas or 0),
            },
            "materias": {
                "total": int(materias_total or 0),
                "activas": int(materias_activas or 0),
            },
            "inscripciones": {
                "pendientes": int(pendientes_total or 0),
            },
        }