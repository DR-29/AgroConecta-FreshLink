package com.freshlink.model

import jakarta.persistence.*
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.time.LocalDateTime

@Entity
@Table(name = "users")
class User(
    @Column(nullable = false) var name: String,
    @Column(unique = true, nullable = false) var email: String,
    password: String,
    var phone: String? = null,
    @Enumerated(EnumType.STRING) @Column(nullable = false) var role: Role,
    @Column(nullable = false) var enabled: Boolean = true,
    @Column(nullable = false) var approved: Boolean = false,
    @Column(nullable = false) var available: Boolean = false
) : UserDetails {

    @Column(nullable = false, name = "password")
    var encryptedPassword: String = password
        private set

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null
    @Column(updatable = false) var createdAt: LocalDateTime? = null
    var updatedAt: LocalDateTime? = null

    @PrePersist fun onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now() }
    @PreUpdate fun onUpdate() { updatedAt = LocalDateTime.now() }

    override fun getAuthorities(): MutableCollection<out GrantedAuthority> =
        mutableListOf(SimpleGrantedAuthority("ROLE_${role.name}"))
    override fun getPassword(): String = encryptedPassword
    override fun getUsername(): String = email
    override fun isAccountNonExpired(): Boolean = true
    override fun isAccountNonLocked(): Boolean = true
    override fun isCredentialsNonExpired(): Boolean = true
    override fun isEnabled(): Boolean = enabled

    fun setEncryptedPassword(password: String) {
        encryptedPassword = password
    }
}
