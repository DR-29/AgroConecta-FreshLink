package com.freshlink.dto

import com.freshlink.model.Vehiculo
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.PositiveOrZero
import jakarta.validation.constraints.Size

data class VehiculoRequest(
    @field:NotBlank @field:Size(max = 50) val tipo: String,
    @field:NotBlank @field:Size(min = 3, max = 20) val placa: String,
    @field:PositiveOrZero val capacidadCarga: Double = 0.0,
    val refrigerado: Boolean = false
)

data class VehiculoResponse(val id: Long, val transportistaId: Long, val tipo: String, val placa: String, val capacidadCarga: Double, val refrigerado: Boolean) {
    companion object { fun from(v: Vehiculo) = VehiculoResponse(v.id!!, v.transportista.id!!, v.tipo, v.placa, v.capacidadCarga, v.refrigerado) }
}
