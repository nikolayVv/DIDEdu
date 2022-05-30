package com.did.service.didService.controllers

import com.did.service.didService.repositories.IdentityRepository
import com.did.service.didService.requests.*
import com.did.service.didService.responses.*
import io.iohk.atala.prism.api.CredentialClaim
import io.iohk.atala.prism.api.KeyGenerator
import io.iohk.atala.prism.api.VerificationError
import io.iohk.atala.prism.api.models.AtalaOperationId
import io.iohk.atala.prism.api.models.AtalaOperationStatus
import io.iohk.atala.prism.api.node.NodePayloadGenerator
import io.iohk.atala.prism.common.PrismSdkInternal
import io.iohk.atala.prism.credentials.CredentialBatchId
import io.iohk.atala.prism.credentials.json.JsonBasedCredential
import io.iohk.atala.prism.crypto.MerkleInclusionProof
import io.iohk.atala.prism.crypto.Sha256Digest
import io.iohk.atala.prism.crypto.derivation.KeyDerivation
import io.iohk.atala.prism.crypto.derivation.MnemonicCode
import io.iohk.atala.prism.crypto.keys.ECKeyPair
import io.iohk.atala.prism.identity.*
import kotlinx.serialization.json.*
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*
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
        val keys = try {
            prepareKeysFromMnemonic(MnemonicCode(request.mnemonic), request.username + request.passphrase)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "There was an error generating the keys.", e)
        }

        val unpublishedDID = try {
            PrismDid.buildExperimentalLongFormFromKeys(
                keys[PrismDid.DEFAULT_MASTER_KEY_ID]?.publicKey!!,
                keys[PrismDid.DEFAULT_ISSUING_KEY_ID]?.publicKey!!,
                keys[PrismDid.DEFAULT_REVOCATION_KEY_ID]?.publicKey!!
            )
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't create DID from Public keys.", e)
        }

        var message = ""
        var operationId: AtalaOperationId? = null
        if (identityRepository.readFromBlockchain(unpublishedDID.asCanonical().did) === null) {
            operationId = try {
                identityRepository.addDidToBlockchain(
                    unpublishedDID,
                    keys[PrismDid.DEFAULT_MASTER_KEY_ID]?.privateKey!!,
                    keys[PrismDid.DEFAULT_ISSUING_KEY_ID]?.privateKey!!,
                    keys[PrismDid.DEFAULT_REVOCATION_KEY_ID]?.privateKey!!
                )
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

    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca", "http://localhost:4200"])
    @GetMapping("/{operationId}/status")
    @PrismSdkInternal
    suspend fun checkDidOperationStatus(
        @PathVariable(value="operationId") operationId: String
    ): StatusResponse {
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

        return StatusResponse(
            status = statusMessage
        )
    }

    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca"])
    @PostMapping("/didDocument")
    suspend fun readDid(
        @RequestBody @Valid request: DidReadRequest
    ): DidReadResponse {
        // TODO -> Verify
        // TODO -> Check who the user is and return
        if (request.did.trim().isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "All the data is required!")
        }
        val mainDid = try {
            Did.fromString(request.did)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "illegal DID: ${request.did}", e)
        }

        val model = try {
            identityRepository.readFromBlockchain(mainDid)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the did from the blockchain.", e)
        }

        var message = "Did document successfully retrieved from the blockchain!"
        var didDocument: DidDataModel? = null

        if (model === null) {
            message = "Did document for the did '${request.did}' not found"
        } else {
            didDocument = model.didDataModel
        }

        return DidReadResponse(
            did = request.did,
            message = message,
            didDocument = didDocument
        )
    }

    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca", "http://localhost:4200"])
    @PostMapping("/checkDid")
    suspend fun checkDid(
        @RequestBody @Valid request: DidReadRequest
    ): DidReadResponse {
        // TODO -> Verify
        // TODO -> Check who the user is and return
        if (request.did.trim().isBlank()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "All the data is required!")
        }
        val mainDid = try {
            Did.fromString(request.did)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid DID: ${request.did}!", e)
        }

        val model = try {
            identityRepository.readFromBlockchain(mainDid)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the DID from the blockchain!", e)
        }

        var message = "DID found on the blockchain!"

        if (model === null) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Couldn't find the DID on the blockchain!")
        }
        println(model.didDataModel);

        return DidReadResponse(
            did = request.did,
            message = message,
            didDocument = null
        )
    }

    // TODO
    suspend fun editDID() {

    }

    // TODO
    suspend fun checkUser() {

    }

    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca", "http://localhost:4200"])
    @PostMapping("/issue/credential")
    suspend fun issueCredential(
        @RequestBody @Valid request: IssueCredentialRequest
    ): IssueCredentialResponse {
        val keys = try {
            prepareKeysFromMnemonic(MnemonicCode(request.mnemonic), request.username + request.passphrase)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "There was an error generating the keys.", e)
        }

        val unpublishedDID = try {
            PrismDid.buildExperimentalLongFormFromKeys(
                keys[PrismDid.DEFAULT_MASTER_KEY_ID]?.publicKey!!,
                keys[PrismDid.DEFAULT_ISSUING_KEY_ID]?.publicKey!!,
                keys[PrismDid.DEFAULT_REVOCATION_KEY_ID]?.publicKey!!
            )
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't create DID from Public keys.", e)
        }

        val holderDid = try { Did.fromString(request.didHolder) } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "illegal DID: ${request.didHolder}", e)
        }
        val holderPrismDid = try { PrismDid.fromDid(holderDid) } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "not a Prism DID: $holderDid", e)
        }

        val contents = mutableListOf<Pair<String, JsonPrimitive>>()
        for (content in request.data) {
            contents.add(Pair(content.key, JsonPrimitive(content.value)))
        }
        val content = JsonObject(contents.toMap())
        val credentialClaim = CredentialClaim(
            subjectDid = holderPrismDid,
            content = content
        )

        println(credentialClaim)

        val issuerNodePayloadGenerator = NodePayloadGenerator(
            unpublishedDID,
            mapOf(PrismDid.DEFAULT_ISSUING_KEY_ID to keys[PrismDid.DEFAULT_ISSUING_KEY_ID]?.privateKey!!)
        )

        val issueCredentialsInfo = issuerNodePayloadGenerator.issueCredentials(
            PrismDid.DEFAULT_ISSUING_KEY_ID,
            arrayOf(credentialClaim)
        )

        var operationId = try {
            identityRepository.issueCredentialToBlockchain(unpublishedDID, issueCredentialsInfo)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't add the credential on the blockchain.", e)
        }
        var message = "Credential was successfully issued!"

        val holderSignedCredential = issueCredentialsInfo.credentialsAndProofs.first().signedCredential
        println(holderSignedCredential)
        println()
        println(holderSignedCredential.content)
        println()
        println(holderSignedCredential.isValidSignature(keys[PrismDid.DEFAULT_ISSUING_KEY_ID]?.publicKey!!))
        println(holderSignedCredential.isValidSignature(keys[PrismDid.DEFAULT_MASTER_KEY_ID]?.publicKey!!))

        var id = ""
        if (operationId !== null) {
            id = operationId.digest.hexValue
        } else {
            message = "There was a problem, when trying to add the credential on the blockchain!"
        }


        var json: JsonObject? = null
        var hash = ""
        println(issueCredentialsInfo.credentialsAndProofs)
        if (issueCredentialsInfo !== null) {
            hash = issueCredentialsInfo.operationHash.hexValue
            for (info in issueCredentialsInfo.credentialsAndProofs) {
                println(" - ${info.signedCredential.hash().hexValue}")
                json = JsonObject(mapOf(
                    "encodedSignedCredential" to JsonPrimitive(info.signedCredential.canonicalForm),
                    "proof" to Json.parseToJsonElement(info.inclusionProof.encode())
                ))
            }
        } else {
            message = "There was a problem, when trying to create the credential!"
        }

        return IssueCredentialResponse(
            message= message,
            credential = json.toString(),
            operationId = id,
            hash = hash,
            batchId = issueCredentialsInfo.batchId.toString()
        )
    }

    // TODO -> week 4
    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca"])
    @PostMapping("/issue/batch")
    suspend fun issueBatch() {}

    // TODO
    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca"])
    @PostMapping("/revoke/credential")
    suspend fun revokeCredential(
        @RequestBody @Valid request: RevokeCredentialRequest
    ): RevokeCredentialResponse {
        val keys = try {
            prepareKeysFromMnemonic(MnemonicCode(request.mnemonic), request.username + request.passphrase)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "There was an error generating the keys.", e)
        }
        val oldHash = try {
            Sha256Digest.fromHex(request.oldHash)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid old hash", e)
        }
        val batchId = try {
            CredentialBatchId.fromString(request.batchId)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid batchId", e)
        }
        val credentialHash = try {
            Sha256Digest.fromHex(request.credentialHash)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid credential hash", e)
        }

        val unpublishedDID = try {
            PrismDid.buildExperimentalLongFormFromKeys(
                keys[PrismDid.DEFAULT_MASTER_KEY_ID]?.publicKey!!,
                keys[PrismDid.DEFAULT_ISSUING_KEY_ID]?.publicKey!!,
                keys[PrismDid.DEFAULT_REVOCATION_KEY_ID]?.publicKey!!
            )
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't create DID from Public keys.", e)
        }

        val nodePayloadGenerator = NodePayloadGenerator(
            unpublishedDID,
            mapOf(PrismDid.DEFAULT_REVOCATION_KEY_ID to keys[PrismDid.DEFAULT_REVOCATION_KEY_ID]?.privateKey!!)
        )

        val revokeInfo = nodePayloadGenerator.revokeCredentials(
            PrismDid.DEFAULT_REVOCATION_KEY_ID,
            oldHash,
            batchId!!.id,
            arrayOf(credentialHash)
        )

        var operationId = try {
            identityRepository.revokeCredentialFromBlockchain(unpublishedDID, revokeInfo, oldHash, batchId, credentialHash)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't revoke the credential from the blockchain.", e)
        }
        var message = "Credential was successfully revoked!"

        var id = ""
        if (operationId !== null) {
            id = operationId.digest.hexValue
        } else {
            message = "There was a problem, when trying to revoke the credential from the blockchain!"
        }

        if (revokeInfo === null) {
            message = "There was a problem, when trying to revoke the credential!"
        }

        return RevokeCredentialResponse(
            message= message,
            operationId = id
        )

    }

    // TODO -> week 4
    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca"])
    @PostMapping("/revoke/batch")
    suspend fun revokeBatch() {

    }

    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca"])
    @PostMapping("/revocationTime")
    suspend fun getRevocationTime(
        @RequestBody @Valid request: RevokeCredentialRequest
    ): RevocationTimeResponse {
        val batchId = try {
            CredentialBatchId.fromString(request.batchId)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid batchId", e)
        }
        val credentialHash = try {
            Sha256Digest.fromHex(request.credentialHash)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid credential hash", e)
        }

        val result = try {
            identityRepository.checkRevocationTime(batchId!!, credentialHash)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't get the revocation time from the blockchain", e)
        }

        var message = "The revocation time is successfully received!"
        if (result === null) {
            message = "There is no revocation time for that credential!"
        }

        return RevocationTimeResponse(
            message = message,
            result = result
        )
    }

    // TODO
    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca"])
    @PostMapping("/verify/credential")
    suspend fun verifyCredential(
        @RequestBody @Valid request: VerifyCredentialRequest
    ): VerifyCredentialResponse {
        println("INSIDE")
        val json = try {
            Json.parseToJsonElement(request.credential).jsonObject
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't revert string to json", e)
        }
        println("INSIDE")

        val credential = try {
            JsonBasedCredential.fromString(json["encodedSignedCredential"]?.jsonPrimitive?.content!!)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the credential", e)
        }
        val proof = try {
            MerkleInclusionProof.decode(json["proof"]?.jsonObject.toString())
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the proof", e)
        }
        val batchId = try {
            CredentialBatchId.fromString(request.batchId)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid batchId", e)
        }
        val credentialHash = try {
            Sha256Digest.fromHex(request.credentialHash)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid credential hash", e)
        }

        println("cred: $credential")
        println("proof: $proof")
        println()

        val status = try {
            identityRepository.verifyCredentialFromBlockchain(credential, proof)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "There was an error verifying the credential", e)
        }

        // Check if it is on th blockchain
        println("result: $status")
        var message = "Valid"
        var errorMessage = ""
        val lastSyncBlock = Date(status.lastSyncBlockTimestamp?.seconds!! * 1000).toString()
        if (!status.verificationErrors.isEmpty()) {
            message = "Not Valid"
            //TODO -> check if it is revoked -> get credential revocation time
            val revocationTime = try {
                identityRepository.checkRevocationTime(batchId!!, credentialHash)
            } catch (e: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't get the revocation time from the blockchain", e)
            }
            if (status.verificationErrors.contains(VerificationError.CredentialWasRevokedOn(
                revocationTime.ledgerData!!.timestampInfo
            ))) {
                message = "The credential is revoked"
            }
            //TODO -> check if the issuer signed it
            //TODO -> check if the holder is has that credential
            errorMessage = status.verificationErrors[0].errorMessage
        }

        //println(holderSignedCredential.isValidSignature(keys[PrismDid.DEFAULT_ISSUING_KEY_ID]?.publicKey!!))
        //println(holderSignedCredential.isValidSignature(keys[PrismDid.DEFAULT_MASTER_KEY_ID]?.publicKey!!))


        return VerifyCredentialResponse(
            message = message,
            errorMessage = errorMessage,
            lastSyncBlock = lastSyncBlock
        )
    }

    private fun prepareKeysFromMnemonic(
        mnemonic: MnemonicCode,
        password: String
    ): Map<String, ECKeyPair> {
        val seed = try {
            KeyDerivation.binarySeed(mnemonic, password)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid mnemonic.", e)
        }

        val masterKeyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, MasterKeyUsage, 0)
        val issuingKeyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, IssuingKeyUsage, 0)
        val revocationKeyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, RevocationKeyUsage, 0)

        return mapOf(
            Pair(PrismDid.DEFAULT_MASTER_KEY_ID, masterKeyPair),
            Pair(PrismDid.DEFAULT_ISSUING_KEY_ID, issuingKeyPair),
            Pair(PrismDid.DEFAULT_REVOCATION_KEY_ID, revocationKeyPair)
        )
    }
}