package com.freshlink.exception

import org.springframework.http.HttpStatus

data class ApiError(val status: Int, val message: String)

class ApiException(val status: HttpStatus, override val message: String) : RuntimeException(message)
