package com.freshlink.repository

import com.freshlink.model.EstadoPedido
import com.freshlink.model.Pedido
import org.springframework.data.jpa.repository.JpaRepository

interface PedidoRepository : JpaRepository<Pedido, Long> {
    fun findByTiendaId(tiendaId: Long): List<Pedido>
    fun findByProductorId(productorId: Long): List<Pedido>
    fun findByTransportistaId(transportistaId: Long): List<Pedido>
    fun findByEstado(estado: EstadoPedido): List<Pedido>
}
