from app.models.materia_model import MateriaModel


class MateriaService:
    @staticmethod
    def get_materias_de_carrera(admin_user_id, carrera_id):
        return MateriaModel.find_by_carrera_for_admin(admin_user_id, carrera_id)

    @staticmethod
    def create_materia_en_carrera(admin_user_id, carrera_id, nombre, docente_id):
        return MateriaModel.create_for_admin_in_carrera(
            admin_user_id,
            carrera_id,
            nombre,
            docente_id,
        )

    @staticmethod
    def activar_materia(admin_user_id, materia_id):
        return MateriaModel.set_activa_for_admin(admin_user_id, materia_id, True)

    @staticmethod
    def desactivar_materia(admin_user_id, materia_id):
        return MateriaModel.set_activa_for_admin(admin_user_id, materia_id, False)

    @staticmethod
    def update_materia(admin_user_id, materia_id, nombre, docente_id):
        return MateriaModel.update_for_admin(
            admin_user_id,
            materia_id,
            nombre,
            docente_id,
        )