package com.freshlink.repository

import com.freshlink.model.EstadoSolicitud
import com.freshlink.model.SolicitudTransporte
import org.springframework.data.jpa.repository.JpaRepository

interface SolicitudTransporteRepository : JpaRepository<SolicitudTransporte, Long> {
    fun findByProductorId(productorId: Long): List<SolicitudTransporte>
    fun findByTransportistaId(transportistaId: Long): List<SolicitudTransporte>
    fun findByPedidoId(pedidoId: Long): List<SolicitudTransporte>
    fun findByEstado(estado: EstadoSolicitud): List<SolicitudTransporte>
    fun findByTransportistaIdAndEstado(transportistaId: Long, estado: EstadoSolicitud): List<SolicitudTransporte>
    fun findByPedidoIdAndEstado(pedidoId: Long, estado: EstadoSolicitud): List<SolicitudTransporte>
}
