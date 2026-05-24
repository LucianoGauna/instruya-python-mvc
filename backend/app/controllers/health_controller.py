from app.database import get_connection

class HealthController:
    @staticmethod
    def health():
        return {
            "ok": True,
            "message": "API Instruya Python MVC funcionando"
        }, 200
    
    @staticmethod
    def database_health():
        try:
            connection = get_connection()
            cursor = connection.cursor(dictionary=True)

            cursor.execute("SELECT DATABASE() AS database_name;")
            result = cursor.fetchone()

            cursor.close()
            connection.close()

            return {
                "ok": True,
                "message": "Conexión a MySQL funcionando",
                "database": result["database_name"]
            }, 200

        except Exception as error:
            return {
                "ok": False,
                "message": "Error al conectar con MySQL",
                "error": str(error)
            }, 500