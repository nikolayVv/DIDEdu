package com.did.service.didService.requests

import kotlinx.serialization.json.JsonObject
import pbandk.ByteArr
import pbandk.UnknownField
import javax.validation.constraints.NotEmpty

data class VerifyCredentialRequest(
    @field:NotEmpty
    val credential: String,

    @field:NotEmpty
    var credentialHash: String,

    @field:NotEmpty
    var batchId: String,

    @field:NotEmpty
    var userEmail: String,

    @field:NotEmpty
    var userId: String,

    @field:NotEmpty
    var issuerDid: String,

    @field:NotEmpty
    var holderDid: String,

    @field:NotEmpty
    var credentialName: String
)
