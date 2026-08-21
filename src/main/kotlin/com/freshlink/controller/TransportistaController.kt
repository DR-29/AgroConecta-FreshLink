package com.freshlink.controller

import com.freshlink.dto.*
import com.freshlink.model.EstadoPedido
import com.freshlink.model.User
import com.freshlink.service.TransportistaService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/transportista")
class TransportistaController(private val transportistaService: TransportistaService) {

    @PostMapping("/vehiculos")
    fun registrarVehiculo(@AuthenticationPrincipal user: User, @Valid @RequestBody request: VehiculoRequest) =
        ResponseEntity.ok(transportistaService.registrarVehiculo(user, request))

    @GetMapping("/vehiculos")
    fun listarVehiculos(@AuthenticationPrincipal user: User) =
        ResponseEntity.ok(transportistaService.listarVehiculos(user.id!!))

    @GetMapping("/solicitudes")
    fun listarSolicitudes(@AuthenticationPrincipal user: User) =
        ResponseEntity.ok(transportistaService.listarSolicitudesPendientes(user))

    @GetMapping("/servicios")
    fun listarServiciosAceptados(@AuthenticationPrincipal user: User) =
        ResponseEntity.ok(transportistaService.listarServiciosAceptados(user.id!!))

    @PatchMapping("/disponibilidad")
    fun actualizarDisponibilidad(@AuthenticationPrincipal user: User, @RequestParam disponible: Boolean) =
        ResponseEntity.ok(transportistaService.actualizarDisponibilidad(user, disponible))

    @PostMapping("/solicitudes/{id}/aceptar")
    fun aceptarSolicitud(@AuthenticationPrincipal user: User, @PathVariable id: Long) =
        ResponseEntity.ok(transportistaService.aceptarSolicitud(id, user))

    @PostMapping("/solicitudes/{id}/rechazar")
    fun rechazarSolicitud(@AuthenticationPrincipal user: User, @PathVariable id: Long) =
        ResponseEntity.ok(transportistaService.rechazarSolicitud(id, user))

    @PostMapping("/ubicacion")
    fun compartirUbicacion(@AuthenticationPrincipal user: User, @Valid @RequestBody request: UbicacionRequest) =
        ResponseEntity.ok(transportistaService.compartirUbicacion(user, request))

    @PatchMapping("/pedidos/{id}/estado")
    fun actualizarEstado(@AuthenticationPrincipal user: User, @PathVariable id: Long, @RequestBody body: Map<String, String>) =
        ResponseEntity.ok(transportistaService.actualizarEstadoEntrega(id, user.id!!, EstadoPedido.valueOf(body["estado"] ?: "")))
}
