package com.did.service.didService.responses

data class VerifyCredentialResponse(
    val message: String,
    val errorMessage: String,
    val lastSyncBlock: String
)
