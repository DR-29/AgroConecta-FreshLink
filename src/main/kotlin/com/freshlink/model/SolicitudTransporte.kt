package com.freshlink.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
class SolicitudTransporte(
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "productor_id", nullable = false)
    var productor: User,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "transportista_id")
    var transportista: User? = null,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "pedido_id", nullable = false)
    var pedido: Pedido,
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    var estado: EstadoSolicitud = EstadoSolicitud.PENDIENTE
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null
    @Column(updatable = false) var createdAt: LocalDateTime? = null
    var updatedAt: LocalDateTime? = null

    @PrePersist fun onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now() }
    @PreUpdate fun onUpdate() { updatedAt = LocalDateTime.now() }
}
