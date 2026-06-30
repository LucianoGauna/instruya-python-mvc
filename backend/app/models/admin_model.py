from sqlalchemy import case, func

from datetime import date, datetime

from app.extensions import db
from app.models.carrera_model import Carrera, CarreraModel
from app.models.materia_model import Materia
from app.models.usuario_model import Usuario


class Institucion(db.Model):
    __tablename__ = "institucion"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    direccion = db.Column(db.String(255), nullable=True)
    activa = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP"),
    )


class InscripcionMateria(db.Model):
    __tablename__ = "inscripcion_materia"

    id = db.Column(db.Integer, primary_key=True)
    alumno_id = db.Column(db.Integer, nullable=False)
    materia_id = db.Column(db.Integer, nullable=False)
    estado = db.Column(db.String(20), nullable=False)
    anio = db.Column(db.Integer, nullable=True)
    periodo = db.Column(db.String(30), nullable=True)
    fecha = db.Column(db.Date, nullable=True)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP"),
    )

class AlumnoPerfil(db.Model):
    __tablename__ = "alumno_perfil"

    usuario_id = db.Column(db.Integer, primary_key=True)
    carrera_id = db.Column(db.Integer, nullable=True)
    legajo = db.Column(db.String(50), nullable=True)
    cohorte = db.Column(db.Integer, nullable=True)

def to_date_only_iso(value):
    if isinstance(value, datetime):
        return value.date().isoformat()

    if isinstance(value, date):
        return value.isoformat()

    return str(value)


def to_datetime_iso(value):
    if isinstance(value, datetime):
        return value.isoformat()

    return str(value)

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
    
    @staticmethod
    def find_inscriptos_pendientes():
        rows = (
            db.session.query(
                InscripcionMateria.id.label("inscripcion_id"),
                InscripcionMateria.fecha.label("fecha"),
                InscripcionMateria.created_at.label("created_at"),

                Usuario.id.label("alumno_id"),
                Usuario.nombre.label("alumno_nombre"),
                Usuario.apellido.label("alumno_apellido"),
                Usuario.email.label("alumno_email"),

                AlumnoPerfil.legajo.label("legajo"),
                AlumnoPerfil.cohorte.label("cohorte"),

                Materia.id.label("materia_id"),
                Materia.nombre.label("materia_nombre"),

                Carrera.id.label("carrera_id"),
                Carrera.nombre.label("carrera_nombre"),
            )
            .join(Usuario, Usuario.id == InscripcionMateria.alumno_id)
            .outerjoin(AlumnoPerfil, AlumnoPerfil.usuario_id == Usuario.id)
            .join(Materia, Materia.id == InscripcionMateria.materia_id)
            .join(Carrera, Carrera.id == Materia.carrera_id)
            .filter(InscripcionMateria.estado == "PENDIENTE")
            .order_by(InscripcionMateria.created_at.desc())
            .all()
        )

        return [
            {
                "inscripcion_id": int(row.inscripcion_id),

                "alumno_id": int(row.alumno_id),
                "alumno_nombre": str(row.alumno_nombre),
                "alumno_apellido": str(row.alumno_apellido),
                "alumno_email": str(row.alumno_email),
                "legajo": row.legajo,
                "cohorte": None if row.cohorte is None else int(row.cohorte),

                "materia_id": int(row.materia_id),
                "materia_nombre": str(row.materia_nombre),

                "carrera_id": int(row.carrera_id),
                "carrera_nombre": str(row.carrera_nombre),

                "fecha": to_date_only_iso(row.fecha),
                "created_at": to_datetime_iso(row.created_at),
            }
            for row in rows
        ]

    @staticmethod
    def aceptar_inscripcion(inscripcion_id, anio, periodo):
        inscripcion = db.session.get(InscripcionMateria, inscripcion_id)

        if inscripcion is None:
            return "NOT_FOUND"

        if inscripcion.estado != "PENDIENTE":
            return "NOT_PENDIENTE"

        try:
            inscripcion.estado = "ACEPTADA"
            inscripcion.anio = anio
            inscripcion.periodo = periodo
            inscripcion.fecha = date.today()

            db.session.commit()

            return "OK"

        except Exception as error:
            db.session.rollback()
            raise error

    @staticmethod
    def rechazar_inscripcion(inscripcion_id):
        inscripcion = db.session.get(InscripcionMateria, inscripcion_id)

        if inscripcion is None:
            return "NOT_FOUND"

        if inscripcion.estado != "PENDIENTE":
            return "NOT_PENDIENTE"

        try:
            inscripcion.estado = "RECHAZADA"
            inscripcion.anio = None
            inscripcion.periodo = None
            inscripcion.fecha = date.today()

            db.session.commit()

            return "OK"

        except Exception as error:
            db.session.rollback()
            raise error