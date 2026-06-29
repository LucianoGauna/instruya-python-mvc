from app.models.admin_model import AdminModel


PERIODOS_VALIDOS = {
    "PRIMER_CUATRIMESTRE",
    "SEGUNDO_CUATRIMESTRE",
    "ANUAL",
}


class AdminService:
    @staticmethod
    def get_dashboard_resumen(admin_user_id):
        return AdminModel.find_dashboard_resumen_by_admin_user_id(admin_user_id)

    @staticmethod
    def get_inscripciones_pendientes():
        return AdminModel.find_inscriptos_pendientes()

    @staticmethod
    def aceptar_inscripcion(inscripcion_id, anio, periodo):
        if not isinstance(anio, int) or anio < 2000 or anio > 2100:
            return "ANIO_INVALIDO"

        if periodo not in PERIODOS_VALIDOS:
            return "PERIODO_INVALIDO"

        return AdminModel.aceptar_inscripcion(inscripcion_id, anio, periodo)

    @staticmethod
    def rechazar_inscripcion(inscripcion_id):
        return AdminModel.rechazar_inscripcion(inscripcion_id)