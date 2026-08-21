package com.freshlink.service

import com.freshlink.config.JwtUtil
import com.freshlink.dto.*
import com.freshlink.exception.ApiException
import com.freshlink.model.User
import com.freshlink.model.Role
import com.freshlink.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authenticationManager: AuthenticationManager,
    private val jwtUtil: JwtUtil
) {

    fun register(request: RegisterRequest): AuthResponse {
        if (request.role == Role.ADMIN)
            throw ApiException(HttpStatus.FORBIDDEN, "No se puede registrar un administrador públicamente")
        if (userRepository.findByEmail(request.email) != null)
            throw ApiException(HttpStatus.BAD_REQUEST, "El email ya está registrado")

        val user = User(
            name = request.name, email = request.email,
            password = passwordEncoder.encode(request.password),
            phone = request.phone, role = request.role
        )
        val saved = userRepository.save(user)
        val token = jwtUtil.generateToken(saved.email)
        return AuthResponse(token, saved.id!!, saved.name, saved.email, saved.role)
    }

    fun login(request: LoginRequest): AuthResponse {
        authenticationManager.authenticate(UsernamePasswordAuthenticationToken(request.email, request.password))
        val user = userRepository.findByEmail(request.email)
            ?: throw ApiException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas")
        val token = jwtUtil.generateToken(user.email)
        return AuthResponse(token, user.id!!, user.name, user.email, user.role)
    }

    fun forgotPassword(request: ForgotPasswordRequest) {
        userRepository.findByEmail(request.email) ?: return
        val resetToken = jwtUtil.generateToken(request.email)
        // La entrega del token debe realizarse mediante un proveedor de correo configurado.
        // Nunca se imprime el token ni se devuelve en la respuesta HTTP.
    }

    fun resetPassword(request: ResetPasswordRequest) {
        if (!jwtUtil.validateToken(request.token))
            throw ApiException(HttpStatus.BAD_REQUEST, "Token inválido o expirado")
        val email = jwtUtil.extractEmail(request.token)
        val user = userRepository.findByEmail(email)
            ?: throw ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado")
        user.setEncryptedPassword(passwordEncoder.encode(request.newPassword))
        userRepository.save(user)
    }
}
