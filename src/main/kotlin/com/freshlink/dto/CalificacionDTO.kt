package com.freshlink.dto

import com.freshlink.model.Calificacion
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min

data class CalificacionRequest(
    val productorId: Long? = null,
    val transportistaId: Long? = null,
    @field:Min(1) @field:Max(5) val puntuacion: Int,
    val comentario: String? = null
)

data class CalificacionResponse(
    val id: Long,
    val tiendaId: Long,
    val tiendaNombre: String?,
    val productorId: Long?,
    val productorNombre: String?,
    val transportistaId: Long?,
    val transportistaNombre: String?,
    val tipoEvaluado: String,
    val pedidoId: Long,
    val puntuacion: Int,
    val comentario: String?
) {
    companion object {
        fun from(c: Calificacion): CalificacionResponse {
            val tipo = if (c.productor != null) "PRODUCTOR" else "TRANSPORTISTA"
            return CalificacionResponse(
                id = c.id!!,
                tiendaId = c.tienda.id!!,
                tiendaNombre = c.tienda.name,
                productorId = c.productor?.id,
                productorNombre = c.productor?.name,
                transportistaId = c.transportista?.id,
                transportistaNombre = c.transportista?.name,
                tipoEvaluado = tipo,
                pedidoId = c.pedido.id!!,
                puntuacion = c.puntuacion,
                comentario = c.comentario
            )
        }
    }
}
