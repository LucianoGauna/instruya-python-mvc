from app.models.docente_model import DocenteModel


class DocenteService:
    @staticmethod
    def get_docentes(admin_user_id):
        return DocenteModel.find_all_by_admin_user_id(admin_user_id)
    
    @staticmethod
    def get_dashboard_resumen(docente_id):
        return DocenteModel.find_dashboard_resumen_by_docente_user_id(docente_id)

    @staticmethod
    def get_mis_materias(docente_id):
        return DocenteModel.find_mis_materias_docente(docente_id)

    @staticmethod
    def get_inscriptos_by_materia(docente_id, materia_id):
        inscriptos = DocenteModel.find_inscriptos_by_materia_for_docente(
            docente_id,
            materia_id,
        )

        if inscriptos is None:
            return None

        calificaciones = DocenteModel.find_calificaciones_by_materia_for_docente(
            docente_id,
            materia_id,
        )

        if calificaciones is None:
            return None

        calificaciones_por_alumno = {}

        for calificacion in calificaciones:
            alumno_id = int(calificacion["alumno_id"])

            if alumno_id not in calificaciones_por_alumno:
                calificaciones_por_alumno[alumno_id] = []

            calificaciones_por_alumno[alumno_id].append(calificacion)

        return [
            {
                **inscripto,
                "calificaciones": calificaciones_por_alumno.get(
                    int(inscripto["alumno_id"]),
                    [],
                ),
            }
            for inscripto in inscriptos
        ]

    @staticmethod
    def create_calificacion(docente_id, materia_id, alumno_id, tipo, fecha, nota, descripcion):
        return DocenteModel.create_calificacion_for_docente(
            docente_id,
            materia_id,
            alumno_id,
            tipo,
            fecha,
            nota,
            descripcion,
        )

    @staticmethod
    def update_calificacion(docente_id, calificacion_id, tipo, fecha, nota, descripcion):
        return DocenteModel.update_calificacion_for_docente(
            docente_id,
            calificacion_id,
            tipo,
            fecha,
            nota,
            descripcion,
        )