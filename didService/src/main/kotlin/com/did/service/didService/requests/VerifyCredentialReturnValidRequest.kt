package com.did.service.didService.requests

import javax.validation.constraints.NotEmpty

data class VerifyCredentialReturnValidRequest (
    @field:NotEmpty
    var users: List<UsersElement>,

    @field:NotEmpty
    var issuerDid: String,

    @field:NotEmpty
    var credentialName: String
)

data class UsersElement (
    @field:NotEmpty
    val user: User,

    @field:NotEmpty
    val credential: Credential
)

data class User (
    @field:NotEmpty
    var email: String,

    @field:NotEmpty
    var id_user: String,

    @field:NotEmpty
    var did: String,

    var role: String
)

data class Credential (
    @field:NotEmpty
    val credential: String,

    @field:NotEmpty
    var batchId: String
)