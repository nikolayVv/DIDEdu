package com.did.service.didService.models

import javax.validation.constraints.NotEmpty

data class CredentialForPresentation(
    @field:NotEmpty
    var title: String,

    @field:NotEmpty
    var did: String,

    @field:NotEmpty
    var credential: String,

    @field:NotEmpty
    var batchId: String,

    var chosenAttributes: List<CredentialData>
)