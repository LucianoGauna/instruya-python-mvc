from app.database import get_connection


class Usuario:
    def __init__(
        self,
        id,
        nombre,
        apellido,
        email,
        contrasenia_hash,
        rol,
        institucion_id,
        activo,
        created_at,
    ):
        self.id = id
        self.nombre = nombre
        self.apellido = apellido
        self.email = email
        self.contrasenia_hash = contrasenia_hash
        self.rol = rol
        self.institucion_id = institucion_id
        self.activo = activo
        self.created_at = created_at

    def esta_activo(self):
        return bool(self.activo)


class UsuarioModel:
    @staticmethod
    def find_by_email(email):
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                id,
                nombre,
                apellido,
                email,
                contrasenia_hash,
                rol,
                institucion_id,
                activo,
                created_at
            FROM usuario
            WHERE email = %s
            LIMIT 1;
        """

        cursor.execute(query, (email,))
        row = cursor.fetchone()

        cursor.close()
        connection.close()

        if row is None:
            return None

        return Usuario(
            id=row["id"],
            nombre=row["nombre"],
            apellido=row["apellido"],
            email=row["email"],
            contrasenia_hash=row["contrasenia_hash"],
            rol=row["rol"],
            institucion_id=row["institucion_id"],
            activo=row["activo"],
            created_at=row["created_at"],
        )