package com.did.service.didService.responses

import io.iohk.atala.prism.api.CredentialClaim
import io.iohk.atala.prism.credentials.content.CredentialContent
import kotlinx.serialization.json.JsonObject

data class IssueCredentialResponse(
    val message: String,
    val credential: String,
    val operationId: String,
    val hash: String,
    val batchId: String
)
