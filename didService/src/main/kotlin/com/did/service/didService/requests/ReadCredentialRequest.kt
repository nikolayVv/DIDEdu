package com.did.service.didService.requests

import com.did.service.didService.DidServiceApplication
import com.did.service.didService.models.CredentialForPresentation
import javax.validation.constraints.NotEmpty

data class ReadCredentialRequest(
    var data: CredentialForPresentation,
)