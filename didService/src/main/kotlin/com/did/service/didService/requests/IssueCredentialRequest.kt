package com.did.service.didService.requests

import kotlinx.serialization.json.JsonObject
import javax.validation.constraints.NotEmpty

data class IssueCredentialRequest(
    @field:NotEmpty
    var username: String,

    @field:NotEmpty
    var mnemonic: List<String>,

    @field:NotEmpty
    var passphrase: String,

    @field:NotEmpty
    var didHolder: String,

    @field:NotEmpty
    var data: List<CredentialData>
)

data class CredentialData(
    @field:NotEmpty
    var key: String,

    @field:NotEmpty
    var value: String
)
