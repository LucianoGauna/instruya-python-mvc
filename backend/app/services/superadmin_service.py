from app.models.superadmin_model import SuperadminModel


class SuperadminService:
    @staticmethod
    def get_instituciones():
        return SuperadminModel.find_instituciones()

    @staticmethod
    def create_institucion_con_admin(institucion_data, admin_data):
        return SuperadminModel.create_institucion_con_admin(
            institucion_data,
            admin_data,
        )

    @staticmethod
    def update_institucion(id, nombre, email, direccion):
        return SuperadminModel.update_institucion(
            id,
            nombre,
            email,
            direccion,
        )

    @staticmethod
    def activar_institucion(id):
        return SuperadminModel.set_institucion_activa(id, True)

    @staticmethod
    def desactivar_institucion(id):
        return SuperadminModel.set_institucion_activa(id, False)