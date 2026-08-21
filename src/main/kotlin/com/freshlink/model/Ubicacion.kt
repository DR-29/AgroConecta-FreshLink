package com.freshlink.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
class Ubicacion(
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "transportista_id", nullable = false)
    var transportista: User,
    @Column(nullable = false) var latitud: Double,
    @Column(nullable = false) var longitud: Double,
    var timestamp: LocalDateTime = LocalDateTime.now()
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null

    @PrePersist fun onCreate() { if (timestamp == null) timestamp = LocalDateTime.now() }
}
