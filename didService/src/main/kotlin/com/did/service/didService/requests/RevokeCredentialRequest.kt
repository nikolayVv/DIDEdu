package com.did.service.didService.requests

import javax.validation.constraints.NotEmpty

data class RevokeCredentialRequest(
    @field:NotEmpty
    val credential: String,

    @field:NotEmpty
    var username: String,

    @field:NotEmpty
    var mnemonic: List<String>,

    @field:NotEmpty
    var passphrase: String,

    @field:NotEmpty
    var holderDid: String,

    @field:NotEmpty
    var hash: String,

    @field:NotEmpty
    var batchId: String
)
