package com.did.service.didService.responses

import com.did.service.didService.models.CredentialData
import kotlinx.serialization.json.JsonElement

data class ReadCredentialResponse(
    val message: String,
    val credential: Array<CredentialData>
)
