package com.freshlink.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "pedidos")
class Pedido(
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "tienda_id", nullable = false)
    var tienda: User,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "productor_id", nullable = false)
    var productor: User,
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    var estado: EstadoPedido = EstadoPedido.PENDIENTE,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "transportista_id")
    var transportista: User? = null,
    @Column(nullable = false) var total: BigDecimal = BigDecimal.ZERO,
    var direccionEntrega: String? = null,
    var fechaEntrega: LocalDateTime? = null
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null
    @Column(updatable = false) var createdAt: LocalDateTime? = null
    var updatedAt: LocalDateTime? = null

    @PrePersist fun onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now() }
    @PreUpdate fun onUpdate() { updatedAt = LocalDateTime.now() }
}
