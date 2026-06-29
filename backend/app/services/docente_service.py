from app.models.docente_model import DocenteModel


class DocenteService:
    @staticmethod
    def get_docentes(admin_user_id):
        return DocenteModel.find_all_by_admin_user_id(admin_user_id)