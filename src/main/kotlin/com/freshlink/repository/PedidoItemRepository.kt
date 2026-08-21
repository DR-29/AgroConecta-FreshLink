package com.freshlink.repository

import com.freshlink.model.PedidoItem
import org.springframework.data.jpa.repository.JpaRepository

interface PedidoItemRepository : JpaRepository<PedidoItem, Long> {
    fun findByPedidoId(pedidoId: Long): List<PedidoItem>
}
