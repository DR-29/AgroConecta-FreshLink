package com.freshlink.model

import jakarta.persistence.*
import java.time.LocalDateTime

enum class EstadoReclamacion { ABIERTA, EN_PROCESO, RESUELTA }

@Entity
class Reclamacion(
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "usuario_id", nullable = false)
    var usuario: User,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "pedido_id")
    var pedido: Pedido? = null,
    @Column(nullable = false) var asunto: String,
    @Column(length = 2000) var descripcion: String? = null,
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    var estado: EstadoReclamacion = EstadoReclamacion.ABIERTA,
    @Column(length = 2000) var respuestaAdmin: String? = null,
    var fechaResolucion: LocalDateTime? = null
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null
    @Column(updatable = false) var createdAt: LocalDateTime? = null
    var updatedAt: LocalDateTime? = null

    @PrePersist fun onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now() }
    @PreUpdate fun onUpdate() { updatedAt = LocalDateTime.now() }
}
