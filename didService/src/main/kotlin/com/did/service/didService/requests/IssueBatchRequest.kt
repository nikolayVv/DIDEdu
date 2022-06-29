package com.did.service.didService.requests

import com.did.service.didService.models.CredentialData
import javax.validation.constraints.NotEmpty

data class IssueBatchRequest(
    @field:NotEmpty
    var username: String,

    @field:NotEmpty
    var mnemonic: List<String>,

    @field:NotEmpty
    var passphrase: String,

    @field:NotEmpty
    var data: List<Holder>
)

data class Holder(
    val did: String,

    var credential: List<CredentialData>
)

