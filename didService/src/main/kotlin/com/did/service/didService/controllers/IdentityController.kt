package com.did.service.didService.controllers

import com.did.service.didService.models.Identity
import com.did.service.didService.models.User
import com.did.service.didService.repositories.IdentityRepository
import com.did.service.didService.requests.DidGenerateRequest
import com.did.service.didService.responses.DidGenerateResponse
import io.iohk.atala.prism.api.KeyGenerator
import io.iohk.atala.prism.common.PrismSdkInternal
import io.iohk.atala.prism.crypto.keys.ECPublicKey
import io.iohk.atala.prism.crypto.keys.toModel
import io.iohk.atala.prism.identity.PrismDid
import io.iohk.atala.prism.protos.CompressedECKeyData
import io.iohk.atala.prism.protos.DID
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import javax.validation.Valid

@RestController
@RequestMapping("/did", produces = [MediaType.APPLICATION_JSON_VALUE])
class IdentityController {

    val identityRepository: IdentityRepository = IdentityRepository()

    @PostMapping("/register")
    @PrismSdkInternal
    suspend fun generateDID(
        @RequestBody @Valid request: DidGenerateRequest
    ): DidGenerateResponse {
        // TODO Check if DID already exists

        val publicKeyCompressed = try {
            CompressedECKeyData(request.publicKey.curve, request.publicKey.data, request.publicKey.unknownFields)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid public key.", e)
        }
        val publicKey = publicKeyCompressed.toModel()

        val unpublishedDID = try {
            PrismDid.buildLongFormFromMasterPublicKey(publicKey)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't create DID from Public key.", e)
        }

        // TODO check if already published and if not publish it
//        val publishedDid = try {
//            //identityRepository.addToBlockchain(unpublishedDID, request.KeyPair.privateKey)
//        } catch (e: Exception) {
//            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't add the DID on the blockchain.", e)
//        }

        // TODO check if it is published

        // TODO Create the credential and issue it


        return DidGenerateResponse(
            firstName = request.firstName,
            lastName = request.lastName,
            email = request.email,
            role = request.role,
            did = unpublishedDID.asCanonical().did.toString()
        )
    }

    // TODO
    suspend fun editDID() {

    }

    // TODO
    suspend fun checkUser() {

    }

    // TODO
    suspend fun issueCredential() {

    }

    // TODO
    suspend fun revokeCredential() {

    }

    // TODO
    suspend fun verifyCredential() {

    }
}