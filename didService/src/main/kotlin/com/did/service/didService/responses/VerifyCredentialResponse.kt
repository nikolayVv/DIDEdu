package com.did.service.didService.responses

data class VerifyCredentialResponse(
    val message: String,
    val lastSyncBlock: String,
    val token: String
)
