package com.freshlink.controller

import com.freshlink.dto.*
import com.freshlink.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest) = ResponseEntity.ok(authService.register(request))

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest) = ResponseEntity.ok(authService.login(request))

    @PostMapping("/forgot-password")
    fun forgotPassword(@Valid @RequestBody request: ForgotPasswordRequest): ResponseEntity<Map<String, String>> {
        authService.forgotPassword(request)
        return ResponseEntity.ok(mapOf("message" to "Si el email existe, recibirás un enlace de recuperación"))
    }

    @PostMapping("/reset-password")
    fun resetPassword(@Valid @RequestBody request: ResetPasswordRequest): ResponseEntity<Map<String, String>> {
        authService.resetPassword(request)
        return ResponseEntity.ok(mapOf("message" to "Contraseña actualizada exitosamente"))
    }
}
