package com.freshlink.repository

import com.freshlink.model.Ubicacion
import org.springframework.data.jpa.repository.JpaRepository

interface UbicacionRepository : JpaRepository<Ubicacion, Long> {
    fun findTopByTransportistaIdOrderByTimestampDesc(transportistaId: Long): Ubicacion?
}
