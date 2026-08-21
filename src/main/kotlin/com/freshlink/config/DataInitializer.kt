package com.freshlink.config

import com.freshlink.model.*
import com.freshlink.repository.*
import org.springframework.boot.CommandLineRunner
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.math.BigDecimal

@Component
class DataInitializer(
    private val userRepository: UserRepository,
    private val fincaRepository: FincaRepository,
    private val productoRepository: ProductoRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jdbcTemplate: JdbcTemplate
) : CommandLineRunner {

    override fun run(vararg args: String) {
        try {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE")
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT FALSE")
            jdbcTemplate.execute("UPDATE users SET approved = FALSE WHERE approved IS NULL")
            jdbcTemplate.execute("UPDATE users SET available = FALSE WHERE available IS NULL")
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN approved SET NOT NULL")
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN available SET NOT NULL")
            jdbcTemplate.execute("UPDATE producto SET unidad = 'unidades'")
        } catch (_: Exception) {}

        if (userRepository.count() > 0) {
            try {
                jdbcTemplate.execute("UPDATE users SET approved = TRUE, available = TRUE WHERE email IN ('pedro@test.com', 'luis@test.com')")
            } catch (_: Exception) {}
            return
        }

        val admin = userRepository.save(User("Admin", "admin@freshlink.com", passwordEncoder.encode("admin123"), role = Role.ADMIN))
        val productor = userRepository.save(User("Carlos Agricultor", "carlos@test.com", passwordEncoder.encode("123456"), "555-0101", Role.PRODUCTOR))
        val tienda = userRepository.save(User("María Tienda", "maria@test.com", passwordEncoder.encode("123456"), "555-0202", Role.TIENDA))
        val transportista = userRepository.save(User("Pedro Conductor", "pedro@test.com", passwordEncoder.encode("123456"), "555-0303", Role.TRANSPORTISTA, approved = true, available = true))

        val finca = fincaRepository.save(Finca("Finca El Paraíso", "Carretera 123, Km 5", 18.5, -69.9, productor))
        fincaRepository.save(Finca("Finca La Esperanza", "Camino 456", 18.6, -69.8, productor))

        productoRepository.save(Producto("Tomates", "Tomates orgánicos frescos", "Verduras", BigDecimal("2.50"), "unidades", 100.0, null, finca, productor))
        productoRepository.save(Producto("Lechuga", "Lechuga hidropónica", "Verduras", BigDecimal("1.50"), "unidades", 50.0, null, finca, productor))
        productoRepository.save(Producto("Fresas", "Fresas dulces", "Frutas", BigDecimal("4.00"), "unidades", 30.0, null, finca, productor))

        userRepository.save(User("Transportista 2", "luis@test.com", passwordEncoder.encode("123456"), "555-0404", Role.TRANSPORTISTA, approved = true, available = true))

        println("--- DATOS DE PRUEBA CREADOS ---")
        println("Admin: admin@freshlink.com / admin123")
        println("Productor: carlos@test.com / 123456")
        println("Tienda: maria@test.com / 123456")
        println("Transportista: pedro@test.com / 123456")
    }
}
