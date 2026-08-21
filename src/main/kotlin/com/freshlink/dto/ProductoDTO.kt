package com.freshlink.dto

import com.freshlink.model.Producto
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.PositiveOrZero
import java.math.BigDecimal

data class ProductoRequest(
    @field:NotBlank val nombre: String,
    val descripcion: String? = null,
    val categoria: String? = null,
    @field:Positive val precioUnitario: BigDecimal,
    val unidad: String = "unidades",
    @field:PositiveOrZero val stockDisponible: Double = 0.0,
    val imagenUrl: String? = null,
    val fincaId: Long? = null,
    val disponible: Boolean = true
)

data class StockUpdateRequest(@field:PositiveOrZero val stock: Double)

data class ProductoResponse(
    val id: Long, val nombre: String, val descripcion: String?, val categoria: String?,
    val precioUnitario: BigDecimal, val unidad: String, val stockDisponible: Double,
    val imagenUrl: String?, val fincaId: Long?, val productorId: Long, val disponible: Boolean
) {
    companion object {
        fun from(p: Producto) = ProductoResponse(p.id!!, p.nombre, p.descripcion, p.categoria,
            p.precioUnitario, p.unidad, p.stockDisponible, p.imagenUrl, p.finca?.id, p.productor.id!!, p.disponible)
    }
}
