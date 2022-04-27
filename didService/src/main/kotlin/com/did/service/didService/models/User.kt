package com.did.service.didService.models

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table

@Table("users")
data class User(
    @Id
    var id: Int? = null,
    var firstName: String,
    var lastName: String,
    var email: String
)
