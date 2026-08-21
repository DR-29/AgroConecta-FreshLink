package com.freshlink.service

import com.freshlink.dto.*
import com.freshlink.exception.ApiException
import com.freshlink.model.*
import com.freshlink.repository.*
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class TiendaService(
    private val productoRepository: ProductoRepository,
    private val pedidoRepository: PedidoRepository,
    private val pedidoItemRepository: PedidoItemRepository,
    private val userRepository: UserRepository,
    private val calificacionRepository: CalificacionRepository,
    private val reclamacionRepository: ReclamacionRepository
    , private val historialRepository: PedidoEstadoHistorialRepository
    , private val ubicacionRepository: UbicacionRepository
) {
    private fun requireTienda(user: User) {
        if (user.role != Role.TIENDA) throw ApiException(HttpStatus.FORBIDDEN, "Se requiere rol TIENDA")
    }

    fun buscarProductos(termino: String? = null, categoria: String? = null): List<ProductoResponse> {
        val productos = when {
            !categoria.isNullOrBlank() -> productoRepository.findByCategoriaContainingIgnoreCase(categoria)
            !termino.isNullOrBlank() -> productoRepository.findByNombreContainingIgnoreCase(termino)
            else -> productoRepository.findByDisponibleTrue()
        }
        return productos.filter { it.disponible }.map { ProductoResponse.from(it) }
    }

    @Transactional
    fun realizarPedido(tienda: User, request: PedidoRequest): PedidoResponse {
        requireTienda(tienda)
        val productor = userRepository.findById(request.productorId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Productor no encontrado") }
        val pedido = Pedido(tienda = tienda, productor = productor, direccionEntrega = request.direccionEntrega)
        val saved = pedidoRepository.save(pedido)
        historialRepository.save(PedidoEstadoHistorial(saved, saved.estado))
        var total = BigDecimal.ZERO
        val items = mutableListOf<PedidoItem>()
        for (r in request.items) {
            val producto = productoRepository.findById(r.productoId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado") }
            if (!producto.disponible) throw ApiException(HttpStatus.BAD_REQUEST, "Producto no disponible: ${producto.nombre}")
            if (producto.stockDisponible < r.cantidad) throw ApiException(HttpStatus.BAD_REQUEST, "Stock insuficiente: ${producto.nombre}")
            val subtotal = producto.precioUnitario * BigDecimal.valueOf(r.cantidad)
            total += subtotal
            items.add(pedidoItemRepository.save(PedidoItem(saved, producto, r.cantidad, producto.precioUnitario, subtotal)))
            producto.stockDisponible -= r.cantidad
            productoRepository.save(producto)
        }
        saved.total = total
        return PedidoResponse.from(pedidoRepository.save(saved), items)
    }

    fun obtenerPedidos(tiendaId: Long): List<PedidoResponse> =
        pedidoRepository.findByTiendaId(tiendaId).map { p -> PedidoResponse.from(p, pedidoItemRepository.findByPedidoId(p.id!!)) }

    fun obtenerSeguimiento(pedidoId: Long, tiendaId: Long): SeguimientoResponse {
        val p = pedidoRepository.findById(pedidoId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Pedido no encontrado") }
        if (p.tienda.id != tiendaId) throw ApiException(HttpStatus.FORBIDDEN, "No tienes acceso")
        val ubicacion = p.transportista?.id?.let { ubicacionRepository.findTopByTransportistaIdOrderByTimestampDesc(it) }
        return SeguimientoResponse(p.id!!, p.estado, p.transportista?.id, ubicacion?.let { UbicacionResponse.from(it) }, historialRepository.findByPedidoIdOrderByFechaAsc(p.id!!).map { EstadoHistorialResponse.from(it) })
    }

    fun crearReclamacion(tienda: User, request: ReclamacionRequest): ReclamacionResponse {
        requireTienda(tienda)
        val pedido = request.pedidoId?.let { pedidoRepository.findById(it).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Pedido no encontrado") } }
        if (pedido?.tienda?.id != null && pedido.tienda.id != tienda.id)
            throw ApiException(HttpStatus.FORBIDDEN, "No puedes reclamar sobre este pedido")
        val r = Reclamacion(usuario = tienda, pedido = pedido, asunto = request.asunto, descripcion = request.descripcion)
        return ReclamacionResponse.from(reclamacionRepository.save(r))
    }

    fun calificar(pedidoId: Long, tienda: User, request: CalificacionRequest): CalificacionResponse {
        requireTienda(tienda)
        val pedido = pedidoRepository.findById(pedidoId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Pedido no encontrado") }
        if (pedido.tienda.id != tienda.id) throw ApiException(HttpStatus.FORBIDDEN, "No puedes calificar este pedido")
        if (pedido.estado != EstadoPedido.ENTREGADO)
            throw ApiException(HttpStatus.BAD_REQUEST, "Solo puedes calificar pedidos entregados")
        if (request.productorId == null && request.transportistaId == null)
            throw ApiException(HttpStatus.BAD_REQUEST, "Debes indicar un productor o transportista")

        val productor = request.productorId?.let {
            if (pedido.productor.id != it) throw ApiException(HttpStatus.BAD_REQUEST, "El productor no pertenece al pedido")
            userRepository.findById(it).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Productor no encontrado") }
        }
        val transportista = request.transportistaId?.let {
            if (pedido.transportista?.id != it) throw ApiException(HttpStatus.BAD_REQUEST, "El transportista no pertenece al pedido")
            userRepository.findById(it).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Transportista no encontrado") }
        }
        val anteriores = calificacionRepository.findByPedidoId(pedidoId)
        if (productor != null && anteriores.any { it.productor?.id == productor.id })
            throw ApiException(HttpStatus.CONFLICT, "El productor ya fue calificado para este pedido")
        if (transportista != null && anteriores.any { it.transportista?.id == transportista.id })
            throw ApiException(HttpStatus.CONFLICT, "El transportista ya fue calificado para este pedido")

        val c = Calificacion(tienda = tienda, productor = productor, transportista = transportista, pedido = pedido, puntuacion = request.puntuacion, comentario = request.comentario)
        return CalificacionResponse.from(calificacionRepository.save(c))
    }

    fun obtenerReclamaciones(usuarioId: Long): List<ReclamacionResponse> {
        return reclamacionRepository.findByUsuarioId(usuarioId).map { ReclamacionResponse.from(it) }
    }
}
