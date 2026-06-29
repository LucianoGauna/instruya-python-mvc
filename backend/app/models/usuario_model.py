from app.extensions import db


class Usuario(db.Model):
    __tablename__ = "usuario"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    contrasenia_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False)
    institucion_id = db.Column(db.Integer, nullable=True)
    activo = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.text("CURRENT_TIMESTAMP"),
    )

    def esta_activo(self):
        return bool(self.activo)


class UsuarioModel:
    @staticmethod
    def find_by_email(email):
        return Usuario.query.filter_by(email=email).first()