package com.did.service.didService.requests

import javax.validation.constraints.NotEmpty

data class IssuePresentationRequest(
    @field: NotEmpty
    var title: String,

    @field: NotEmpty
    var subjectTitle: String,

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
    var adminDid: String,

    @field:NotEmpty
    var role: String
)


data class CredentialForPresentation(
    @field:NotEmpty
    var title: String,

    @field:NotEmpty
    var did: String,

    @field:NotEmpty
    var credential: String,

    @field: NotEmpty
    var batchId: String
)