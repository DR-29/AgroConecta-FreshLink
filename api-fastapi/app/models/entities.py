from sqlalchemy import (
    Column, Integer, String, Text, Numeric, Boolean,
    ForeignKey, DateTime, UniqueConstraint, func
)
from sqlalchemy.orm import relationship
from app.core.database import Base

# 1. Rol
class Rol(Base):
    __tablename__ = "rol"

    id_rol = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False, unique=True, index=True)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    usuarios = relationship("Usuario", back_populates="rol")
    modulos = relationship("ModuloXRol", back_populates="rol")

# 2. Usuario
class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, index=True)
    id_rol = Column(Integer, ForeignKey("rol.id_rol"), nullable=False)
    documento = Column(String(30), nullable=False, unique=True, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    correo = Column(String(150), nullable=False, unique=True, index=True)
    telefono = Column(String(30), nullable=True)
    direccion = Column(String(200), nullable=True)
    contrasena_hash = Column(String(255), nullable=False)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    rol = relationship("Rol", back_populates="usuarios")
    fincas = relationship("Finca", back_populates="productor")
    pedidos = relationship("Pedido", back_populates="tienda")
    vehiculos = relationship("Vehiculo", back_populates="transportista")

# 3. Modulo
class Modulo(Base):
    __tablename__ = "modulo"

    id_modulo = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), nullable=False, unique=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255), nullable=True)
    ruta = Column(String(100), nullable=False)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    roles = relationship("ModuloXRol", back_populates="modulo")

# 4. ModuloXRol (RBAC)
class ModuloXRol(Base):
    __tablename__ = "moduloxrol"

    id_moduloxrol = Column(Integer, primary_key=True, index=True)
    id_rol = Column(Integer, ForeignKey("rol.id_rol"), nullable=False)
    id_modulo = Column(Integer, ForeignKey("modulo.id_modulo"), nullable=False)
    puede_crear = Column(Boolean, nullable=False, default=True)
    puede_leer = Column(Boolean, nullable=False, default=True)
    puede_actualizar = Column(Boolean, nullable=False, default=True)
    puede_eliminar = Column(Boolean, nullable=False, default=False)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("id_rol", "id_modulo", name="uq_moduloxrol"),)

    rol = relationship("Rol", back_populates="modulos")
    modulo = relationship("Modulo", back_populates="roles")

# 5. Finca
class Finca(Base):
    __tablename__ = "finca"

    id_finca = Column(Integer, primary_key=True, index=True)
    id_productor = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    nombre = Column(String(120), nullable=False)
    departamento = Column(String(80), nullable=False)
    municipio = Column(String(80), nullable=False)
    vereda = Column(String(120), nullable=True)
    area_hectareas = Column(Numeric(8, 2), nullable=True)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("id_productor", "nombre", name="uq_productor_finca"),)

    productor = relationship("Usuario", back_populates="fincas")
    productos = relationship("Producto", back_populates="finca")

# 6. CategoriaProducto
class CategoriaProducto(Base):
    __tablename__ = "categoria_producto"

    id_categoria = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(80), nullable=False, unique=True)
    descripcion = Column(String(255), nullable=True)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    productos = relationship("Producto", back_populates="categoria")

# 7. Producto
class Producto(Base):
    __tablename__ = "producto"

    id_producto = Column(Integer, primary_key=True, index=True)
    id_finca = Column(Integer, ForeignKey("finca.id_finca"), nullable=False)
    id_categoria = Column(Integer, ForeignKey("categoria_producto.id_categoria"), nullable=False)
    nombre = Column(String(120), nullable=False)
    descripcion = Column(Text, nullable=True)
    unidad_medida = Column(String(30), nullable=False, default="KG")
    precio_unitario = Column(Numeric(12, 2), nullable=False)
    stock_disponible = Column(Numeric(10, 2), nullable=False, default=0)
    imagen_url = Column(String(255), nullable=True)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    finca = relationship("Finca", back_populates="productos")
    categoria = relationship("CategoriaProducto", back_populates="productos")
    pedido_items = relationship("PedidoItem", back_populates="producto")

