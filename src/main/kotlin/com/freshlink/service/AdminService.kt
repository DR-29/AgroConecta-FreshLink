package com.freshlink.service

import com.freshlink.dto.*
import com.freshlink.exception.ApiException
import com.freshlink.model.*
import com.freshlink.repository.*
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class AdminService(
    private val userRepository: UserRepository,
    private val productoRepository: ProductoRepository,
    private val pedidoRepository: PedidoRepository,
    private val reclamacionRepository: ReclamacionRepository,
    private val calificacionRepository: CalificacionRepository
) {
    fun listarUsuarios(): List<UserResponse> = userRepository.findAll().map { UserResponse.from(it) }

    fun toggleUsuario(usuarioId: Long): UserResponse {
        val u = userRepository.findById(usuarioId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }
        u.enabled = !u.enabled
        return UserResponse.from(userRepository.save(u))
    }

    fun setTransportistaApproval(usuarioId: Long, approved: Boolean): UserResponse {
        val u = userRepository.findById(usuarioId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }
        if (u.role != Role.TRANSPORTISTA) throw ApiException(HttpStatus.BAD_REQUEST, "El usuario no es transportista")
        u.approved = approved
        if (!approved) u.available = false
        return UserResponse.from(userRepository.save(u))
    }

    fun listarProductos(): List<ProductoResponse> = productoRepository.findAll().map { ProductoResponse.from(it) }

    fun eliminarProducto(productoId: Long) {
        val p = productoRepository.findById(productoId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado") }
        // Eliminación lógica: los pedidos históricos conservan su referencia al producto.
        p.disponible = false
        p.stockDisponible = 0.0
        productoRepository.save(p)
    }

    fun listarReclamaciones(): List<ReclamacionResponse> = reclamacionRepository.findAll().map { ReclamacionResponse.from(it) }

    fun resolverReclamacion(reclamacionId: Long, respuesta: String? = null): ReclamacionResponse {
        val r = reclamacionRepository.findById(reclamacionId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Reclamación no encontrada") }
        r.estado = EstadoReclamacion.RESUELTA
        if (!respuesta.isNullOrBlank()) {
            r.respuestaAdmin = respuesta.trim()
        }
        r.fechaResolucion = LocalDateTime.now()
        return ReclamacionResponse.from(reclamacionRepository.save(r))
    }

    fun reporteUsuarios(): Map<String, Any> {
        val total = userRepository.count()
        val porRol = Role.values().associateWith { role -> userRepository.findByRole(role).size }
        return mapOf("total" to total, "porRol" to porRol)
    }

    fun reportePedidos(): Map<String, Any> {
        val total = pedidoRepository.count()
        val porEstado = EstadoPedido.values().associateWith { estado -> pedidoRepository.findByEstado(estado).size }
        return mapOf("total" to total, "porEstado" to porEstado)
    }

    fun reporteCalificaciones(): Map<String, Any> {
        val todas = calificacionRepository.findAll()
        val promedio = if (todas.isNotEmpty()) todas.map { it.puntuacion }.average() else 0.0
        val lista = todas.map { CalificacionResponse.from(it) }
        return mapOf("total" to todas.size, "promedio" to promedio, "lista" to lista)
    }
}
