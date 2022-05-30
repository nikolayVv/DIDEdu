package com.did.service.didService.responses

import io.iohk.atala.prism.identity.DidDataModel
import io.iohk.atala.prism.identity.PrismDidDataModel

data class DidReadResponse (
    val did: String,
    val didDocument: DidDataModel?,
    val message: String,
)