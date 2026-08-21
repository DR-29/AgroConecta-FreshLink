package com.freshlink.dto

import com.freshlink.model.EstadoPedido
import com.freshlink.model.Pedido
import com.freshlink.model.PedidoItem
import com.freshlink.model.PedidoEstadoHistorial
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.NotEmpty
import java.math.BigDecimal

data class PedidoItemRequest(val productoId: Long, @field:Positive val cantidad: Double)

data class PedidoRequest(val productorId: Long, @field:NotEmpty val items: List<PedidoItemRequest>, val direccionEntrega: String? = null)

data class PedidoItemResponse(val id: Long, val productoId: Long, val nombreProducto: String, val cantidad: Double, val precioUnitario: BigDecimal, val subtotal: BigDecimal) {
    companion object { fun from(i: PedidoItem) = PedidoItemResponse(i.id!!, i.producto.id!!, i.producto.nombre, i.cantidad, i.precioUnitario, i.subtotal) }
}

data class PedidoResponse(val id: Long, val tiendaId: Long, val productorId: Long, val transportistaId: Long?, val estado: EstadoPedido, val total: BigDecimal, val direccionEntrega: String?, val items: List<PedidoItemResponse>, val fechaEntrega: String?) {
    companion object {
        fun from(p: Pedido, items: List<PedidoItem>) = PedidoResponse(p.id!!, p.tienda.id!!, p.productor.id!!, p.transportista?.id, p.estado, p.total, p.direccionEntrega, items.map { PedidoItemResponse.from(it) }, p.fechaEntrega?.toString())
    }
}

data class SeguimientoResponse(
    val pedidoId: Long,
    val estadoActual: EstadoPedido,
    val transportistaId: Long?,
    val ultimaUbicacion: UbicacionResponse?,
    val historial: List<EstadoHistorialResponse>
)

data class EstadoHistorialResponse(val estado: EstadoPedido, val fecha: String) {
    companion object {
        fun from(h: PedidoEstadoHistorial) = EstadoHistorialResponse(h.estado, h.fecha.toString())
    }
}
