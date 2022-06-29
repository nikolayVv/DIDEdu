package com.did.service.didService.responses

import io.iohk.atala.prism.api.CredentialClaim
import io.iohk.atala.prism.credentials.content.CredentialContent
import kotlinx.serialization.json.JsonObject
import pbandk.ByteArr
import pbandk.UnknownField

data class IssueBatchResponse(
    val message: String,
    val credentials: List<String>,
    val operationId: String,
    val hash: String,
    val batchId: String,
)
