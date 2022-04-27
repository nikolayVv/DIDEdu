package com.did.service.didService.requests

import javax.validation.constraints.Email
import javax.validation.constraints.NotEmpty

data class UserCreateRequest(
    @field:NotEmpty
    var firstName: String,

    @field:NotEmpty
    var lastName: String,

    @field:Email
    var email: String
)
