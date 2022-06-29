package com.did.service.didService.models

import javax.validation.constraints.NotEmpty

data class CredentialData(
    @field:NotEmpty
    var key: String,

    @field:NotEmpty
    var value: String
)
