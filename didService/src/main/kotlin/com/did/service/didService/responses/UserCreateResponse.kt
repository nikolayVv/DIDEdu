package com.johncooper.reactiveKotlin.responses

data class UserCreateResponse(
    val id: Int,
    val firstName: String,
    val lastName: String,
    val email: String
)
