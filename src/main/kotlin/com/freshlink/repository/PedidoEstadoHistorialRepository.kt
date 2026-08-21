package com.freshlink.repository

import com.freshlink.model.PedidoEstadoHistorial
import org.springframework.data.jpa.repository.JpaRepository

interface PedidoEstadoHistorialRepository : JpaRepository<PedidoEstadoHistorial, Long> {
    fun findByPedidoIdOrderByFechaAsc(pedidoId: Long): List<PedidoEstadoHistorial>
}
