package com.did.service.didService.responses

import io.iohk.atala.prism.credentials.content.CredentialContent

data class RevokeCredentialResponse(
    val message: String,
    val operationId: String
)
