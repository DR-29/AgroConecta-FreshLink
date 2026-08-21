package com.freshlink.dto

import com.freshlink.model.Role
import com.freshlink.model.User
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateProfileRequest(
    @field:NotBlank val name: String? = null,
    val phone: String? = null,
    @field:Size(min = 8, max = 16) val password: String? = null
)

data class UserResponse(
    val id: Long,
    val name: String,
    val email: String,
    val phone: String?,
    val role: Role,
    val enabled: Boolean,
    val approved: Boolean,
    val available: Boolean
) {
    companion object {
        fun from(u: User) = UserResponse(u.id!!, u.name, u.email, u.phone, u.role, u.enabled, u.approved, u.available)
    }
}
