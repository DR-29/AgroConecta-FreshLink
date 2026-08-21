package com.freshlink.repository

import com.freshlink.model.Calificacion
import org.springframework.data.jpa.repository.JpaRepository

interface CalificacionRepository : JpaRepository<Calificacion, Long> {
    fun findByProductorId(productorId: Long): List<Calificacion>
    fun findByTransportistaId(transportistaId: Long): List<Calificacion>
    fun findByPedidoId(pedidoId: Long): List<Calificacion>
}
