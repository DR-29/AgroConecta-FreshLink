# Control de Tareas y Hoja de Ruta - Parcial I (AgroConecta)

> **Documento de seguimiento:** Estado de cumplimiento de la guía docente de FastAPI/PostgreSQL y los requerimientos del examen.

---

## 📋 Lista de Tareas (TODO)

### ✅ Fase 1: Arquitectura Modular y Estructura de Carpetas (COMPLETADO)
- [x] **Reubicar `main.py` a la raíz:** Movido a `api-fastapi/main.py` para permitir la ejecución con `uvicorn main:app --reload`.
- [x] **Creación de la capa `repositories/`:** Creada la carpeta `app/repositories/` con clases repositorio usando **SQL puro** (`RealDictCursor`).
  - [x] `usuario_repo.py`
  - [x] `finca_repo.py`
  - [x] `catalogo_repo.py`
  - [x] `pedido_repo.py`
  - [x] `logistica_repo.py`
  - [x] `seguridad_repo.py`
  - [x] `__init__.py`
- [x] **Modularización de Pydantic en `models/`:** Esquemas Pydantic ubicados en `app/models/` según el estándar de la guía de clase.
- [x] **Paquetes `__init__.py`:** Agregados en `app/`, `app/api/`, `app/core/`, `app/models/` y `app/repositories/`.
- [x] **Conexión Neon en `app/core/database.py`:** Clase `Database` idéntica a la página 15 de la guía.
- [x] **Variables individuales en `.env`:** Declaradas `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`.
- [x] **Suite de pruebas:** 7/7 tests e2e pasando en verde (`pytest`).
- [x] **Control de versiones:** Commit `aa98fbb` subido exitosamente a GitHub (`origin/main`).

---

### ✅ Fase 2: Conexión de Rutas con Repositorios (COMPLETADO)
- [x] **Desacoplar consultas directas en los controladores:** Los routers de `app/api/v1/` ahora instancian y delegan las operaciones a sus respectivos repositorios:
  - [x] `fincas.py` -> `FincaRepository` (`obtener_todos`, `obtener_por_id`, `crear`, `actualizar`, `eliminar`)
  - [x] `catalogo.py` -> `CatalogoRepository` y `FincaRepository`
  - [x] `usuarios.py` -> `UsuarioRepository` y `SeguridadRepository`
  - [x] `pedidos.py` -> `PedidoRepository` (`obtener_pedidos`, `obtener_por_id`, `actualizar_estado`)
  - [x] `logistica.py` -> `LogisticaRepository` (`obtener_vehiculos`, `crear_vehiculo`)
  - [x] `seguridad.py` -> `SeguridadRepository` (`obtener_modulos`, `obtener_permisos_por_rol`)
  - [x] `auth.py` -> `UsuarioRepository` (`obtener_por_correo`, `obtener_por_documento`, `crear`)
- [x] **Compatibilidad 100% con Frontend React:** Las firmas y contratos de respuesta JSON no sufrieron ninguna alteración.
- [x] **Suite de pruebas:** 7/7 tests e2e pasando exitosamente.

---

### ⚪ Fase 3: Entidad de Demostración (`Estudiantes`) - RESUELTO
- [x] **Confirmado:** `estudiantes` fue únicamente el ejemplo pedagógico de la guía. El parcial se evalúa sobre las entidades completas del proyecto **AgroConecta** (13 tablas con roles, usuarios, fincas, productos, pedidos, logística).

---

### ⏳ Fase 4: Pruebas en Vivo (Swagger UI y Neon)
- [ ] **Ejecución local:** Levantar el servidor con `uvicorn main:app --reload`.
- [ ] **Pruebas en Swagger (`/docs`):**
  - [ ] Ejecutar `POST` para insertar un nuevo registro.
  - [ ] Ejecutar `GET` para listar registros activos (`WHERE estado = 1`).
  - [ ] Ejecutar `PUT` para actualizar información.
  - [ ] Ejecutar `DELETE` para verificar el borrado lógico (`estado = 0`).
- [ ] **Verificación en Consola Neon:** Confirmar que los cambios se reflejan inmediatamente en las tablas remotas de Neon PostgreSQL.

---

### ⏳ Fase 5: Entrega y Despliegues
- [ ] **API Principal (FastAPI):** Verificar despliegue en la nube (Render / Railway / Koyeb).
- [ ] **API Auxiliar (Express + MySQL):** Verificar las 3 tablas mínimas requeridas por el parcial y su despliegue.
- [ ] **Documentación:** Validar `RESUMEN_PROPUESTA.md` (Problemática, Población, Requerimientos).

---

## 🔮 Fase 6 (Futura): Integración de Svelte
- [ ] Crear cliente frontend en Svelte con Vite (`frontend-svelte`).
- [ ] Conectar consumo de endpoints `/api/v1` mediante `fetch` nativo.
