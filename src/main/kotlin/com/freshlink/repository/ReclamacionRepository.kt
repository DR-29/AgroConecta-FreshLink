package com.freshlink.repository

import com.freshlink.model.EstadoReclamacion
import com.freshlink.model.Reclamacion
import org.springframework.data.jpa.repository.JpaRepository

interface ReclamacionRepository : JpaRepository<Reclamacion, Long> {
    fun findByUsuarioId(usuarioId: Long): List<Reclamacion>
    fun findByEstado(estado: EstadoReclamacion): List<Reclamacion>
}
