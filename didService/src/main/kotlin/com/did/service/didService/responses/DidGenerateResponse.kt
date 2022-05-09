package com.did.service.didService.responses

import io.iohk.atala.prism.api.models.AtalaOperationId
import io.iohk.atala.prism.identity.PrismDidDataModel

data class DidGenerateResponse(
    val did: String,
    val message: String,
    val operationId: String
)
