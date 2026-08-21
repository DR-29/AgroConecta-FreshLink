package com.freshlink.controller

import com.freshlink.dto.*
import com.freshlink.model.User
import com.freshlink.service.TiendaService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tienda")
class TiendaController(private val tiendaService: TiendaService) {

    @GetMapping("/productos")
    fun buscarProductos(@RequestParam(required = false) termino: String?, @RequestParam(required = false) categoria: String?) =
        ResponseEntity.ok(tiendaService.buscarProductos(termino, categoria))

    @PostMapping("/pedidos")
    fun realizarPedido(@AuthenticationPrincipal user: User, @Valid @RequestBody request: PedidoRequest) =
        ResponseEntity.ok(tiendaService.realizarPedido(user, request))

    @GetMapping("/pedidos")
    fun obtenerPedidos(@AuthenticationPrincipal user: User) =
        ResponseEntity.ok(tiendaService.obtenerPedidos(user.id!!))

    @GetMapping("/pedidos/{id}/seguimiento")
    fun obtenerSeguimiento(@AuthenticationPrincipal user: User, @PathVariable id: Long) =
        ResponseEntity.ok(tiendaService.obtenerSeguimiento(id, user.id!!))

    @PostMapping("/pedidos/{id}/calificar")
    fun calificar(@AuthenticationPrincipal user: User, @PathVariable id: Long, @Valid @RequestBody request: CalificacionRequest) =
        ResponseEntity.ok(tiendaService.calificar(id, user, request))

    @PostMapping("/reclamaciones")
    fun crearReclamacion(@AuthenticationPrincipal user: User, @Valid @RequestBody request: ReclamacionRequest) =
        ResponseEntity.ok(tiendaService.crearReclamacion(user, request))

    @GetMapping("/reclamaciones")
    fun obtenerReclamaciones(@AuthenticationPrincipal user: User) =
        ResponseEntity.ok(tiendaService.obtenerReclamaciones(user.id!!))
}
