package com.freshlink.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "pedido_estado_historial")
class PedidoEstadoHistorial(
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "pedido_id", nullable = false)
    var pedido: Pedido,
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    var estado: EstadoPedido,
    @Column(nullable = false)
    var fecha: LocalDateTime = LocalDateTime.now()
) {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null
}
