package com.freshlink.controller

import com.freshlink.dto.ReclamacionRequest
import com.freshlink.service.AdminService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
class AdminController(private val adminService: AdminService) {

    @GetMapping("/usuarios")
    fun listarUsuarios() = ResponseEntity.ok(adminService.listarUsuarios())

    @PostMapping("/usuarios/{id}/toggle")
    fun toggleUsuario(@PathVariable id: Long) = ResponseEntity.ok(adminService.toggleUsuario(id))

    @GetMapping("/productos")
    fun listarProductos() = ResponseEntity.ok(adminService.listarProductos())

    @DeleteMapping("/productos/{id}")
    fun eliminarProducto(@PathVariable id: Long): ResponseEntity<Map<String, String>> {
        adminService.eliminarProducto(id)
        return ResponseEntity.ok(mapOf("message" to "Producto desactivado"))
    }

    @PatchMapping("/transportistas/{id}/aprobacion")
    fun aprobarTransportista(@PathVariable id: Long, @RequestParam aprobado: Boolean) =
        ResponseEntity.ok(adminService.setTransportistaApproval(id, aprobado))

    @GetMapping("/reclamaciones")
    fun listarReclamaciones() = ResponseEntity.ok(adminService.listarReclamaciones())

    @PostMapping("/reclamaciones/{id}/resolver")
    fun resolverReclamacion(@PathVariable id: Long, @RequestBody(required = false) request: com.freshlink.dto.ResolverReclamacionRequest?) =
        ResponseEntity.ok(adminService.resolverReclamacion(id, request?.respuestaAdmin))

    @GetMapping("/reportes/usuarios")
    fun reporteUsuarios() = ResponseEntity.ok(adminService.reporteUsuarios())

    @GetMapping("/reportes/pedidos")
    fun reportePedidos() = ResponseEntity.ok(adminService.reportePedidos())

    @GetMapping("/reportes/calificaciones")
    fun reporteCalificaciones() = ResponseEntity.ok(adminService.reporteCalificaciones())
}
