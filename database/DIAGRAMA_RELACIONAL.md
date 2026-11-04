# Diagrama Relacional de Base de Datos — AgroConecta (FreshLink)

**Proyecto:** AgroConecta (FreshLink)  
**Asignatura:** Desarrollo Web / Taller 1 & Parcial 1 Corte 2  
**Docente:** Mg. Bryan Fernandez Ebrath  
**Comisión:** 11  

---

## 1. Diagrama Entidad-Relación (PostgreSQL Neon - 13 Tablas Normalizadas)

```mermaid
erDiagram
    ROL ||--o{ USUARIO : "tiene asignado"
    ROL ||--o{ MODULOXROL : "posee permisos en"
    MODULO ||--o{ MODULOXROL : "autorizado para"
    
    USUARIO ||--o{ FINCA : "posee (Productor)"
    USUARIO ||--o{ PEDIDO : "emite (Tienda)"
    USUARIO ||--o{ VEHICULO : "conduce (Transportista)"
    USUARIO ||--o{ SOLICITUD_TRANSPORTE : "asigna/atiende"
    USUARIO ||--o{ CALIFICACION : "califica/es calificado"
    USUARIO ||--o{ HISTORIAL_PEDIDO_ESTADO : "registra cambio"

    FINCA ||--o{ PRODUCTO : "cultiva"
    CATEGORIA_PRODUCTO ||--o{ PRODUCTO : "clasifica"

    PRODUCTO ||--o{ PEDIDO_ITEM : "incluido en"
    PEDIDO ||--|{ PEDIDO_ITEM : "contiene"
    
    PEDIDO ||--o{ SOLICITUD_TRANSPORTE : "requiere despacho"
    VEHICULO ||--o{ SOLICITUD_TRANSPORTE : "transporta con"
    
    PEDIDO ||--o{ CALIFICACION : "evaluado en"
    PEDIDO ||--o{ HISTORIAL_PEDIDO_ESTADO : "registra trazabilidad"

    ROL {
        int id_rol PK
        varchar nombre UK
        text descripcion
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    USUARIO {
        int id_usuario PK
        varchar documento UK
        varchar nombres
        varchar apellidos
        varchar correo UK
        varchar contrasena_hash
        varchar telefono
        varchar direccion
        int id_rol FK
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    MODULO {
        int id_modulo PK
        varchar codigo UK
        varchar nombre
        varchar ruta
        varchar icono
        int orden
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    MODULOXROL {
        int id_moduloxrol PK
        int id_rol FK
        int id_modulo FK
        boolean puede_crear
        boolean puede_leer
        boolean puede_actualizar
        boolean puede_eliminar
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    FINCA {
        int id_finca PK
        int id_productor FK
        varchar nombre
        varchar departamento
        varchar municipio
        varchar vereda
        numeric hectareas
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    CATEGORIA_PRODUCTO {
        int id_categoria PK
        varchar nombre UK
        text descripcion
        varchar icono
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    PRODUCTO {
        int id_producto PK
        int id_finca FK
        int id_categoria FK
        varchar nombre
        text descripcion
        varchar unidad_medida
        numeric precio_unitario
        numeric stock_disponible
        text imagen_url
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    PEDIDO {
        int id_pedido PK
        varchar codigo_pedido UK
        int id_tienda FK
        varchar direccion_entrega
        varchar municipio_entrega
        varchar estado_pedido
        numeric total
        text notas
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    PEDIDO_ITEM {
        int id_pedido_item PK
        int id_pedido FK
        int id_producto FK
        numeric cantidad
        numeric precio_unitario
        numeric subtotal
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    VEHICULO {
        int id_vehiculo PK
        int id_transportista FK
        varchar placa UK
        varchar modelo
        numeric capacidad_toneladas
        varchar tipo_carroceria
        boolean aprobado_admin
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    SOLICITUD_TRANSPORTE {
        int id_solicitud PK
        varchar codigo_seguimiento UK
        int id_pedido FK
        int id_transportista FK
        int id_vehiculo FK
        varchar estado_solicitud
        numeric costo_transporte
        text observaciones
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    CALIFICACION {
        int id_calificacion PK
        int id_pedido FK
        int id_calificador FK
        int id_calificado FK
        int puntuacion
        text comentario
        smallint estado
        timestamp creado
        timestamp actualizado
    }

    HISTORIAL_PEDIDO_ESTADO {
        int id_historial PK
        int id_pedido FK
        int id_usuario_cambio FK
        varchar estado_anterior
        varchar estado_nuevo
        text comentario
        smallint estado
        timestamp creado
        timestamp actualizado
    }
```

---

## 2. Diagrama Entidad-Relación (MySQL Aiven - 3 Tablas Auxiliares)

```mermaid
erDiagram
    METODO_PAGO ||--o{ TRANSACCION_PAGO : "procesa"
    TRANSACCION_PAGO ||--|| COMPROBANTE_FACTURA : "genera (1 a 1)"

    METODO_PAGO {
        int id_metodo PK
        varchar codigo UK
        varchar nombre
        text descripcion
        tinyint estado
        timestamp creado
        timestamp actualizado
    }

    TRANSACCION_PAGO {
        int id_transaccion PK
        int id_pedido
        int id_metodo FK
        varchar referencia_pago UK
        decimal monto_total
        varchar estado_pago
        timestamp creado
        timestamp actualizado
    }

    COMPROBANTE_FACTURA {
        int id_factura PK
        int id_transaccion FK
        varchar numero_factura UK
        varchar nit_emisor
        varchar razon_social_emisor
        decimal subtotal
        decimal iva
        decimal total
        text url_pdf
        tinyint estado
        timestamp creado
        timestamp actualizado
    }
```

---

## 3. Matriz de Auditoría y Borrado Lógico

Todas las tablas en ambos motores de base de datos implementan rigurosamente:

* **`estado`:** Control de borrado lógico (`1` = Activo / Visible en frontend, `0` = Inactivo / Dado de baja lógica). Los registros nunca se destruyen físicamente (`DELETE FROM` prohibido).
* **`creado`:** Marca de tiempo generada automáticamente en el `INSERT`.
* **`actualizado`:** Marca de tiempo actualizada automáticamente en cada `UPDATE` vía triggers de base de datos (`actualizar_timestamp_trigger()`).

