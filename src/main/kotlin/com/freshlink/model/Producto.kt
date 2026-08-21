package com.freshlink.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
class Producto(
    @Column(nullable = false) var nombre: String,
    var descripcion: String? = null,
    var categoria: String? = null,
    @Column(nullable = false) var precioUnitario: BigDecimal,
    var unidad: String = "unidades",
    @Column(nullable = false) var stockDisponible: Double = 0.0,
    var imagenUrl: String? = null,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "finca_id") var finca: Finca? = null,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "productor_id", nullable = false)
    var productor: User,
    @Column(nullable = false) var disponible: Boolean = true
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null
    @Column(updatable = false) var createdAt: LocalDateTime? = null
    var updatedAt: LocalDateTime? = null

    @PrePersist fun onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now() }
    @PreUpdate fun onUpdate() { updatedAt = LocalDateTime.now() }
}
