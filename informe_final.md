# Informe final de evaluación - Diego Rafael Fernandez Gonzalez

## Nota final: 3.6 / 5.0

La aplicación Spring Boot/Kotlin pudo arrancar con `bootRun` en un entorno aislado usando Java 17, H2 en memoria y puerto 18080. Se probaron solicitudes HTTP reales sobre autenticación, usuarios, productor, tienda, transportista y administración. El backend tiene una estructura por capas razonable (`controller`, `service`, `repository`, `model`, `dto`, `config`, `exception`) y varios flujos CRUD/dominio responden correctamente.

La nota se ve limitada por evidencias verificables: la autorización por roles es insuficiente porque solo protege `/api/admin/**`; las validaciones declaradas no se aplican en varios DTOs Kotlin, permitiendo datos inválidos con HTTP 200; algunas reglas de negocio del documento no están implementadas o no son completas, como pagos, mensajería, aprobación de transportistas, HTTPS/backups y seguimiento realmente en tiempo real. Además, el `bootJar` no compila con el wrapper incluido por incompatibilidad Gradle/Spring Boot, aunque `compileKotlin`, `bootRun` y el arranque real sí funcionaron con Java 17.

## Integrantes confirmados

Según `INTEGRANTES.txt` en la carpeta de requisitos correcta, los integrantes confirmados son: DILIA JAIDITH ARAGON ALEMAN y DIEGO RAFAEL FERNANDEZ GONZALEZ.

## Evidencia técnica

- Compilación con Java 25: bloqueada por entorno (`IllegalArgumentException: 25.0.4`) al usar Kotlin 1.9.21.
- Compilación con Java 17 temporal: `compileKotlin` exitoso.
- `clean build -x test`: falla en `bootJar` por `CopyProcessingSpec.getDirMode()`, compatible con incompatibilidad del plugin Spring Boot 3.2.0 frente al Gradle 9.5.1 del wrapper.
- Arranque real: exitoso mediante `bootRun` en `http://localhost:18080`.
- Pruebas automatizadas: no existen (`test NO-SOURCE`).
- Base de datos de evaluación: H2 en memoria, datos iniciales generados por `DataInitializer` y datos ficticios temporales creados vía API.

## Puntos positivos

- Arquitectura organizada por capas y paquetes esperados.
- Uso de Spring Security, JWT, JPA, DTOs, repositorios y servicios.
- Datos iniciales útiles para probar roles y flujos.
- CRUD parcial de productos/fincas/vehículos y flujos de pedidos, calificaciones, reclamos y reportes funcionan con HTTP 200.
- Manejo de errores de negocio con `ApiException` para casos como stock insuficiente, entidades inexistentes y acceso a pedidos ajenos.

## Puntos de mejora

- Corregir autorización por roles para `/api/productor/**`, `/api/tienda/**` y `/api/transportista/**`.
- Usar anotaciones Kotlin con `@field:NotBlank`, `@field:Positive`, `@field:Min`, `@field:Max`, `@field:Email` para que Bean Validation funcione.
- Añadir manejo global para errores no controlados, especialmente enums inválidos y errores de integridad.
- Ajustar wrapper/plugin Gradle o Spring Boot para que `bootJar` compile sin intervención.
- Agregar pruebas automatizadas reales de servicios, controladores, seguridad y validaciones.

## Cumplimiento de requisitos

Documento usado: `/Users/djruiz/Downloads/Documento de requqrimeinto/Dilia Jaidith Aragon Aleman_7159440_assignsubmission_file/Requerimientos_AgroConecta_Corregido.docx`.

