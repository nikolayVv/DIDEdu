package com.did.service.didService.requests

import kotlinx.serialization.json.JsonObject
import javax.validation.constraints.NotEmpty

data class VerifyCredentialRequest(
    @field:NotEmpty
    val credential: String,

    @field:NotEmpty
    var credentialHash: String,

    @field:NotEmpty
    var batchId: String
)
