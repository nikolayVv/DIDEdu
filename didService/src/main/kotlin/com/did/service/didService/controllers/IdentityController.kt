package com.did.service.didService.controllers

import com.did.service.didService.repositories.IdentityRepository
import com.did.service.didService.requests.DidGenerateRequest
import com.did.service.didService.responses.DidGenerateResponse
import io.iohk.atala.prism.api.KeyGenerator
import io.iohk.atala.prism.api.models.AtalaOperationId
import io.iohk.atala.prism.api.models.AtalaOperationStatus
import io.iohk.atala.prism.common.PrismSdkInternal
import io.iohk.atala.prism.crypto.Sha256Digest
import io.iohk.atala.prism.crypto.derivation.KeyDerivation
import io.iohk.atala.prism.crypto.derivation.MnemonicCode
import io.iohk.atala.prism.identity.*
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import javax.validation.Valid

@RestController
@RequestMapping("/did", produces = [MediaType.APPLICATION_JSON_VALUE])
class IdentityController {

    val identityRepository: IdentityRepository = IdentityRepository()

    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca"])
    @PostMapping("/register")
    @PrismSdkInternal
    suspend fun generateDID(
        @RequestBody @Valid request: DidGenerateRequest
    ): DidGenerateResponse {
        val seed = try {
            KeyDerivation.binarySeed(MnemonicCode(request.mnemonic), request.username + request.passphrase)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid mnemonic.", e)
        }
        val masterKeyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, MasterKeyUsage, 0)
        val issuingKeyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, IssuingKeyUsage, 0)
        val revocationKeyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, RevocationKeyUsage, 0)

        val unpublishedDID = try {
            PrismDid.buildExperimentalLongFormFromKeys(
                masterKeyPair.publicKey,
                issuingKeyPair.publicKey,
                revocationKeyPair.publicKey
            )
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't create DID from Public keys.", e)
        }

        var message = ""
        var operationId: AtalaOperationId? = null
        if (identityRepository.readFromBlockchain(unpublishedDID.asCanonical().did) === null) {
            operationId = try {
                identityRepository.addToBlockchain(unpublishedDID, masterKeyPair.privateKey, issuingKeyPair.privateKey, revocationKeyPair.privateKey)
            } catch (e: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't add the DID on the blockchain.", e)
            }
        } else {
            message = "Did is already on the blockchain"
        }

        var id = ""
        if (operationId !== null) {
            id = operationId.digest.hexValue
        }

        return DidGenerateResponse(
            did = unpublishedDID.asCanonical().did.toString(),
            message = message,
            operationId = id
        )
    }

    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca"])
    @GetMapping("/{operationId}/status")
    @PrismSdkInternal
    suspend fun checkDidOperationStatus(@PathVariable(value="operationId") operationId: String): String {
        val digest = Sha256Digest.fromHex(operationId);
        val status = try {
            identityRepository.checkStatus(AtalaOperationId(digest));
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't check the status of the operation.", e)
        }
        var statusMessage = ""

        when(status) {
            AtalaOperationStatus.CONFIRMED_AND_APPLIED -> statusMessage = "Success"
            AtalaOperationStatus.AWAIT_CONFIRMATION -> statusMessage = "Confirming"
            AtalaOperationStatus.PENDING_SUBMISSION -> statusMessage = "Pending"
            AtalaOperationStatus.CONFIRMED_AND_REJECTED -> statusMessage = "Rejected"
            AtalaOperationStatus.UNKNOWN_OPERATION -> statusMessage = "Unknown operation"
            else -> statusMessage = "Error"
        }

        return statusMessage
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