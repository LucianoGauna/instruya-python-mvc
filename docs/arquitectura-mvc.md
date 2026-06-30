# Arquitectura MVC aplicada en el backend Python

## Objetivo de la migración

El objetivo del proyecto fue migrar el backend existente de Instruya, desarrollado originalmente con Node.js y Express, hacia un backend en Python utilizando Flask.

La migración se realizó manteniendo la misma base de datos, la misma lógica funcional y los mismos contratos de API, para que el frontend Angular existente pueda seguir funcionando sin modificaciones funcionales.

Para organizar el nuevo backend se aplicó una arquitectura MVC adaptada a una API REST.

---

## Aplicación de MVC en el backend Python

En este proyecto, la arquitectura MVC se organiza separando las responsabilidades principales del backend en carpetas específicas:

```text
backend/
  app/
    controllers/
    models/
    routes/
    services/
    middlewares/
    config.py
    database.py
    extensions.py
  run.py
```

### Model

La capa Model está representada por la carpeta:

```text
app/models/
```

En esta capa se definen las entidades y consultas relacionadas con la base de datos.

Los modelos representan tablas del sistema, como usuarios, carreras, materias, inscripciones y calificaciones. Además, concentran la lógica de acceso a datos utilizando SQLAlchemy.

Ejemplos:

```text
usuario_model.py
alumno_model.py
docente_model.py
materia_model.py
carrera_model.py
admin_model.py
superadmin_model.py
```

Responsabilidades principales de esta capa:

* Representar tablas de la base de datos.
* Realizar consultas.
* Insertar, actualizar o leer información.
* Encapsular el acceso a datos para que los controladores no trabajen directamente con SQL.

---

### View / Routes

Como el proyecto es una API REST y no una aplicación que renderiza HTML desde el servidor, la capa View no se implementa como templates visuales.

En este caso, la vista está representada por las rutas y las respuestas JSON que consume el frontend Angular.

La carpeta correspondiente es:

```text
app/routes/
```

Las rutas definen los endpoints disponibles y conectan cada URL con su controlador correspondiente.

Ejemplos:

```text
auth_routes.py
admin_routes.py
alumno_routes.py
docente_routes.py
superadmin_routes.py
health_routes.py
```

Responsabilidades principales de esta capa:

* Definir las URLs de la API.
* Definir el método HTTP correspondiente: GET, POST, PATCH, etc.
* Aplicar middlewares de autenticación y roles.
* Delegar la ejecución al controlador correspondiente.
* Exponer respuestas JSON al frontend.

---

### Controller

La capa Controller está representada por la carpeta:

```text
app/controllers/
```

Los controladores reciben la request, leen los datos enviados por el cliente, validan información básica y llaman a la capa de servicios para resolver la operación.

Ejemplos:

```text
auth_controller.py
admin_controller.py
alumno_controller.py
docente_controller.py
superadmin_controller.py
health_controller.py
```

Responsabilidades principales de esta capa:

* Recibir la request.
* Obtener datos desde el body, parámetros de ruta o usuario autenticado.
* Validar datos básicos.
* Llamar al servicio correspondiente.
* Devolver una respuesta JSON con el código HTTP adecuado.

---

### Services

Además de MVC, el backend incluye una capa de servicios ubicada en:

```text
app/services/
```

Esta capa no reemplaza MVC, sino que ayuda a separar mejor la lógica de negocio.

Los servicios se ubican entre los controladores y los modelos.

Responsabilidades principales:

* Coordinar operaciones de negocio.
* Aplicar reglas funcionales.
* Llamar a uno o más modelos.
* Evitar que los controladores tengan demasiada lógica.

Ejemplos:

```text
auth_service.py
alumno_service.py
docente_service.py
admin_service.py
superadmin_service.py
```

---

## Flujo general de una request

El flujo general de una request en el backend Python es el siguiente:

```text
Frontend Angular
      ↓
Route
      ↓
Middleware
      ↓
Controller
      ↓
Service
      ↓
Model
      ↓
Base de datos
      ↓
Respuesta JSON
```

1. El frontend Angular realiza una petición HTTP.
2. Flask recibe la request mediante una ruta definida en `app/routes/`.
3. Si corresponde, se ejecutan los middlewares de autenticación y autorización.
4. La ruta llama al método correspondiente del controlador.
5. El controlador valida los datos básicos y llama al servicio.
6. El servicio aplica la lógica de negocio.
7. El modelo consulta o modifica la base de datos.
8. El resultado vuelve hacia el controlador.
9. El backend responde al frontend con JSON y un código HTTP.

---

## Ejemplo 1: Login

El login permite que un usuario se autentique en el sistema.

### Endpoint

```text
POST /auth/login
```

### Flujo

```text
Frontend Angular
      ↓
auth_routes.py
      ↓
AuthController
      ↓
AuthService
      ↓
UsuarioModel
      ↓
Tabla usuario
      ↓
Respuesta con token JWT
```

