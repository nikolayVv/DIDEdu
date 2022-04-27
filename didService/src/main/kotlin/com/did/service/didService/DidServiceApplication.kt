package com.did.service.didService

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.info.Info
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
@OpenAPIDefinition(info = Info(title = "DID Service", version = "1.0",
	description = "Documentation of the DID Service v1.0")
)
class DidServiceApplication

fun main(args: Array<String>) {
	runApplication<DidServiceApplication>(*args)
}
