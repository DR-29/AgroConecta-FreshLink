**Versión 1.0**
**Documento de análisis de requerimientos**

# Introducción

AgroConecta es una plataforma orientada a conectar productores del campo, tiendas compradoras y transportistas registrados para optimizar la comercialización de productos agrícolas y el proceso logístico.

# Planteamiento del problema

Los pequeños productores tienen dificultades para comercializar sus productos de manera directa, mientras que las tiendas encuentran obstáculos para identificar proveedores confiables y coordinar el transporte.

# Justificación

La plataforma reducirá intermediarios, mejorará la trazabilidad de los pedidos y facilitará la logística mediante transportistas registrados.

# Objetivo general

Desarrollar una plataforma web que integre productores, tiendas y transportistas para gestionar productos, pedidos, pagos y entregas.

# Objetivos específicos

- Facilitar el registro de actores.
- Gestionar productos y pedidos.
- Integrar transportistas.
- Permitir seguimiento en tiempo real.
- Generar reportes e indicadores.

# Alcance

Incluye autenticación, gestión de productos, pedidos, transporte, pagos, geolocalización, mensajería, reportes y administración.

# Actores

- Administrador
- Productor
- Tienda
- Transportista

# Requerimientos funcionales

## Autenticación

RF-01. Registrar productores, tiendas y transportistas.

RF-02. Inicio de sesión.

RF-03. Recuperar contraseña.

RF-04. Editar perfil.

## Productor

RF-05. Registrar finca.

RF-06. Publicar productos.

RF-07. Gestionar inventario y precios.

RF-08. Aceptar pedidos.

RF-09. Seleccionar transportista registrado y disponibles.

## Tienda

RF-10. Buscar productos.

RF-11. Realizar pedidos.

RF-12. Seguimiento.

RF-13. Calificar productor y transportista.

## Transportista

RF-14. Registrar vehículo.

RF-15. Listar solicitudes de productores.

RF-16. Aceptar/rechazar servicios.

RF-17. Compartir ubicación.

RF-18. Actualizar estado de entrega.

RF-19. Listar servicios aceptados.

## Administrador

RF-20. Gestionar usuarios.

RF-21. Gestionar productos.

RF-22. Gestionar reportes.

RF-23. Gestionar reclamaciones.

# Requerimientos no funcionales

- Disponibilidad 24/7.
- Comunicación mediante HTTPS.
- Contraseñas cifradas.
- Tiempo de respuesta menor a 3 segundos.
- Diseño adaptable a dispositivos móviles.
- Copias de seguridad periódicas.
- Escalabilidad del sistema.

# Reglas de negocio

- Solo transportistas aprobados podrán recibir solicitudes.
- Un pedido solo podrá tener un transportista activo.
- El productor elige el transportista.
- Las tiendas califican al productor y al transportista al finalizar la entrega.

# Historias de usuario (ejemplos)

- Como productor quiero publicar mis productos para venderlos a las tiendas.
- Como tienda quiero buscar proveedores cercanos para reducir costos.
- Como productor quiero elegir un transportista registrado para asegurar una entrega confiable.
- Como transportista quiero aceptar solicitudes para generar ingresos.

# Diagramas propuestos

- Diagrama de casos de uso.
- Diagrama de clases.
- Diagrama entidad-relación.
- Diagrama de actividades.
- Arquitectura del sistema.

# Funcionalidades innovadoras

- Subastas de cosechas.
- Compras colaborativas.
- Optimización de rutas.
- Alertas inteligentes.
- Panel de indicadores.


## Design System recomendado

**Terra** (Google Stitch)

**Justificación** - Representa agricultura, sostenibilidad y
crecimiento. - Transmite confianza y modernidad. - Adecuado para
productores, tiendas y transportistas.

## Paleta de colores

  Uso                Color              Hex
  ------------------ ------------------ -----------
  Primario           Verde bosque       `#2E7D32`
  Primario oscuro    Verde profundo     `#1B5E20`
  Secundario         Amarillo cosecha   `#F9A825`
  Acento             Azul transporte    `#1976D2`
  Fondo              Gris muy claro     `#F5F7F5`
  Tarjetas           Blanco             `#FFFFFF`
  Texto principal    Gris oscuro        `#263238`
  Texto secundario   Gris               `#607D8B`

## Estados

  Estado       Color
  ------------ -----------
  Disponible   `#4CAF50`
  En camino    `#1E88E5`
  Pendiente    `#FBC02D`
  Cancelado    `#E53935`
  Entregado    `#2E7D32`

## Iconografía sugerida

-   Productores (campo, siembra)
-   Tiendas (comercio, retail)
-   Transportistas (logística de carga)
-   Pedidos (paquetes y despachos)
-   Geolocalización (mapas y rutas)
-   Reportes (métricas y analítica)

## Estilo visual

-   Material Design moderno.
-   Bordes redondeados (12--16 px).
-   Sombras suaves.
-   Mucho espacio en blanco.
-   Diseño responsive.
-   Dashboard con tarjetas e indicadores.

## Nota de implementacion actual

Este documento describe los requisitos y el alcance esperado. Para consultar las rutas y contratos actuales del backend, revisar `README.md` y los controladores y DTOs de `src/main/kotlin/com/freshlink`.

El backend actual incluye autenticacion JWT, autorizacion por rol, validaciones, manejo global de errores, aprobacion y disponibilidad de transportistas, solicitudes pendientes, historial de seguimiento, calificaciones condicionadas a pedidos entregados, reclamaciones y reportes.

Permanecen como pendientes o dependientes del despliegue: envio real de recuperacion por correo, pruebas automatizadas, pagos, mensajeria, tiempo real mediante WebSocket/SSE, HTTPS, backups y diseno responsive del frontend.



## Estructura de carpetas del proyecto para el Frontend

agroconecta-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── axiosInstance.js       # Axios + interceptor JWT
│   │   └── endpoints.js           # Organizado por dominio (authApi, productosApi...)
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── DashboardLayout.jsx   # Layout con Sidebar + <Outlet/>
│   │   │   ├── ProtectedRoute.jsx    # Guard por rol (allowedRoles)
│   │   │   ├── Loader.jsx
│   │   │   └── Modal.jsx
│   │   └── forms/
│   │       ├── InputField.jsx
│   │       └── SelectField.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── productor/
│   │   │   ├── MisFincasPage.jsx
│   │   │   ├── MisProductosPage.jsx
│   │   │   └── components/
│   │   │       ├── FincaCard.jsx
│   │   │       └── ProductoForm.jsx
│   │   ├── tienda/
│   │   │   ├── BuscarProductosPage.jsx
│   │   │   ├── PedidosPage.jsx
│   │   │   └── components/
│   │   ├── transportista/
│   │   │   ├── SolicitudesPage.jsx
│   │   │   ├── MisViajesPage.jsx
│   │   │   └── components/
│   │   ├── admin/
│   │   │   ├── UsuariosPage.jsx
│   │   │   ├── ReportesPage.jsx
│   │   │   └── components/
│   │   └── UnauthorizedPage.jsx      # Ruta /unauthorized
│   ├── contexts/
│   │   └── AuthContext.jsx           # Token + usuario + login/logout
│   ├── hooks/
│   │   ├── useAuth.js               # Hook para consumir AuthContext
│   │   └── useLocalStorage.js
│   ├── data/
│   │   ├── mockProductos.json
│   │   ├── mockFincas.json
│   │   └── mockPedidos.json
│   ├── App.jsx                       # Router con ProtectedRoute + DashboardLayout
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json


