from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return {
        "ok": True,
        "message": "API Instruya Python MVC funcionando"
    }, 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)