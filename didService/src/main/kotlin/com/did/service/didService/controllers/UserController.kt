package com.did.service.didService.controllers

import io.swagger.v3.oas.annotations.Operation
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrElse
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import javax.validation.Valid

@RestController
@RequestMapping("/users", produces = [MediaType.APPLICATION_JSON_VALUE])
class UserController {

//    @Autowired
//    lateinit var userRepository: UserRepository
//
//    @Operation(operationId = "createUser", summary = "Create user")
//    @PostMapping("")
//    suspend fun createUser(
//        @RequestBody @Valid request: UserCreateRequest
//    ): UserCreateResponse {
//        val existingUser = userRepository.findByEmail(request.email).awaitFirstOrNull()
//        if(existingUser != null){
//            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate user")
//        }
//
//        val user = User(
//            id = null,
//            email = request.email,
//            firstName = request.firstName,
//            lastName = request.lastName
//        )
//
//        val createdUser = try {
//            userRepository.save(user).awaitFirstOrNull()
//        } catch (e: Exception){
//            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to create user", e)
//        }
//
//        val id = createdUser?.id ?:
//            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing id for created user")
//
//        return UserCreateResponse(
//            id = id,
//            email = createdUser.email,
//            firstName = createdUser.firstName,
//            lastName = createdUser.lastName
//        )
//    }
//
//    @Operation(operationId = "listUsers", summary = "List users")
//    @GetMapping("")
//    suspend fun listUsers(
//        @RequestParam pageNo: Int = 1,
//        @RequestParam pageSize: Int = 10
//    ): PagingResponse<User> {
//        val limit = pageSize
//        val offset = (limit * pageNo) - limit
//        val list = userRepository.findAllUsers(limit, offset).collectList().awaitFirst()
//        val total = userRepository.count().awaitFirst()
//        return PagingResponse(total, list)
//    }
//
//    @Operation(operationId = "updateUser", summary = "List users")
//    @PatchMapping("/{userId}")
//    suspend fun updateUser(
//        @PathVariable userId: Int,
//        @RequestBody @Valid userUpdateRequest: UserUpdateRequest
//    ): UserUpdateResponse {
//        val existingDBUser = userRepository.findById(userId).awaitFirstOrElse {
//            throw ResponseStatusException(HttpStatus.NOT_FOUND, "User #$userId doesn't exist")
//        }
//
//        val duplicateUser = userRepository.findByEmail(userUpdateRequest.email).awaitFirstOrNull()
//        if (duplicateUser != null && duplicateUser.id != userId) {
//            throw ResponseStatusException(
//                HttpStatus.BAD_REQUEST,
//                "Duplicate user: user with email ${userUpdateRequest.email} already exists"
//            )
//        }
//
//        val updatedUser = try {
//            existingDBUser.email = userUpdateRequest.email
//            existingDBUser.firstName = userUpdateRequest.firstName ?: existingDBUser.firstName
//            existingDBUser.lastName = userUpdateRequest.lastName ?: existingDBUser.lastName
//            userRepository.save(existingDBUser).awaitFirst()
//        }catch (e: Exception){
//            throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to update user", e)
//        }
//
//        return UserUpdateResponse(
//            id = updatedUser.id,
//            email = updatedUser.email,
//            firstName = updatedUser.firstName,
//            lastName = updatedUser.lastName
//        )
//    }
//
//    @Operation(operationId = "deleteUser", summary = "Delete user")
//    @DeleteMapping("/{userId}")
//    suspend fun deleteUser(
//        @PathVariable userId: Int
//    ) {
//        val existingUser = userRepository.findById(userId).awaitFirstOrElse {
//            throw ResponseStatusException(HttpStatus.NOT_FOUND, "User #$userId not found")
//        }
//        userRepository.delete(existingUser).subscribe()
//
//    }

}