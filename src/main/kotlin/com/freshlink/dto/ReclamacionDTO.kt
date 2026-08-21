package com.freshlink.dto

import com.freshlink.model.EstadoReclamacion
import com.freshlink.model.Reclamacion
import jakarta.validation.constraints.NotBlank

data class ReclamacionRequest(
    val pedidoId: Long? = null,
    @field:NotBlank val asunto: String,
    val descripcion: String? = null
)

data class ResolverReclamacionRequest(
    val respuestaAdmin: String? = null
)

data class ReclamacionResponse(
    val id: Long,
    val usuarioId: Long,
    val usuarioNombre: String?,
    val usuarioEmail: String?,
    val pedidoId: Long?,
    val asunto: String,
    val descripcion: String?,
    val estado: EstadoReclamacion,
    val respuestaAdmin: String?,
    val fechaResolucion: String?,
    val createdAt: String?
) {
    companion object {
        fun from(r: Reclamacion) = ReclamacionResponse(
            r.id!!,
            r.usuario.id!!,
            r.usuario.name,
            r.usuario.email,
            r.pedido?.id,
            r.asunto,
            r.descripcion,
            r.estado,
            r.respuestaAdmin,
            r.fechaResolucion?.toString(),
            r.createdAt?.toString()
        )
    }
}
