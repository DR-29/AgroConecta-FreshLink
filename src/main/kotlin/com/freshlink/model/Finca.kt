package com.freshlink.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
class Finca(
    @Column(nullable = false) var nombre: String,
    var direccion: String? = null,
    var latitud: Double? = null,
    var longitud: Double? = null,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "productor_id", nullable = false)
    var productor: User
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null
    @Column(updatable = false) var createdAt: LocalDateTime? = null
    var updatedAt: LocalDateTime? = null

    @PrePersist fun onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now() }
    @PreUpdate fun onUpdate() { updatedAt = LocalDateTime.now() }
}
