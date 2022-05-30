package com.did.service.didService.requests

import javax.validation.constraints.NotEmpty

data class RevokeCredentialRequest(
    @field:NotEmpty
    var username: String,

    @field:NotEmpty
    var mnemonic: List<String>,

    @field:NotEmpty
    var passphrase: String,

    @field:NotEmpty
    var didHolder: String,

    @field:NotEmpty
    var oldHash: String,

    @field:NotEmpty
    var credentialHash: String,

    @field:NotEmpty
    var batchId: String
)
