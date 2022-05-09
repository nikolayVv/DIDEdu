package com.did.service.didService.requests

import javax.validation.constraints.NotEmpty


data class DidGenerateRequest(
    @field:NotEmpty
    var username: String,

    @field:NotEmpty
    var mnemonic: List<String>,

    @field:NotEmpty
    var passphrase: String,
)
