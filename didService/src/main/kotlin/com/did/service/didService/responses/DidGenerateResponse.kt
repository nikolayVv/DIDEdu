package com.did.service.didService.responses

data class DidGenerateResponse(
    val firstName: String,
    val lastName: String,
    val email: String,
    val role: String,
    val did: String
)
