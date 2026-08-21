package com.freshlink.dto

import com.freshlink.model.Ubicacion

data class UbicacionRequest(val latitud: Double, val longitud: Double)

data class UbicacionResponse(val id: Long, val transportistaId: Long, val latitud: Double, val longitud: Double, val timestamp: String) {
    companion object { fun from(u: Ubicacion) = UbicacionResponse(u.id!!, u.transportista.id!!, u.latitud, u.longitud, u.timestamp.toString()) }
}
