package com.did.service.didService.requests

import javax.validation.constraints.Email

data class UserUpdateRequest(
    var firstName: String?,
    var lastName: String?,

    @field:Email
    var email: String
)
