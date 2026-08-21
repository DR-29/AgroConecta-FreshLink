package com.freshlink.service

import com.freshlink.dto.*
import com.freshlink.exception.ApiException
import com.freshlink.model.*
import com.freshlink.repository.*
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class TransportistaService(
    private val vehiculoRepository: VehiculoRepository,
    private val solicitudTransporteRepository: SolicitudTransporteRepository,
    private val ubicacionRepository: UbicacionRepository,
    private val pedidoRepository: PedidoRepository,
    private val userRepository: UserRepository
    , private val historialRepository: PedidoEstadoHistorialRepository
) {
    private fun requireTransportista(user: User) {
        if (user.role != Role.TRANSPORTISTA) throw ApiException(HttpStatus.FORBIDDEN, "Se requiere rol TRANSPORTISTA")
    }

    fun registrarVehiculo(transportista: User, request: VehiculoRequest): VehiculoResponse {
        requireTransportista(transportista)
        if (!transportista.approved)
            throw ApiException(HttpStatus.FORBIDDEN, "El transportista debe estar aprobado para registrar vehículos")
        val placa = request.placa.trim().uppercase()
        if (vehiculoRepository.findByPlacaIgnoreCase(placa) != null)
            throw ApiException(HttpStatus.CONFLICT, "La placa ya está registrada")
        val vehiculo = Vehiculo(transportista, request.tipo.trim(), placa, request.capacidadCarga, request.refrigerado)
        return VehiculoResponse.from(vehiculoRepository.save(vehiculo))
    }

    fun actualizarDisponibilidad(transportista: User, disponible: Boolean): UserResponse {
        requireTransportista(transportista)
        if (!transportista.approved && disponible)
            throw ApiException(HttpStatus.FORBIDDEN, "El transportista aún no está aprobado")
        transportista.available = disponible
        return UserResponse.from(userRepository.save(transportista))
    }

    fun listarVehiculos(transportistaId: Long): List<VehiculoResponse> =
        vehiculoRepository.findByTransportistaId(transportistaId).map { VehiculoResponse.from(it) }

    fun listarSolicitudesPendientes(transportista: User): List<SolicitudTransporteResponse> {
        requireTransportista(transportista)
        if (!transportista.approved || !transportista.available) return emptyList()
        return solicitudTransporteRepository
            .findByTransportistaIdAndEstado(transportista.id!!, EstadoSolicitud.PENDIENTE)
            .map { SolicitudTransporteResponse.from(it) }
    }

    fun listarServiciosAceptados(transportistaId: Long): List<SolicitudTransporteResponse> =
        solicitudTransporteRepository.findByTransportistaIdAndEstado(transportistaId, EstadoSolicitud.ACEPTADA).map { SolicitudTransporteResponse.from(it) }

    @Transactional
    fun aceptarSolicitud(solicitudId: Long, transportista: User): SolicitudTransporteResponse {
        requireTransportista(transportista)
        if (!transportista.approved || !transportista.available)
            throw ApiException(HttpStatus.FORBIDDEN, "El transportista no está aprobado o disponible")
        val s = solicitudTransporteRepository.findById(solicitudId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Solicitud no encontrada") }
        if (s.transportista?.id != transportista.id)
            throw ApiException(HttpStatus.FORBIDDEN, "La solicitud está asignada a otro transportista")
        if (s.estado != EstadoSolicitud.PENDIENTE)
            throw ApiException(HttpStatus.CONFLICT, "La solicitud ya no está pendiente")
        val pedido = s.pedido
        if (pedido.transportista != null) {
            throw ApiException(HttpStatus.CONFLICT, "El pedido ya tiene un transportista asignado")
        }
        s.transportista = transportista
        s.estado = EstadoSolicitud.ACEPTADA
        pedido.estado = EstadoPedido.EN_TRANSPORTE
        pedido.transportista = transportista
        historialRepository.save(PedidoEstadoHistorial(pedido, pedido.estado))
        pedidoRepository.save(pedido)
        return SolicitudTransporteResponse.from(solicitudTransporteRepository.save(s))
    }

    @Transactional
    fun rechazarSolicitud(solicitudId: Long, transportista: User): SolicitudTransporteResponse {
        requireTransportista(transportista)
        val s = solicitudTransporteRepository.findById(solicitudId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Solicitud no encontrada") }
        if (s.transportista?.id != transportista.id)
            throw ApiException(HttpStatus.FORBIDDEN, "La solicitud está asignada a otro transportista")
        if (s.estado != EstadoSolicitud.PENDIENTE)
            throw ApiException(HttpStatus.CONFLICT, "La solicitud ya no está pendiente")
        s.transportista = transportista
        s.estado = EstadoSolicitud.RECHAZADA
        return SolicitudTransporteResponse.from(solicitudTransporteRepository.save(s))
    }

    fun compartirUbicacion(transportista: User, request: UbicacionRequest): UbicacionResponse {
        requireTransportista(transportista)
        return UbicacionResponse.from(ubicacionRepository.save(Ubicacion(transportista, request.latitud, request.longitud)))
    }

    @Transactional
    fun actualizarEstadoEntrega(pedidoId: Long, transportistaId: Long, estado: EstadoPedido): String {
        val p = pedidoRepository.findById(pedidoId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Pedido no encontrado") }
        if (p.transportista?.id != transportistaId) throw ApiException(HttpStatus.FORBIDDEN, "No eres el transportista asignado")
        val transicionValida = p.estado == EstadoPedido.EN_TRANSPORTE && estado == EstadoPedido.ENTREGADO
        if (!transicionValida)
            throw ApiException(HttpStatus.CONFLICT, "Transición de estado no permitida: ${p.estado} → $estado")
        p.fechaEntrega = LocalDateTime.now()
        p.estado = estado; pedidoRepository.save(p)
        historialRepository.save(PedidoEstadoHistorial(p, estado))
        return "Estado actualizado a: $estado"
    }
}
