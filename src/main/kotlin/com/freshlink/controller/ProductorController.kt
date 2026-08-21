package com.freshlink.controller

import com.freshlink.dto.*
import com.freshlink.model.User
import com.freshlink.service.ProductorService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/productor")
class ProductorController(private val productorService: ProductorService) {

    @PostMapping("/fincas")
    fun crearFinca(@AuthenticationPrincipal user: User, @Valid @RequestBody request: FincaRequest) =
        ResponseEntity.ok(productorService.crearFinca(user, request))

    @GetMapping("/fincas")
    fun listarFincas(@AuthenticationPrincipal user: User) =
        ResponseEntity.ok(productorService.listarFincas(user.id!!))

    @PutMapping("/fincas/{id}")
    fun actualizarFinca(@AuthenticationPrincipal user: User, @PathVariable id: Long, @Valid @RequestBody request: FincaRequest) =
        ResponseEntity.ok(productorService.actualizarFinca(user.id!!, id, request))

    @DeleteMapping("/fincas/{id}")
    fun eliminarFinca(@AuthenticationPrincipal user: User, @PathVariable id: Long): ResponseEntity<Map<String, String>> {
        productorService.eliminarFinca(user.id!!, id)
        return ResponseEntity.ok(mapOf("message" to "Finca eliminada exitosamente"))
    }

    @PostMapping("/productos")
    fun publicarProducto(@AuthenticationPrincipal user: User, @Valid @RequestBody request: ProductoRequest) =
        ResponseEntity.ok(productorService.publicarProducto(user, request))

    @GetMapping("/productos")
    fun listarProductos(@AuthenticationPrincipal user: User) =
        ResponseEntity.ok(productorService.listarProductos(user.id!!))

    @PutMapping("/productos/{id}")
    fun actualizarProducto(@AuthenticationPrincipal user: User, @PathVariable id: Long, @Valid @RequestBody request: ProductoRequest) =
        ResponseEntity.ok(productorService.actualizarProducto(user.id!!, id, request))

    @PatchMapping("/productos/{id}/stock")
    fun gestionarStock(@AuthenticationPrincipal user: User, @PathVariable id: Long, @Valid @RequestBody request: StockUpdateRequest) =
        ResponseEntity.ok(productorService.gestionarStock(id, user.id!!, request.stock))

    @GetMapping("/pedidos")
    fun listarPedidos(@AuthenticationPrincipal user: User) =
        ResponseEntity.ok(productorService.listarPedidos(user.id!!))

    @PostMapping("/pedidos/{id}/aceptar")
    fun aceptarPedido(@AuthenticationPrincipal user: User, @PathVariable id: Long) =
        ResponseEntity.ok(productorService.aceptarPedido(id, user.id!!))

    @PostMapping("/pedidos/{id}/seleccionar-transportista")
    fun seleccionarTransportista(@AuthenticationPrincipal user: User, @PathVariable id: Long, @RequestBody body: Map<String, Long>) =
        ResponseEntity.ok(productorService.seleccionarTransportista(id, user.id!!, body["transportistaId"] ?: 0))

    @GetMapping("/transportistas")
    fun listarTransportistas() = ResponseEntity.ok(productorService.listarTransportistasDisponibles())
}
