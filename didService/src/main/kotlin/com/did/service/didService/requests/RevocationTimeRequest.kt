package com.did.service.didService.requests

import javax.validation.constraints.NotEmpty

data class RevocationTimeRequest(
    @field:NotEmpty
    var credentialHash: String,

    @field:NotEmpty
    var batchId: String
)
