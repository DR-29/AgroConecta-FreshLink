package com.freshlink.dto

import com.freshlink.model.EstadoSolicitud
import com.freshlink.model.SolicitudTransporte

data class SolicitudTransporteResponse(val id: Long, val productorId: Long, val transportistaId: Long?, val pedidoId: Long, val estado: EstadoSolicitud) {
    companion object { fun from(s: SolicitudTransporte) = SolicitudTransporteResponse(s.id!!, s.productor.id!!, s.transportista?.id, s.pedido.id!!, s.estado) }
}

data class CrearSolicitudRequest(val pedidoId: Long, val transportistaId: Long)
