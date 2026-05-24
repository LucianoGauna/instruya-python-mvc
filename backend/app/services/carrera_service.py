from app.models.carrera_model import CarreraModel


class CarreraService:
    @staticmethod
    def get_carreras(admin_user_id):
        return CarreraModel.find_all_by_admin_user_id(admin_user_id)

    @staticmethod
    def create_carrera(admin_user_id, nombre):
        return CarreraModel.create_for_admin(admin_user_id, nombre)

    @staticmethod
    def get_carrera_by_id(admin_user_id, carrera_id):
        return CarreraModel.find_by_id_for_admin(admin_user_id, carrera_id)

    @staticmethod
    def activar_carrera(admin_user_id, carrera_id):
        return CarreraModel.set_activa_for_admin(admin_user_id, carrera_id, 1)

    @staticmethod
    def desactivar_carrera(admin_user_id, carrera_id):
        return CarreraModel.set_activa_for_admin(admin_user_id, carrera_id, 0)

    @staticmethod
    def update_carrera(admin_user_id, carrera_id, nombre):
        return CarreraModel.update_nombre_for_admin(admin_user_id, carrera_id, nombre)