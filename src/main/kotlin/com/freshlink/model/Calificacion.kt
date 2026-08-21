package com.freshlink.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
class Calificacion(
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "tienda_id", nullable = false)
    var tienda: User,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "productor_id")
    var productor: User? = null,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "transportista_id")
    var transportista: User? = null,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "pedido_id", nullable = false)
    var pedido: Pedido,
    @Column(nullable = false) var puntuacion: Int = 5,
    var comentario: String? = null
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null
    @Column(updatable = false) var createdAt: LocalDateTime? = null
    var updatedAt: LocalDateTime? = null

    @PrePersist fun onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now() }
    @PreUpdate fun onUpdate() { updatedAt = LocalDateTime.now() }
}
