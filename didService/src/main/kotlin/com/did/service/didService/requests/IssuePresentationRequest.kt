package com.did.service.didService.requests

import com.did.service.didService.models.CredentialForPresentation
import javax.validation.constraints.NotEmpty

data class IssuePresentationRequest(
    @field: NotEmpty
    var title: String,

    @field: NotEmpty
    var subjectTitle: String,

    @field: NotEmpty
    var currCourse: String,

    @field:NotEmpty
    var username: String,

    @field:NotEmpty
    var mnemonic: List<String>,

    @field:NotEmpty
    var passphrase: String,

    @field:NotEmpty
    var didHolders: List<String>,

    var credentials: List<CredentialForPresentation>,

    @field:NotEmpty
    var userEmail: String,

    @field:NotEmpty
    var userId: String,

    @field:NotEmpty
    var studentDid: String,

    @field:NotEmpty
    var role: String,

    var obligations: List<String>
)


