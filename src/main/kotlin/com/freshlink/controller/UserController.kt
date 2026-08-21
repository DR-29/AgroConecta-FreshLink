package com.freshlink.controller

import com.freshlink.dto.UpdateProfileRequest
import com.freshlink.dto.UserResponse
import com.freshlink.model.User
import com.freshlink.service.UserService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {

    @GetMapping("/me")
    fun getProfile(@AuthenticationPrincipal user: User) = ResponseEntity.ok(userService.getProfile(user.id!!))

    @PutMapping("/me")
    fun updateProfile(@AuthenticationPrincipal user: User, @Valid @RequestBody request: UpdateProfileRequest): ResponseEntity<UserResponse> =
        ResponseEntity.ok(userService.updateProfile(user.id!!, request))
}
