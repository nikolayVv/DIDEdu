package com.did.service.didService.responses

import io.iohk.atala.prism.api.node.GetCredentialRevocationTimeResult

data class RevocationTimeResponse (
    val message: String,
    val result: GetCredentialRevocationTimeResult?
)