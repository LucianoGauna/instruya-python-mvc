from app.models.carrera_model import CarreraModel
from app.models.usuario_model import Usuario


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