# 8. Pedido
class Pedido(Base):
    __tablename__ = "pedido"

    id_pedido = Column(Integer, primary_key=True, index=True)
    codigo_pedido = Column(String(30), nullable=False, unique=True, index=True)
    id_tienda = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    direccion_entrega = Column(String(200), nullable=False)
    municipio_entrega = Column(String(80), nullable=False)
    estado_pedido = Column(String(30), nullable=False, default="PENDIENTE")
    total = Column(Numeric(12, 2), nullable=False, default=0)
    notas = Column(Text, nullable=True)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    tienda = relationship("Usuario", back_populates="pedidos")
    items = relationship("PedidoItem", back_populates="pedido", cascade="all, delete-orphan")
    solicitud = relationship("SolicitudTransporte", back_populates="pedido", uselist=False)
    historial = relationship("HistorialPedidoEstado", back_populates="pedido", cascade="all, delete-orphan")

# 9. PedidoItem
class PedidoItem(Base):
    __tablename__ = "pedido_item"

    id_pedido_item = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedido.id_pedido"), nullable=False)
    id_producto = Column(Integer, ForeignKey("producto.id_producto"), nullable=False)
    cantidad = Column(Numeric(10, 2), nullable=False)
    precio_unitario = Column(Numeric(12, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("id_pedido", "id_producto", name="uq_pedido_producto"),)

    pedido = relationship("Pedido", back_populates="items")
    producto = relationship("Producto", back_populates="pedido_items")

# 10. Vehiculo
class Vehiculo(Base):
    __tablename__ = "vehiculo"

    id_vehiculo = Column(Integer, primary_key=True, index=True)
    id_transportista = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    placa = Column(String(15), nullable=False, unique=True, index=True)
    modelo = Column(String(50), nullable=True)
    capacidad_toneladas = Column(Numeric(6, 2), nullable=False)
    tipo_carroceria = Column(String(60), nullable=False)
    aprobado_admin = Column(Boolean, nullable=False, default=False)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    transportista = relationship("Usuario", back_populates="vehiculos")

# 11. SolicitudTransporte
class SolicitudTransporte(Base):
    __tablename__ = "solicitud_transporte"

    id_solicitud = Column(Integer, primary_key=True, index=True)
    codigo_seguimiento = Column(String(40), nullable=False, unique=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedido.id_pedido"), nullable=False)
    id_transportista = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=True)
    id_vehiculo = Column(Integer, ForeignKey("vehiculo.id_vehiculo"), nullable=True)
    estado_solicitud = Column(String(30), nullable=False, default="SOLICITADO")
    costo_transporte = Column(Numeric(12, 2), nullable=False, default=0)
    observaciones = Column(Text, nullable=True)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    pedido = relationship("Pedido", back_populates="solicitud")
    transportista = relationship("Usuario")
    vehiculo = relationship("Vehiculo")

# 12. Calificacion
class Calificacion(Base):
    __tablename__ = "calificacion"

    id_calificacion = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedido.id_pedido"), nullable=False)
    id_calificador = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    id_calificado = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    puntuacion = Column(Integer, nullable=False)
    comentario = Column(Text, nullable=True)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("id_pedido", "id_calificador", "id_calificado", name="uq_pedido_calificacion"),)

    pedido = relationship("Pedido")
    calificador = relationship("Usuario", foreign_keys=[id_calificador])
    calificado = relationship("Usuario", foreign_keys=[id_calificado])

# 13. HistorialPedidoEstado
class HistorialPedidoEstado(Base):
    __tablename__ = "historial_pedido_estado"

    id_historial = Column(Integer, primary_key=True, index=True)
    id_pedido = Column(Integer, ForeignKey("pedido.id_pedido"), nullable=False)
    id_usuario_cambio = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=True)
    estado_anterior = Column(String(30), nullable=True)
    estado_nuevo = Column(String(30), nullable=False)
    comentario = Column(String(255), nullable=True)
    estado = Column(Integer, nullable=False, default=1)
    creado = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    pedido = relationship("Pedido", back_populates="historial")
    usuario_cambio = relationship("Usuario")
