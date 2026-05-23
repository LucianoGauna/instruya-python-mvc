class HealthController:
    @staticmethod
    def health():
        return {
            "ok": True,
            "message": "API Instruya Python MVC funcionando"
        }, 200