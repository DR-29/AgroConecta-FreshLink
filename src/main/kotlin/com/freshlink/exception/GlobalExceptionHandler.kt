package com.freshlink.exception

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.http.HttpStatus

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ApiException::class)
    fun handleApiException(ex: ApiException): ResponseEntity<ApiError> {
        return ResponseEntity.status(ex.status)
            .body(ApiError(ex.status.value(), ex.message))
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ApiError> {
        val msg = ex.bindingResult.fieldErrors.joinToString(", ") { it.defaultMessage ?: it.field }
        return ResponseEntity.badRequest().body(ApiError(400, msg))
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(ex: IllegalArgumentException) =
        ResponseEntity.badRequest().body(ApiError(400, ex.message ?: "Solicitud inválida"))

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentials(ex: BadCredentialsException) =
        ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError(401, "Credenciales inválidas"))

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrity(ex: DataIntegrityViolationException) =
        ResponseEntity.status(HttpStatus.CONFLICT).body(ApiError(409, "La operación viola una restricción de datos"))

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleUnreadableMessage(ex: HttpMessageNotReadableException) =
        ResponseEntity.badRequest().body(ApiError(400, "El cuerpo de la solicitud contiene datos inválidos"))
}
