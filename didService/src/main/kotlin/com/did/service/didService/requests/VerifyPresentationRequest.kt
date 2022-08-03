package com.did.service.didService.requests

import com.did.service.didService.models.CredentialData
import kotlinx.serialization.json.JsonObject
import pbandk.ByteArr
import pbandk.UnknownField
import javax.security.auth.Subject
import javax.validation.constraints.NotEmpty

data class VerifyPresentationRequest(
    @field:NotEmpty
    var title: String,

    @field:NotEmpty
    var subjectTitle: String,

    @field:NotEmpty
    var issuerDid: String,

    @field:NotEmpty
    val credential: String,

    @field:NotEmpty
    var batchId: String,

    var data: List<CredentialData>
)
