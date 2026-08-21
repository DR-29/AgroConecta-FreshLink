package com.freshlink.dto

import com.freshlink.model.Finca
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin

data class FincaRequest(
    @field:NotBlank val nombre: String,
    val direccion: String? = null,
    @field:DecimalMin("-90.0") @field:DecimalMax("90.0") val latitud: Double? = null,
    @field:DecimalMin("-180.0") @field:DecimalMax("180.0") val longitud: Double? = null
)

data class FincaResponse(val id: Long, val nombre: String, val direccion: String?, val latitud: Double?, val longitud: Double?, val productorId: Long) {
    companion object { fun from(f: Finca) = FincaResponse(f.id!!, f.nombre, f.direccion, f.latitud, f.longitud, f.productor.id!!) }
}
