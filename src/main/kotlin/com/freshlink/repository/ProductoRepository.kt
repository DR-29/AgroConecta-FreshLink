package com.freshlink.repository

import com.freshlink.model.Producto
import org.springframework.data.jpa.repository.JpaRepository

interface ProductoRepository : JpaRepository<Producto, Long> {
    fun findByProductorId(productorId: Long): List<Producto>
    fun findByFincaId(fincaId: Long): List<Producto>
    fun findByDisponibleTrue(): List<Producto>
    fun findByCategoriaContainingIgnoreCase(categoria: String): List<Producto>
    fun findByNombreContainingIgnoreCase(nombre: String): List<Producto>
}
