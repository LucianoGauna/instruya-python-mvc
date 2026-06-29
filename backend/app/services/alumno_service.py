from app.models.alumno_model import AlumnoModel


class AlumnoService:
    @staticmethod
    def get_dashboard_resumen(alumno_id):
        return AlumnoModel.find_dashboard_resumen_by_alumno_user_id(alumno_id)

    @staticmethod
    def get_mis_materias(alumno_id):
        return AlumnoModel.find_mis_materias(alumno_id)

    @staticmethod
    def get_mis_calificaciones(alumno_id):
        return AlumnoModel.find_mis_calificaciones(alumno_id)

    @staticmethod
    def get_catalogo_materias(alumno_id):
        return AlumnoModel.find_catalogo_materias(alumno_id)

    @staticmethod
    def solicitar_inscripcion(alumno_id, materia_id):
        return AlumnoModel.solicitar_inscripcion(alumno_id, materia_id)