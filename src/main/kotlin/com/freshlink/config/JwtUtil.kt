package com.freshlink.config

import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*

@Component
class JwtUtil {

    @Value("\${app.jwt.secret}") private lateinit var secret: String
    @Value("\${app.jwt.expiration-ms}") private var expirationMs: Long = 86400000

    private fun signingKey() = Keys.hmacShaKeyFor(secret.toByteArray())

    fun generateToken(email: String): String = Jwts.builder()
        .subject(email)
        .issuedAt(Date())
        .expiration(Date(System.currentTimeMillis() + expirationMs))
        .signWith(signingKey())
        .compact()

    fun extractEmail(token: String): String = Jwts.parser()
        .setSigningKey(signingKey()).build()
        .parseClaimsJws(token).body.subject

    fun validateToken(token: String): Boolean = try {
        Jwts.parser().setSigningKey(signingKey()).build().parseClaimsJws(token)
        true
    } catch (_: JwtException) { false }
}