### Descripción del flujo

1. El frontend envía un email y una contraseña al endpoint `/auth/login`.
2. La ruta `auth_routes.py` recibe la petición.
3. La ruta delega el procesamiento al `AuthController`.
4. El controlador obtiene los datos enviados en el body.
5. El controlador llama a `AuthService.login()`.
6. El servicio busca el usuario por email mediante `UsuarioModel`.
7. Si el usuario existe y está activo, se valida la contraseña usando bcrypt.
8. Si la contraseña es correcta, se genera un token JWT.
9. El backend responde con el token y los datos básicos del usuario.

### Respuesta esperada

```json
{
  "token": "jwt_generado",
  "user": {
    "id": 1,
    "email": "usuario@email.com",
    "rol": "ALUMNO"
  }
}
```

Este flujo mantiene el comportamiento del backend anterior, permitiendo que el frontend Angular continúe utilizando el mismo proceso de autenticación.

---

## Ejemplo 2: Alumno - Mis materias

Este endpoint permite que un alumno vea las materias en las que está inscripto.

### Endpoint

```text
GET /alumno/mis-materias
```

### Flujo

```text
Frontend Angular
      ↓
alumno_routes.py
      ↓
auth_required
      ↓
require_role(["ALUMNO"])
      ↓
AlumnoController
      ↓
AlumnoService
      ↓
AlumnoModel
      ↓
Tablas usuario, materia, carrera e inscripcion_materia
      ↓
Respuesta JSON
```

### Descripción del flujo

1. El frontend realiza una petición GET al endpoint `/alumno/mis-materias`.
2. La ruta correspondiente se encuentra en `alumno_routes.py`.
3. Antes de ejecutar el controlador, se valida que el usuario tenga un token válido mediante el middleware de autenticación.
4. Luego se verifica que el usuario tenga rol `ALUMNO`.
5. Si el usuario está autenticado y autorizado, se llama al controlador de alumno.
6. El controlador obtiene el ID del usuario autenticado desde el token.
7. El controlador llama al servicio de alumno.
8. El servicio delega la consulta al modelo correspondiente.
9. El modelo obtiene las materias asociadas al alumno desde la base de datos.
10. El backend responde con un JSON que contiene las materias del alumno.

### Respuesta esperada

```json
{
  "ok": true,
  "materias": [
    {
      "materia_id": 1,
      "materia_nombre": "Programación I",
      "carrera_id": 1,
      "carrera_nombre": "Tecnicatura en Programación",
      "estado": "ACEPTADA"
    }
  ]
}
```

Este endpoint muestra cómo se combinan autenticación, autorización por rol, controladores, servicios y modelos para resolver una operación funcional del sistema.

---

## Comparación con el backend anterior

El backend anterior estaba desarrollado con Node.js y Express. La nueva versión utiliza Python con Flask, pero mantiene la misma idea general de separación de responsabilidades.

### Backend anterior: Node.js / Express

En el backend anterior:

* Express definía las rutas.
* Los controladores procesaban las requests.
* Los servicios concentraban la lógica de negocio.
* Los modelos o consultas accedían a la base de datos MySQL.
* El frontend consumía endpoints REST y recibía respuestas JSON.

### Backend nuevo: Python / Flask

En el backend nuevo:

* Flask define la aplicación principal.
* Los Blueprints organizan las rutas por módulo.
* Los controladores procesan las requests.
* Los servicios concentran la lógica de negocio.
* Los modelos con SQLAlchemy acceden a la base de datos MySQL.
* El frontend consume los mismos endpoints REST y recibe respuestas JSON.

### Diferencias principales

La principal diferencia está en la tecnología utilizada.

El backend anterior usaba JavaScript/TypeScript con Express, mientras que el backend nuevo utiliza Python con Flask.

Además, en el backend Python se aplicó una estructura MVC explícita mediante carpetas separadas para rutas, controladores, servicios y modelos.

### Similitudes principales

Ambos backends mantienen:

* API REST.
* Respuestas JSON.
* Autenticación con JWT.
* Control de roles.
* Separación entre rutas, controladores, servicios y acceso a datos.
* Misma base de datos.
* Mismos contratos de API para que el frontend Angular pueda seguir funcionando.

---

## Conclusión

La arquitectura MVC aplicada en el backend Python permitió organizar el proyecto de forma clara y mantenible.

La capa de rutas representa la entrada de las requests y la respuesta JSON hacia el frontend. Los controladores se encargan de procesar cada petición. Los servicios concentran la lógica funcional del sistema. Los modelos representan y consultan la base de datos.

Gracias a esta separación, el backend pudo migrarse desde Express a Flask manteniendo el comportamiento esperado por el frontend Angular y respetando los contratos definidos en el sistema original.
