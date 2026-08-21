package com.freshlink.service

import com.freshlink.dto.UpdateProfileRequest
import com.freshlink.dto.UserResponse
import com.freshlink.exception.ApiException
import com.freshlink.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {
    fun getProfile(userId: Long): UserResponse {
        val user = userRepository.findById(userId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }
        return UserResponse.from(user)
    }

    fun updateProfile(userId: Long, request: UpdateProfileRequest): UserResponse {
        val user = userRepository.findById(userId).orElseThrow { ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }
        request.name?.trim()?.let { user.name = it }
        request.phone?.let { user.phone = it }
        request.password?.let { user.setEncryptedPassword(passwordEncoder.encode(it)) }
        return UserResponse.from(userRepository.save(user))
    }
}
