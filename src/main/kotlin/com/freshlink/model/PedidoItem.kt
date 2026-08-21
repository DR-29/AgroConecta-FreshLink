package com.freshlink.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "pedido_items")
class PedidoItem(
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "pedido_id", nullable = false)
    var pedido: Pedido,
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "producto_id", nullable = false)
    var producto: Producto,
    @Column(nullable = false) var cantidad: Double,
    var precioUnitario: BigDecimal,
    var subtotal: BigDecimal
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null
    @Column(updatable = false) var createdAt: LocalDateTime? = null
    var updatedAt: LocalDateTime? = null

    @PrePersist fun onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now() }
    @PreUpdate fun onUpdate() { updatedAt = LocalDateTime.now() }
}
