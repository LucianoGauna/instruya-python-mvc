from datetime import date
from decimal import Decimal

from sqlalchemy import func

from app.extensions import db
from app.models.admin_model import Institucion, InscripcionMateria
from app.models.alumno_model import Calificacion
from app.models.carrera_model import Carrera, CarreraModel
from app.models.materia_model import Materia
from app.models.usuario_model import Usuario

TIPOS_CALIFICACION = {
    "TRABAJO_PRACTICO",
    "PARCIAL",
    "FINAL",
    "NOTA_MATERIA",
}

def to_date_only_iso(value):
    if value is None:
        return None

    if hasattr(value, "isoformat"):
        return value.isoformat()

    return str(value)


def to_datetime_iso(value):
    if value is None:
        return None

    if hasattr(value, "isoformat"):
        return value.isoformat()

    return str(value)


def to_number_or_string(value):
    if value is None:
        return None

    if isinstance(value, Decimal):
        return str(value)

    return value


def parse_fecha(fecha):
    if isinstance(fecha, date):
        return fecha

    return date.fromisoformat(fecha)


class DocenteModel:
    @staticmethod
    def find_all_by_admin_user_id(admin_user_id):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            return []

        docentes = (
            Usuario.query
            .filter_by(
                institucion_id=institucion_id,
                rol="DOCENTE",
                activo=True,
            )
            .order_by(Usuario.apellido, Usuario.nombre)
            .all()
        )

        return [
            {
                "id": docente.id,
                "nombre": docente.nombre,
                "apellido": docente.apellido,
                "email": docente.email,
            }
            for docente in docentes
        ]
    
    @staticmethod
    def find_mis_materias_docente(docente_id):
        rows = (
            db.session.query(
                Materia.id.label("materia_id"),
                Materia.nombre.label("materia_nombre"),
                Carrera.id.label("carrera_id"),
                Carrera.nombre.label("carrera_nombre"),
            )
            .join(Carrera, Carrera.id == Materia.carrera_id)
            .filter(
                Materia.docente_id == docente_id,
                Materia.activa.is_(True),
            )
            .order_by(Carrera.nombre, Materia.nombre)
            .all()
        )

        return [
            {
                "materia_id": row.materia_id,
                "materia_nombre": row.materia_nombre,
                "carrera_id": row.carrera_id,
                "carrera_nombre": row.carrera_nombre,
            }
            for row in rows
        ]

    @staticmethod
    def materia_es_del_docente(docente_id, materia_id):
        materia = (
            Materia.query
            .filter_by(
                id=materia_id,
                docente_id=docente_id,
            )
            .first()
        )

        return materia is not None

    @staticmethod
    def find_inscriptos_by_materia_for_docente(docente_id, materia_id):
        if not DocenteModel.materia_es_del_docente(docente_id, materia_id):
            return None

        rows = (
            db.session.query(
                Usuario.id.label("alumno_id"),
                Usuario.nombre.label("nombre"),
                Usuario.apellido.label("apellido"),
                Usuario.email.label("email"),
                InscripcionMateria.estado.label("estado"),
                InscripcionMateria.anio.label("anio"),
                InscripcionMateria.periodo.label("periodo"),
            )
            .join(Usuario, Usuario.id == InscripcionMateria.alumno_id)
            .filter(
                InscripcionMateria.materia_id == materia_id,
                InscripcionMateria.estado == "ACEPTADA",
                Usuario.activo.is_(True),
            )
            .order_by(Usuario.apellido, Usuario.nombre)
            .all()
        )

        return [
            {
                "alumno_id": row.alumno_id,
                "nombre": row.nombre,
                "apellido": row.apellido,
                "email": row.email,
                "estado": row.estado,
                "anio": row.anio,
                "periodo": row.periodo,
            }
            for row in rows
        ]

    @staticmethod
    def find_calificaciones_by_materia_for_docente(docente_id, materia_id):
        if not DocenteModel.materia_es_del_docente(docente_id, materia_id):
            return None

        calificaciones = (
            Calificacion.query
            .filter_by(
                materia_id=materia_id,
                docente_id=docente_id,
            )
            .order_by(Calificacion.fecha.desc(), Calificacion.id.desc())
            .all()
        )

        return [
            {
                "calificacion_id": calificacion.id,
                "alumno_id": calificacion.alumno_id,
                "materia_id": calificacion.materia_id,
                "tipo": calificacion.tipo,
                "fecha": to_date_only_iso(calificacion.fecha),
                "nota": to_number_or_string(calificacion.nota),
                "descripcion": calificacion.descripcion,
                "created_at": to_datetime_iso(calificacion.created_at),
            }
            for calificacion in calificaciones
        ]

    @staticmethod
    def create_calificacion_for_docente(
        docente_id,
        materia_id,
        alumno_id,
        tipo,
        fecha,
        nota,
        descripcion,
    ):
        if not DocenteModel.materia_es_del_docente(docente_id, materia_id):
            return "MATERIA_NOT_FOUND"

        inscripcion = (
            InscripcionMateria.query
            .filter_by(
                materia_id=materia_id,
                alumno_id=alumno_id,
                estado="ACEPTADA",
            )
            .first()
        )

        if inscripcion is None:
            return "ALUMNO_NO_INSCRIPTO"

        if tipo in ["FINAL", "NOTA_MATERIA"]:
            existente = (
                Calificacion.query
                .filter_by(
                    alumno_id=alumno_id,
                    materia_id=materia_id,
                    tipo=tipo,
                )
                .first()
            )

            if existente is not None:
                return "FINAL_YA_EXISTE" if tipo == "FINAL" else "NOTA_MATERIA_YA_EXISTE"

        calificacion = Calificacion(
            alumno_id=alumno_id,
            materia_id=materia_id,
            tipo=tipo,
            fecha=parse_fecha(fecha),
            nota=nota,
            descripcion=descripcion,
            docente_id=docente_id,
        )

        try:
            db.session.add(calificacion)
            db.session.commit()

            return {
                "id": calificacion.id,
                "alumno_id": alumno_id,
                "materia_id": materia_id,
                "tipo": tipo,
                "fecha": fecha,
                "nota": nota,
                "descripcion": descripcion,
                "docente_id": docente_id,
            }

        except Exception as error:
            db.session.rollback()
            raise error

    @staticmethod
    def update_calificacion_for_docente(
        docente_id,
        calificacion_id,
        tipo,
        fecha,
        nota,
        descripcion,
    ):
        calificacion = (
            db.session.query(Calificacion)
            .join(Materia, Materia.id == Calificacion.materia_id)
            .filter(
                Calificacion.id == calificacion_id,
                Materia.docente_id == docente_id,
                Calificacion.docente_id == docente_id,
            )
            .first()
        )

        if calificacion is None:
            return "CALIFICACION_NOT_FOUND"

        try:
            calificacion.tipo = tipo
            calificacion.fecha = parse_fecha(fecha)
            calificacion.nota = nota
            calificacion.descripcion = descripcion

            db.session.commit()

            return "OK"

        except Exception as error:
            db.session.rollback()
            raise error

    @staticmethod
    def find_dashboard_resumen_by_docente_user_id(docente_id):
        user_row = (
            db.session.query(
                Usuario.id.label("id"),
                Institucion.id.label("institucion_id"),
                Institucion.nombre.label("institucion_nombre"),
            )
            .outerjoin(Institucion, Institucion.id == Usuario.institucion_id)
            .filter(
                Usuario.id == docente_id,
                Usuario.rol == "DOCENTE",
            )
            .first()
        )

        if user_row is None:
            return None

        materias_row = (
            db.session.query(
                func.count(Materia.id).label("total"),
                func.count(func.distinct(Materia.carrera_id)).label("carreras"),
            )
            .filter(
                Materia.docente_id == docente_id,
                Materia.activa.is_(True),
            )
            .one()
        )

        inscriptos_row = (
            db.session.query(
                func.count(InscripcionMateria.id).label("inscripciones_aceptadas"),
                func.count(func.distinct(InscripcionMateria.alumno_id)).label(
                    "alumnos_unicos"
                ),
            )
            .join(Materia, Materia.id == InscripcionMateria.materia_id)
            .filter(
                Materia.docente_id == docente_id,
                Materia.activa.is_(True),
                InscripcionMateria.estado == "ACEPTADA",
            )
            .one()
        )

        return {
            "institucion": {
                "id": int(user_row.institucion_id),
                "nombre": str(user_row.institucion_nombre),
            } if user_row.institucion_id else None,
            "materias": {
                "total": int(materias_row.total or 0),
                "carreras": int(materias_row.carreras or 0),
            },
            "alumnos": {
                "unicos_inscriptos": int(inscriptos_row.alumnos_unicos or 0),
                "inscripciones_aceptadas": int(
                    inscriptos_row.inscripciones_aceptadas or 0
                ),
            },
        }