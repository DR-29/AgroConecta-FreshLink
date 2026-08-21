package com.freshlink.service

import com.freshlink.dto.*
import com.freshlink.exception.ApiException
import com.freshlink.model.*
import com.freshlink.repository.*
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ProductorService(
    private val fincaRepository: FincaRepository,
    private val productoRepository: ProductoRepository,
    private val pedidoRepository: PedidoRepository,
    private val pedidoItemRepository: PedidoItemRepository,
    private val solicitudTransporteRepository: SolicitudTransporteRepository,
    private val userRepository: UserRepository
    , private val historialRepository: PedidoEstadoHistorialRepository
) {
    private fun requireProductor(user: User) {
        if (user.role != Role.PRODUCTOR) throw ApiException(HttpStatus.FORBIDDEN, "Se requiere rol PRODUCTOR")
    }

    fun crearFinca(productor: User, request: FincaRequest): FincaResponse {
        requireProductor(productor)
        val finca = Finca(request.nombre, request.direccion, request.latitud, request.longitud, productor)
        return FincaResponse.from(fincaRepository.save(finca))
    }

    fun listarFincas(productorId: Long): List<FincaResponse> =
        fincaRepository.findByProductorId(productorId).map { FincaResponse.from(it) }

    fun actualizarFinca(productorId: Long, fincaId: Long, request: FincaRequest): FincaResponse {
        val finca = fincaRepository.findById(fincaId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Finca no encontrada") }
        if (finca.productor.id != productorId) throw ApiException(HttpStatus.FORBIDDEN, "No tienes permiso para modificar esta finca")
        finca.nombre = request.nombre
        finca.direccion = request.direccion
        finca.latitud = request.latitud
        finca.longitud = request.longitud
        return FincaResponse.from(fincaRepository.save(finca))
    }

    fun eliminarFinca(productorId: Long, fincaId: Long) {
        val finca = fincaRepository.findById(fincaId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Finca no encontrada") }
        if (finca.productor.id != productorId) throw ApiException(HttpStatus.FORBIDDEN, "No tienes permiso para eliminar esta finca")
        fincaRepository.delete(finca)
    }

    fun publicarProducto(productor: User, request: ProductoRequest): ProductoResponse {
        requireProductor(productor)
        val finca = request.fincaId?.let {
            fincaRepository.findById(it).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Finca no encontrada") }
                .also { f ->
                    if (f.productor.id != productor.id) throw ApiException(HttpStatus.FORBIDDEN, "La finca no pertenece al productor")
                }
        }
        val producto = Producto(request.nombre, request.descripcion, request.categoria, request.precioUnitario, request.unidad, request.stockDisponible, request.imagenUrl, finca, productor, request.disponible)
        return ProductoResponse.from(productoRepository.save(producto))
    }

    fun actualizarProducto(productorId: Long, productoId: Long, request: ProductoRequest): ProductoResponse {
        val producto = productoRepository.findById(productoId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado") }
        if (producto.productor.id != productorId) throw ApiException(HttpStatus.FORBIDDEN, "No tienes permiso para modificar este producto")
        producto.nombre = request.nombre; request.descripcion?.let { producto.descripcion = it }
        request.categoria?.let { producto.categoria = it }; producto.precioUnitario = request.precioUnitario
        producto.unidad = request.unidad; producto.stockDisponible = request.stockDisponible
        request.imagenUrl?.let { producto.imagenUrl = it }
        request.fincaId?.let {
            val f = fincaRepository.findById(it).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Finca no encontrada") }
            if (f.productor.id != productorId) throw ApiException(HttpStatus.FORBIDDEN, "La finca no pertenece al productor")
            producto.finca = f
        }
        producto.disponible = request.disponible
        return ProductoResponse.from(productoRepository.save(producto))
    }

    fun listarProductos(productorId: Long): List<ProductoResponse> =
        productoRepository.findByProductorId(productorId).map { ProductoResponse.from(it) }

    fun gestionarStock(productoId: Long, productorId: Long, stock: Double): ProductoResponse {
        val p = productoRepository.findById(productoId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado") }
        if (p.productor.id != productorId) throw ApiException(HttpStatus.FORBIDDEN, "No tienes permiso")
        p.stockDisponible = stock
        return ProductoResponse.from(productoRepository.save(p))
    }

    fun listarPedidos(productorId: Long): List<PedidoResponse> =
        pedidoRepository.findByProductorId(productorId).map { pedido ->
            val items = pedidoItemRepository.findByPedidoId(pedido.id!!)
            PedidoResponse.from(pedido, items)
        }

    @Transactional
    fun aceptarPedido(pedidoId: Long, productorId: Long): PedidoResponse {
        val pedido = pedidoRepository.findById(pedidoId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Pedido no encontrado") }
        if (pedido.productor.id != productorId) throw ApiException(HttpStatus.FORBIDDEN, "No tienes permiso")
        pedido.estado = EstadoPedido.ACEPTADO
        historialRepository.save(PedidoEstadoHistorial(pedido, pedido.estado))
        val items = pedidoItemRepository.findByPedidoId(pedido.id!!)
        return PedidoResponse.from(pedidoRepository.save(pedido), items)
    }

    @Transactional
    fun seleccionarTransportista(pedidoId: Long, productorId: Long, transportistaId: Long): SolicitudTransporteResponse {
        val pedido = pedidoRepository.findById(pedidoId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Pedido no encontrado") }
        if (pedido.productor.id != productorId) throw ApiException(HttpStatus.FORBIDDEN, "No tienes permiso")
        if (pedido.estado != EstadoPedido.ACEPTADO) {
            throw ApiException(HttpStatus.BAD_REQUEST, "El pedido debe estar en estado ACEPTADO para solicitar transporte")
        }
        if (pedido.transportista != null) {
            throw ApiException(HttpStatus.CONFLICT, "El pedido ya tiene un transportista asignado")
        }
        if (solicitudTransporteRepository.findByPedidoIdAndEstado(pedidoId, EstadoSolicitud.PENDIENTE).isNotEmpty()) {
            throw ApiException(HttpStatus.CONFLICT, "Ya existe una solicitud de transporte pendiente para este pedido")
        }
        val transportista = userRepository.findById(transportistaId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Transportista no encontrado") }
        if (transportista.role != Role.TRANSPORTISTA) throw ApiException(HttpStatus.BAD_REQUEST, "El usuario no es transportista")
        if (!transportista.approved || !transportista.available)
            throw ApiException(HttpStatus.BAD_REQUEST, "El transportista no está aprobado o disponible")
        val solicitud = SolicitudTransporte(productor = pedido.productor, pedido = pedido)
        solicitud.transportista = transportista
        solicitud.estado = EstadoSolicitud.PENDIENTE
        return SolicitudTransporteResponse.from(solicitudTransporteRepository.save(solicitud))
    }

    fun listarTransportistasDisponibles(): List<UserResponse> =
        userRepository.findByRole(Role.TRANSPORTISTA)
            .filter { it.enabled && it.approved && it.available }
            .map { UserResponse.from(it) }
}
