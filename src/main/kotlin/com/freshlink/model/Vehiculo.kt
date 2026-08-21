package com.freshlink.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
class Vehiculo(
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "transportista_id", nullable = false)
    var transportista: User,
    @Column(nullable = false) var tipo: String,
    @Column(unique = true, nullable = false) var placa: String,
    var capacidadCarga: Double = 0.0,
    var refrigerado: Boolean = false
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null
    @Column(updatable = false) var createdAt: LocalDateTime? = null
    var updatedAt: LocalDateTime? = null

    @PrePersist fun onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now() }
    @PreUpdate fun onUpdate() { updatedAt = LocalDateTime.now() }
}
