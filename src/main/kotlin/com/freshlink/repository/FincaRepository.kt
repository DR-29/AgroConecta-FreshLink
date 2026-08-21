package com.freshlink.repository

import com.freshlink.model.Finca
import org.springframework.data.jpa.repository.JpaRepository

interface FincaRepository : JpaRepository<Finca, Long> {
    fun findByProductorId(productorId: Long): List<Finca>
}
