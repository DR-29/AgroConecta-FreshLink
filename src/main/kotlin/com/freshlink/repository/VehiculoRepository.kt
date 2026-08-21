package com.freshlink.repository

import com.freshlink.model.Vehiculo
import org.springframework.data.jpa.repository.JpaRepository

interface VehiculoRepository : JpaRepository<Vehiculo, Long> {
    fun findByTransportistaId(transportistaId: Long): List<Vehiculo>
    fun findByPlacaIgnoreCase(placa: String): Vehiculo?
}
