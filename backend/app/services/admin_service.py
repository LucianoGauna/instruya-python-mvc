from app.models.admin_model import AdminModel


class AdminService:
    @staticmethod
    def get_dashboard_resumen(admin_user_id):
        return AdminModel.find_dashboard_resumen_by_admin_user_id(admin_user_id)