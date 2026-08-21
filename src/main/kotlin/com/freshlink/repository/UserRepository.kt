package com.freshlink.repository

import com.freshlink.model.Role
import com.freshlink.model.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): User?
    fun findByRole(role: Role): List<User>
}
