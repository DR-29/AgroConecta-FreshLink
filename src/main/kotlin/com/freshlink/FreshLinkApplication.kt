package com.freshlink

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class FreshLinkApplication

fun main(args: Array<String>) {
    runApplication<FreshLinkApplication>(*args)
}