| Requisito AgroConecta | Estado | Evidencia |
|---|---|---|
| RF-01 Registrar productores, tiendas y transportistas | Parcial | `POST /api/auth/register` funciona, pero aceptó email inválido, nombre vacío y password vacío por validación defectuosa. |
| RF-02 Inicio de sesión | Cumple | `POST /api/auth/login` devolvió JWT para ADMIN, PRODUCTOR, TIENDA y TRANSPORTISTA; credencial incorrecta fue rechazada. |
| RF-03 Recuperar contraseña | Parcial | `forgot-password` genera token y responde, pero lo imprime en consola y no integra envío real verificable. |
| RF-04 Editar perfil | Cumple | `GET/PUT /api/users/me` funcionaron con JWT. |
| RF-05 Registrar finca | Parcial | Endpoint funciona, pero permitió nombre vacío y roles no productores. |
| RF-06 Publicar productos | Parcial | Endpoint funciona, pero permitió nombre vacío, precio negativo y stock negativo. |
| RF-07 Gestionar inventario y precios | Parcial | `PUT /api/productor/productos/{id}` y `PATCH /stock` funcionaron; faltan validaciones sólidas. |
| RF-08 Aceptar pedidos | Cumple | `POST /api/productor/pedidos/{id}/aceptar` funcionó sobre pedido temporal. |
| RF-09 Seleccionar transportista registrado y disponible | Parcial | Selecciona usuario con rol TRANSPORTISTA, pero no verifica aprobación/disponibilidad real. |
| RF-10 Buscar productos | Cumple | `GET /api/tienda/productos` y búsqueda por término funcionaron. |
| RF-11 Realizar pedidos | Cumple | Pedido temporal creado y stock insuficiente devolvió 400. |
| RF-12 Seguimiento | Parcial | `GET /api/tienda/pedidos/{id}/seguimiento` devuelve estado, pero no es seguimiento en tiempo real. |
| RF-13 Calificar productor y transportista | Parcial | Endpoint crea calificaciones, pero aceptó puntuación 7 pese a rango 1-5. |
| RF-14 Registrar vehículo | Parcial | Endpoint funciona, pero aceptó tipo y placa vacíos; una TIENDA también pudo registrar vehículo. |
| RF-15 Listar solicitudes de productores | Cumple parcial | `GET /api/transportista/solicitudes` responde; el flujo probado autoacepta solicitud al seleccionar transportista. |
| RF-16 Aceptar/rechazar servicios | Parcial | Endpoints existen y manejan 404, pero no se verificó flujo pendiente real porque selección del productor deja solicitud aceptada. |
| RF-17 Compartir ubicación | Cumple | `POST /api/transportista/ubicacion` funcionó. |
| RF-18 Actualizar estado de entrega | Parcial | Estado `ENTREGADO` funcionó; estado enum inválido no tiene manejo de error consistente. |
| RF-19 Listar servicios aceptados | Cumple | `GET /api/transportista/servicios` funcionó con transportista asignado. |
| RF-20 Gestionar usuarios | Cumple | Admin listó usuarios y alternó `enabled`. |
| RF-21 Gestionar productos | Parcial | Admin lista productos; eliminar producto referenciado por pedido falló por integridad/manejo de error. |
| RF-22 Gestionar reportes | Cumple | Reportes de usuarios, pedidos y calificaciones respondieron 200. |
| RF-23 Gestionar reclamaciones | Cumple | Tienda creó reclamación y admin la resolvió. |
| Pagos | Falla | El alcance lo menciona, pero no hay endpoints/modelos de pago. |
| Mensajería | Falla | El alcance lo menciona, pero no hay endpoints/modelos de mensajería. |
| HTTPS, backups, diseño móvil | No verificable | Son condiciones de despliegue/frontend no verificables en este backend aislado. |

## Comparación con proyecto de referencia

El proyecto de referencia `TaskServerKotlin` documenta una base con paquetes claros, validación, seguridad, excepciones, roles y prácticas transversales. FreshLink se acerca en estructura de paquetes y uso de DTOs/repositorios/servicios, pero queda por debajo en consistencia de build, validación efectiva, pruebas y definición granular de autorización por rol.

## Justificación de la nota

Se reconoce ejecución real del backend, persistencia funcional y una cobertura amplia de los RF-01 a RF-23 del documento AgroConecta. La calificación no sube más por fallas reales de seguridad/validación, ausencia de pruebas automatizadas, `bootJar` roto con el wrapper entregado y requisitos parciales o faltantes como pagos, mensajería, aprobación/disponibilidad de transportistas y seguimiento realmente en tiempo real. Por eso la calificación queda en **3.6/5.0**.
