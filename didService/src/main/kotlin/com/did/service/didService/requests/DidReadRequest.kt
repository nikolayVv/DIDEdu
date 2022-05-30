package com.did.service.didService.requests

import javax.validation.constraints.NotEmpty

data class DidReadRequest(
    @field:NotEmpty
    var did: String
)