from datetime import date
from decimal import Decimal

from sqlalchemy import Numeric, and_, case, cast, func

from app.extensions import db
from app.models.admin_model import AlumnoPerfil, Institucion, InscripcionMateria
from app.models.carrera_model import Carrera
from app.models.materia_model import Materia
from app.models.usuario_model import Usuario


class Calificacion(db.Model):
    __tablename__ = "calificacion"

    id = db.Column(db.Integer, primary_key=True)
    alumno_id = db.Column(db.Integer, nullable=False)
    materia_id = db.Column(db.Integer, nullable=False)
    docente_id = db.Column(db.Integer, nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    fecha = db.Column(db.Date, nullable=True)
    nota = db.Column(db.Numeric(10, 2), nullable=True)
    descripcion = db.Column(db.String(255), nullable=True)


def to_date_only_iso(value):
    if value is None:
        return None

    if hasattr(value, "isoformat"):
        return value.isoformat()

    return str(value)


def to_number_or_none(value):
    if value is None:
        return None

    if isinstance(value, Decimal):
        return float(value)

    return value


class AlumnoModel:
    @staticmethod
    def find_mis_materias(alumno_id):
        rows = (
            db.session.query(
                InscripcionMateria.id.label("inscripcion_id"),
                InscripcionMateria.estado.label("estado"),
                InscripcionMateria.fecha.label("fecha"),
                InscripcionMateria.anio.label("anio"),
                InscripcionMateria.periodo.label("periodo"),
                Materia.id.label("materia_id"),
                Materia.nombre.label("materia_nombre"),
                Carrera.id.label("carrera_id"),
                Carrera.nombre.label("carrera_nombre"),
            )
            .join(Materia, Materia.id == InscripcionMateria.materia_id)
            .join(Carrera, Carrera.id == Materia.carrera_id)
            .filter(
                InscripcionMateria.alumno_id == alumno_id,
                InscripcionMateria.estado.in_(["ACEPTADA", "PENDIENTE"]),
            )
            .order_by(Carrera.nombre, Materia.nombre)
            .all()
        )

        return [
            {
                "inscripcion_id": row.inscripcion_id,
                "estado": row.estado,
                "fecha": to_date_only_iso(row.fecha),
                "anio": row.anio,
                "periodo": row.periodo,
                "materia_id": row.materia_id,
                "materia_nombre": row.materia_nombre,
                "carrera_id": row.carrera_id,
                "carrera_nombre": row.carrera_nombre,
            }
            for row in rows
        ]

    @staticmethod
    def find_mis_calificaciones(alumno_id):
        rows = (
            db.session.query(
                Calificacion.id.label("calificacion_id"),
                Calificacion.tipo.label("tipo"),
                Calificacion.fecha.label("fecha"),
                Calificacion.nota.label("nota"),
                Calificacion.descripcion.label("descripcion"),
                Materia.id.label("materia_id"),
                Materia.nombre.label("materia_nombre"),
                Usuario.id.label("docente_id"),
                Usuario.nombre.label("docente_nombre"),
                Usuario.apellido.label("docente_apellido"),
                Usuario.email.label("docente_email"),
            )
            .join(Materia, Materia.id == Calificacion.materia_id)
            .join(Usuario, Usuario.id == Calificacion.docente_id)
            .filter(Calificacion.alumno_id == alumno_id)
            .order_by(Materia.nombre, Calificacion.fecha.desc(), Calificacion.id.desc())
            .all()
        )

        return [
            {
                "calificacion_id": row.calificacion_id,
                "tipo": row.tipo,
                "fecha": to_date_only_iso(row.fecha),
                "nota": to_number_or_none(row.nota),
                "descripcion": row.descripcion,
                "materia_id": row.materia_id,
                "materia_nombre": row.materia_nombre,
                "docente_id": row.docente_id,
                "docente_nombre": row.docente_nombre,
                "docente_apellido": row.docente_apellido,
                "docente_email": row.docente_email,
            }
            for row in rows
        ]

    @staticmethod
    def get_carrera_del_alumno(alumno_id):
        row = (
            db.session.query(
                Carrera.id.label("id"),
                Carrera.nombre.label("nombre"),
            )
            .join(AlumnoPerfil, AlumnoPerfil.carrera_id == Carrera.id)
            .filter(AlumnoPerfil.usuario_id == alumno_id)
            .first()
        )

        if row is None:
            return None

        return {
            "id": int(row.id),
            "nombre": str(row.nombre),
        }

    @staticmethod
    def find_catalogo_materias(alumno_id):
        carrera = AlumnoModel.get_carrera_del_alumno(alumno_id)

        if carrera is None:
            return "ALUMNO_SIN_CARRERA"

        rows = (
            db.session.query(
                Materia.id.label("materia_id"),
                Materia.nombre.label("materia_nombre"),
                InscripcionMateria.id.label("inscripcion_id"),
                InscripcionMateria.estado.label("estado"),
                InscripcionMateria.fecha.label("fecha"),
                InscripcionMateria.anio.label("anio"),
                InscripcionMateria.periodo.label("periodo"),
            )
            .outerjoin(
                InscripcionMateria,
                and_(
                    InscripcionMateria.materia_id == Materia.id,
                    InscripcionMateria.alumno_id == alumno_id,
                ),
            )
            .filter(
                Materia.carrera_id == carrera["id"],
                Materia.activa.is_(True),
            )
            .order_by(Materia.nombre)
            .all()
        )

        materias = [
            {
                "materia_id": int(row.materia_id),
                "materia_nombre": str(row.materia_nombre),
                "inscripcion": {
                    "inscripcion_id": int(row.inscripcion_id),
                    "estado": row.estado,
                    "fecha": to_date_only_iso(row.fecha),
                    "anio": None if row.anio is None else int(row.anio),
                    "periodo": row.periodo,
                } if row.inscripcion_id else None,
            }
            for row in rows
        ]

        return {
            "ok": True,
            "carrera": carrera,
            "materias": materias,
        }

    @staticmethod
    def solicitar_inscripcion(alumno_id, materia_id):
        carrera = AlumnoModel.get_carrera_del_alumno(alumno_id)

        if carrera is None:
            return "ALUMNO_SIN_CARRERA"

        materia = (
            Materia.query
            .filter_by(
                id=materia_id,
                carrera_id=carrera["id"],
                activa=True,
            )
            .first()
        )

        if materia is None:
            return "MATERIA_NOT_FOUND"

        inscripcion = (
            InscripcionMateria.query
            .filter_by(
                alumno_id=alumno_id,
                materia_id=materia_id,
            )
            .first()
        )

        if inscripcion is not None:
            if inscripcion.estado in ["PENDIENTE", "ACEPTADA"]:
                return "YA_INSCRIPTO"

            try:
                inscripcion.estado = "PENDIENTE"
                inscripcion.fecha = date.today()
                inscripcion.anio = None
                inscripcion.periodo = None

                db.session.commit()

                return {
                    "inscripcion_id": inscripcion.id,
                    "estado": "PENDIENTE",
                }

            except Exception as error:
                db.session.rollback()
                raise error

        nueva_inscripcion = InscripcionMateria(
            alumno_id=alumno_id,
            materia_id=materia_id,
            estado="PENDIENTE",
            fecha=date.today(),
            anio=None,
            periodo=None,
        )

        try:
            db.session.add(nueva_inscripcion)
            db.session.commit()

            return {
                "inscripcion_id": nueva_inscripcion.id,
                "estado": "PENDIENTE",
            }

        except Exception as error:
            db.session.rollback()
            raise error

    @staticmethod
    def find_dashboard_resumen_by_alumno_user_id(alumno_id):
        user_row = (
            db.session.query(
                Usuario.id.label("id"),
                Institucion.id.label("institucion_id"),
                Institucion.nombre.label("institucion_nombre"),
                Carrera.id.label("carrera_id"),
                Carrera.nombre.label("carrera_nombre"),
            )
            .outerjoin(AlumnoPerfil, AlumnoPerfil.usuario_id == Usuario.id)
            .outerjoin(Carrera, Carrera.id == AlumnoPerfil.carrera_id)
            .outerjoin(Institucion, Institucion.id == Usuario.institucion_id)
            .filter(
                Usuario.id == alumno_id,
                Usuario.rol == "ALUMNO",
            )
            .first()
        )

        if user_row is None:
            return None

        aceptadas_total = (
            db.session.query(func.count(InscripcionMateria.id))
            .filter(
                InscripcionMateria.alumno_id == alumno_id,
                InscripcionMateria.estado == "ACEPTADA",
            )
            .scalar()
        )

        nota_subquery = (
            db.session.query(
                Calificacion.materia_id.label("materia_id"),
                func.max(cast(Calificacion.nota, Numeric(10, 2))).label(
                    "best_nota_materia"
                ),
            )
            .filter(
                Calificacion.alumno_id == alumno_id,
                Calificacion.tipo == "NOTA_MATERIA",
            )
            .group_by(Calificacion.materia_id)
            .subquery()
        )

        nota_stats = (
            db.session.query(
                func.count(nota_subquery.c.materia_id).label(
                    "materias_con_nota_materia"
                ),
                func.avg(nota_subquery.c.best_nota_materia).label("promedio"),
                func.coalesce(
                    func.sum(
                        case(
                            (nota_subquery.c.best_nota_materia >= 6, 1),
                            else_=0,
                        )
                    ),
                    0,
                ).label("aprobadas"),
                func.coalesce(
                    func.sum(
                        case(
                            (nota_subquery.c.best_nota_materia < 6, 1),
                            else_=0,
                        )
                    ),
                    0,
                ).label("desaprobadas"),
            )
            .one()
        )

        promedio_raw = nota_stats.promedio
        promedio_nota_materia = (
            None
            if promedio_raw is None
            else round(float(promedio_raw), 2)
        )

        return {
            "institucion": {
                "id": int(user_row.institucion_id),
                "nombre": str(user_row.institucion_nombre),
            } if user_row.institucion_id else None,
            "carrera": {
                "id": int(user_row.carrera_id),
                "nombre": str(user_row.carrera_nombre),
            } if user_row.carrera_id else None,
            "materias": {
                "aceptadas": int(aceptadas_total or 0),
                "aprobadas": int(nota_stats.aprobadas or 0),
                "desaprobadas": int(nota_stats.desaprobadas or 0),
            },
            "promedio_nota_materia": promedio_nota_materia,
        }