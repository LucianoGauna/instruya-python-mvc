import mysql.connector

from app.database import get_connection


class CarreraModel:
    @staticmethod
    def find_institucion_id_by_user_id(user_id):
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT institucion_id
            FROM usuario
            WHERE id = %s
            LIMIT 1;
        """

        cursor.execute(query, (user_id,))
        row = cursor.fetchone()

        cursor.close()
        connection.close()

        if row is None:
            return None

        return row["institucion_id"]

    @staticmethod
    def find_all_by_admin_user_id(admin_user_id):
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                c.id,
                c.nombre,
                c.activa,
                c.created_at
            FROM carrera c
            INNER JOIN usuario u ON u.institucion_id = c.institucion_id
            WHERE u.id = %s
            ORDER BY c.nombre;
        """

        cursor.execute(query, (admin_user_id,))
        rows = cursor.fetchall()

        cursor.close()
        connection.close()

        return rows

    @staticmethod
    def create_for_admin(admin_user_id, nombre):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            raise Exception("El admin no tiene institución asignada")

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            query = """
                INSERT INTO carrera (institucion_id, nombre)
                VALUES (%s, %s);
            """

            cursor.execute(query, (institucion_id, nombre))
            connection.commit()

            carrera = {
                "id": cursor.lastrowid,
                "nombre": nombre,
                "institucion_id": institucion_id,
            }

            return carrera

        except mysql.connector.Error as error:
            connection.rollback()
            raise error

        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def find_by_id_for_admin(admin_user_id, carrera_id):
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                c.id,
                c.nombre,
                c.activa,
                c.created_at
            FROM carrera c
            INNER JOIN usuario admin ON admin.institucion_id = c.institucion_id
            WHERE admin.id = %s
              AND c.id = %s
            LIMIT 1;
        """

        cursor.execute(query, (admin_user_id, carrera_id))
        row = cursor.fetchone()

        cursor.close()
        connection.close()

        return row

    @staticmethod
    def set_activa_for_admin(admin_user_id, carrera_id, activa):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            return False

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            exists_query = """
                SELECT id
                FROM carrera
                WHERE id = %s
                  AND institucion_id = %s
                LIMIT 1;
            """

            cursor.execute(exists_query, (carrera_id, institucion_id))
            exists_row = cursor.fetchone()

            if exists_row is None:
                return False

            update_query = """
                UPDATE carrera
                SET activa = %s
                WHERE id = %s
                  AND institucion_id = %s;
            """

            cursor.execute(update_query, (activa, carrera_id, institucion_id))
            connection.commit()

            return True

        except mysql.connector.Error as error:
            connection.rollback()
            raise error

        finally:
            cursor.close()
            connection.close()

    @staticmethod
    def update_nombre_for_admin(admin_user_id, carrera_id, nombre):
        institucion_id = CarreraModel.find_institucion_id_by_user_id(admin_user_id)

        if not institucion_id:
            return None

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            exists_query = """
                SELECT id
                FROM carrera
                WHERE id = %s
                  AND institucion_id = %s
                LIMIT 1;
            """

            cursor.execute(exists_query, (carrera_id, institucion_id))
            exists_row = cursor.fetchone()

            if exists_row is None:
                return None

            update_query = """
                UPDATE carrera
                SET nombre = %s
                WHERE id = %s
                  AND institucion_id = %s;
            """

            cursor.execute(update_query, (nombre, carrera_id, institucion_id))
            connection.commit()

            return {
                "id": carrera_id,
                "nombre": nombre,
            }

        except mysql.connector.Error as error:
            connection.rollback()
            raise error

        finally:
            cursor.close()
            connection.close()