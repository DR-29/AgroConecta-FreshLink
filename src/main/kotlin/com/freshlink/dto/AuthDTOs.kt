package com.freshlink.dto

import com.freshlink.model.Role
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RegisterRequest(
    @field:NotBlank val name: String,
    @field:Email @field:NotBlank val email: String,
    @field:NotBlank @field:Size(min = 8, max = 16) val password: String,
    val phone: String? = null,
    val role: Role
)

data class LoginRequest(
    @field:Email @field:NotBlank val email: String,
    @field:NotBlank val password: String
)

data class AuthResponse(
    val token: String,
    val userId: Long,
    val name: String,
    val email: String,
    val role: Role
)

data class ForgotPasswordRequest(@field:Email @field:NotBlank val email: String)

data class ResetPasswordRequest(@field:NotBlank val token: String, @field:NotBlank @field:Size(min = 8, max = 16) val newPassword: String)
