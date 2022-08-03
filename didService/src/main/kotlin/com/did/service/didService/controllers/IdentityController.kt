package com.did.service.didService.controllers

import com.did.service.didService.models.CredentialData
import com.did.service.didService.repositories.IdentityRepository
import com.did.service.didService.requests.*
import com.did.service.didService.responses.*
import io.iohk.atala.prism.api.CredentialClaim
import io.iohk.atala.prism.api.KeyGenerator
import io.iohk.atala.prism.api.VerificationError
import io.iohk.atala.prism.api.models.AtalaOperationId
import io.iohk.atala.prism.api.models.AtalaOperationStatus
import io.iohk.atala.prism.api.node.NodePayloadGenerator
import io.iohk.atala.prism.api.node.PrismDidState
import io.iohk.atala.prism.common.PrismSdkInternal
import io.iohk.atala.prism.credentials.CredentialBatchId
import io.iohk.atala.prism.credentials.json.JsonBasedCredential
import io.iohk.atala.prism.crypto.MerkleInclusionProof
import io.iohk.atala.prism.crypto.Sha256Digest
import io.iohk.atala.prism.crypto.derivation.KeyDerivation
import io.iohk.atala.prism.crypto.derivation.MnemonicCode
import io.iohk.atala.prism.crypto.keys.ECKeyPair
import io.iohk.atala.prism.crypto.keys.ECPublicKey
import io.iohk.atala.prism.crypto.keys.toModel
import io.iohk.atala.prism.crypto.keys.toProto
import io.iohk.atala.prism.identity.*
import io.iohk.atala.prism.protos.CompressedECKeyData
import io.iohk.atala.prism.protos.models.toProto
import kotlinx.serialization.json.*
import org.h2.value.Value.JSON
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import pbandk.ByteArr
import reactor.kotlin.core.publisher.toMono
import java.security.PublicKey
import java.util.*
import javax.validation.Valid
import kotlin.math.max

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

    @OptIn(PrismSdkInternal::class)
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
        val model = getModel(request.did)

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

    @OptIn(PrismSdkInternal::class)
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

        var id = ""
        if (operationId !== null) {
            id = operationId.digest.hexValue
        } else {
            message = "There was a problem, when trying to add the credential on the blockchain!"
        }


        var json: JsonObject? = null
        var hash = ""
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
            batchId = issueCredentialsInfo.batchId.id,
        )
    }

    // TODO -> week 4
    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca", "http://localhost:4200"])
    @PostMapping("/issue/batch")
    suspend fun issueBatch(
        @RequestBody @Valid request: IssueBatchRequest
    ): IssueBatchResponse {
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

        val claims = mutableListOf<CredentialClaim>()

        for (holder in request.data) {
            val holderDid = try { Did.fromString(holder.did) } catch (e: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "illegal DID: ${holder.did}", e)
            }
            val holderPrismDid = try { PrismDid.fromDid(holderDid) } catch (e: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "not a Prism DID: $holderDid", e)
            }

            val contents = mutableListOf<Pair<String, JsonPrimitive>>()
            for (content in holder.credential) {
                contents.add(Pair(content.key, JsonPrimitive(content.value)))
            }
            val content = JsonObject(contents.toMap())
            val credentialClaim = CredentialClaim(
                subjectDid = holderPrismDid,
                content = content
            )

            claims.add(credentialClaim)
        }

        val issuerNodePayloadGenerator = NodePayloadGenerator(
            unpublishedDID,
            mapOf(PrismDid.DEFAULT_ISSUING_KEY_ID to keys[PrismDid.DEFAULT_ISSUING_KEY_ID]?.privateKey!!)
        )

        val issueCredentialsInfo = issuerNodePayloadGenerator.issueCredentials(
            PrismDid.DEFAULT_ISSUING_KEY_ID,
            claims.toTypedArray()
        )

        var operationId = try {
            identityRepository.issueCredentialToBlockchain(unpublishedDID, issueCredentialsInfo)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't add the credential on the blockchain.", e)
        }
        var message = "Batch was successfully issued!"

        var id = ""
        if (operationId !== null) {
            id = operationId.digest.hexValue
        } else {
            message = "There was a problem, when trying to add the credential on the blockchain!"
        }


        var json: MutableList<String> = mutableListOf()
        var hash = ""
        if (issueCredentialsInfo !== null) {
            hash = issueCredentialsInfo.operationHash.hexValue
            for (info in issueCredentialsInfo.credentialsAndProofs) {
                println(" - ${info.signedCredential.hash().hexValue}")
                json.add(JsonObject(mapOf(
                    "encodedSignedCredential" to JsonPrimitive(info.signedCredential.canonicalForm),
                    "proof" to Json.parseToJsonElement(info.inclusionProof.encode())
                )).toString())
            }
        } else {
            message = "There was a problem, when trying to create the credential!"
        }

        return IssueBatchResponse(
            message= message,
            credentials = json,
            operationId = id,
            hash = hash,
            batchId = issueCredentialsInfo.batchId.id,
        )
    }

    @OptIn(PrismSdkInternal::class)
    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca", "http://localhost:4200"])
    @PostMapping("/issue/presentation")
    suspend fun issuePresentation(
        @RequestBody @Valid request: IssuePresentationRequest
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

        var isAuth = false
        var isEnrolled = false

        val obligations = mutableListOf<String>()

        for (credentialData in request.credentials) {
            //verify each
            val json = try {
                Json.parseToJsonElement(credentialData.credential).jsonObject
            } catch (e: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: Couldn't revert string to json!", e)
            }

            val credential = try {
                JsonBasedCredential.fromString(json["encodedSignedCredential"]?.jsonPrimitive?.content!!)
            } catch (e: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: Couldn't read the credential!", e)
            }
            val proof = try {
                MerkleInclusionProof.decode(json["proof"]?.jsonObject.toString())
            } catch (e: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: Couldn't read the proof!", e)
            }
            val batchId = try {
                CredentialBatchId.fromString(credentialData.batchId)
            } catch (e: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: Invalid batchId!", e)
            }
            if (batchId === null) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: Couldn't generate batch!")
            }
            val credentialHash = proof.hash


            val status = try {
                identityRepository.verifyCredentialFromBlockchain(credential, proof)
            } catch (e: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: There was an error verifying the credential from the blockchain!", e)
            }

            // Check if it is on the blockchain
            if (status.verificationErrors.isNotEmpty()) {
                val revocationTime = try {
                    identityRepository.checkRevocationTime(batchId, credentialHash)
                } catch (e: Exception) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: Couldn't get the revocation time from the blockchain", e)
                }


                if (revocationTime.ledgerData !== null && status.verificationErrors.contains(VerificationError.CredentialWasRevokedOn(revocationTime.ledgerData!!.timestampInfo))) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: The credential is revoked!")
                } else if (revocationTime.ledgerData !== null && status.verificationErrors.contains(VerificationError.BatchWasRevokedOn(revocationTime.ledgerData!!.timestampInfo))) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: The batch is revoked!")
                } else if (status.verificationErrors.contains(VerificationError.IssuerDidNotFoundInCredential)) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: Couldn't find the issuer's did on the chain!")
                } else if (status.verificationErrors.contains(VerificationError.InvalidMerkleProof)) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: Invalid proof!")
                } else if (status.verificationErrors.contains(VerificationError.BatchNotFoundOnChain(batchId.id))) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: Couldn't find the batch on the chain!")
                } else if (status.verificationErrors.contains(VerificationError.IssuerKeyNotFoundInCredential)) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: Couldn't find the issuer's key in the credential!")
                } else {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: " + status.verificationErrors[0].errorMessage)
                }
            }

            val credentials = credential.content.getField("credentialSubject")!!.jsonObject.entries

            val credentialName = credentials.first().value.toString()
            obligations.add(credentialName)
            if (!credentialName.equals("\"${credentialData.title}\"")) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "${credentialData.title}: The credential name in the credential doesn't match with the credential name in the database!")
            }

            var isSigned = false

            if (credentialName.equals("\"DIDEdu-Auth\"") || credentialName.equals("\"${request.currCourse} (Enrollment)\"")) {
                if (!credential.isValidSignature(keys[PrismDid.DEFAULT_ISSUING_KEY_ID]?.publicKey!!)) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The credential '${credentialData.title}' is not signed by the DIDEdu issuing key!")
                } else {
                    if (credentialName.equals("\"DIDEdu-Auth\"")) {
                        isAuth = true
                    } else {
                        isEnrolled = true
                    }
                }
            } else {
                for (signerDid in request.didHolders) {
                    val model = getModel(signerDid)
                    val issuerPublicKey = model!!.toProto().publicKeys.find { it.id.equals(PrismDid.DEFAULT_ISSUING_KEY_ID) }
                    val ECIssuerPublicKey = issuerPublicKey!!.compressedEcKeyData!!.toModel()
                    if (credential.isValidSignature(ECIssuerPublicKey)) {
                        isSigned = true
                        break
                    }
                }

                if (!isSigned) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The credential '${credentialData.title}' is not signed by any of the professors in the course!")
                }
            }

            var attributesValid = true
            var attributesInside: Boolean

            var toCalculate = false
            var minValue = -1
            var maxValue = -1
            var value = -1
            var result = ""

            for (attribute in credentialData.chosenAttributes) {
                attributesInside = false
                if (attribute.key.equals("minValue")) {
                    minValue = attribute.value.toInt()
                } else if (attribute.key.equals("maxValue")) {
                    maxValue = attribute.value.toInt()
                } else if (attribute.key.equals("value")) {
                    toCalculate = true
                    value = attribute.value.toInt()
                } else if (attribute.key.equals("result")) {
                    toCalculate = false
                    result = attribute.value
                }
                for (data in credentials) {
                    if (attribute.key.equals(data.key)) {
                        attributesInside = true
                        if (!attribute.value.equals(data.value.toString().replace("\"", ""))) {
                            attributesValid = false
                            break
                        }
                    }
                }
                if (!attributesInside || attributesInside && !attributesValid) {
                    if (!attributesInside) {
                        throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't find the attribute '${attribute.key}' in the credential '${credentialData.title}'!")
                    } else {
                        throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The value of the attribute '${attribute.key}' doesn't match that in the credential '${credentialData.title}'!")
                    }
                }
            }

            if (toCalculate && value != -1 && minValue != -1 && maxValue != -1 && !credentialName.equals("\"DIDEdu-Auth\"") && !credentialName.equals("\"${request.currCourse} (Enrollment)\"")) {
                if (value < minValue) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't create the presentation! You don't have enough points to pass the obligation '${credentialData.title}'!")
                }
            } else if (result != "" && !credentialName.equals("\"DIDEdu-Auth\"") && !credentialName.equals("\"${request.currCourse} (Enrollment)\"")) {
                if (result.equals("Failed")) {
                    throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't create the presentation! You haven't successfully passed the obligation '${credentialData.title}'!")
                }
            } else if (!credentialName.equals("\"DIDEdu-Auth\"") && !credentialName.equals("\"${request.currCourse} (Enrollment)\"")) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Something went wrong when verifying the obligation '${credentialData.title}'! Please check again the attributes you send!")
            }

            val holderDid = credentials.last().value.toString()
            if (!holderDid.equals("\"${credentialData.did}\"")) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The holder DID in the credential '${credentialData.title}' doesn't match the holder DID in the database!")
            }
        }
        if (!isEnrolled && !isAuth) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The enrollment or authentication credential is missing")
        }

        for (obligation in request.obligations) {
            if (!obligations.contains(obligation)) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The credential for the obligation '${obligation}' is missing")
            }
        }

        val contents = mutableListOf<Pair<String, JsonPrimitive>>()
        contents.add(Pair("credentialName", JsonPrimitive(request.title)))
        contents.add(Pair("subjectTitle", JsonPrimitive(request.subjectTitle)))
        contents.add(Pair("result", JsonPrimitive("Passed")))

        val content = JsonObject(contents.toMap())
        val holderDid = try { Did.fromString(request.studentDid) } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "illegal DID: ${request.studentDid}", e)
        }
        val holderPrismDid = try { PrismDid.fromDid(unpublishedDID.asCanonical().did) } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "not a Prism DID: $holderDid", e)
        }

        val credentialClaim = CredentialClaim(
            subjectDid = holderPrismDid,
            content = content
        )

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
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't add the presentation on the blockchain.", e)
        }
        var message = "Presentation was successfully issued!"

        var id = ""
        if (operationId !== null) {
            id = operationId.digest.hexValue
        } else {
            message = "There was a problem, when trying to add the presentation on the blockchain!"
        }


        var json: JsonObject? = null
        var hash = ""
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
            message = "There was a problem, when trying to create the presentation!"
        }

        return IssueCredentialResponse(
            message= message,
            credential = json.toString(),
            operationId = id,
            hash = hash,
            batchId = issueCredentialsInfo.batchId.id,
        )
    }

    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca", "http://localhost:4200"])
    @PostMapping("/revoke/credential")
    suspend fun revokeCredential(
        @RequestBody @Valid request: RevokeCredentialRequest
    ): RevokeCredentialResponse {
        val json = try {
            Json.parseToJsonElement(request.credential).jsonObject
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't revert string to json!", e)
        }
        val credential = try {
            JsonBasedCredential.fromString(json["encodedSignedCredential"]?.jsonPrimitive?.content!!)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the credential!", e)
        }
        val proof = try {
            MerkleInclusionProof.decode(json["proof"]?.jsonObject.toString())
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the proof!", e)
        }
        val credentialHash = proof.hash

        val keys = try {
            prepareKeysFromMnemonic(MnemonicCode(request.mnemonic), request.username + request.passphrase)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "There was an error generating the keys.", e)
        }
        val oldHash = try {
            Sha256Digest.fromHex(request.hash)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid old hash", e)
        }
        val batchId = try {
            CredentialBatchId.fromString(request.batchId)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid batchId", e)
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

        if (!credential.isValidSignature(keys[PrismDid.DEFAULT_ISSUING_KEY_ID]?.publicKey!!)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The credential is not signed by the issuing key!")
        }

        val credentials = credential.content.getField("credentialSubject")!!.jsonObject.entries
        val holderDid = credentials.last().value.toString()

        if (!holderDid.equals("\"${request.holderDid}\"")) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The holder DID in the credential doesn't match with the holder DID in the database!")
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

        if (operationId === null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "There was a problem, when trying to revoke the credential from the blockchain!")
        }

        if (revokeInfo === null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "There was a problem, when trying to revoke the credential!")
        }

        return RevokeCredentialResponse(
            message= "Credential was successfully revoked!",
            operationId = operationId.digest.hexValue
        )

    }

    // TODO -> week 4
    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca"])
    @PostMapping("/revoke/batch")
    suspend fun revokeBatch() {

    }

//    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca"])
//    @PostMapping("/revocationTime")
//    suspend fun getRevocationTime(
//        @RequestBody @Valid request: RevokeCredentialRequest
//    ): RevocationTimeResponse {
//        val batchId = try {
//            CredentialBatchId.fromString(request.batchId)
//        } catch (e: Exception) {
//            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid batchId", e)
//        }
//        val credentialHash = try {
//            Sha256Digest.fromHex(request.credentialHash)
//        } catch (e: Exception) {
//            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid credential hash", e)
//        }
//
//        val result = try {
//            identityRepository.checkRevocationTime(batchId!!, credentialHash)
//        } catch (e: Exception) {
//            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't get the revocation time from the blockchain", e)
//        }
//
//        var message = "The revocation time is successfully received!"
//        if (result === null) {
//            message = "There is no revocation time for that credential!"
//        }
//
//        return RevocationTimeResponse(
//            message = message,
//            result = result
//        )
//    }

    @OptIn(PrismSdkInternal::class)
    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca", "http://localhost:4200"])
    @PostMapping("/read/credential")
    suspend fun readCredential(
        @RequestBody @Valid request: ReadCredentialRequest
    ): ReadCredentialResponse {
        val json = try {
            Json.parseToJsonElement(request.data.credential).jsonObject
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't revert string to json!", e)
        }

        val credential = try {
            JsonBasedCredential.fromString(json["encodedSignedCredential"]?.jsonPrimitive?.content!!)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the credential!", e)
        }
        val batchId = try {
            CredentialBatchId.fromString(request.data.batchId)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid batchId!", e)
        }
        if (batchId === null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't generate batch!")
        }

        val credentials = credential.content.getField("credentialSubject")!!.jsonObject.entries

        val returnCredential: MutableList<CredentialData> = mutableListOf()

        for (credentialData in credentials) {
            returnCredential.add(CredentialData(
                key = credentialData.key.replace("\"", ""),
                value = credentialData.value.toString().replace("\"", "")
            ))
        }

        println(credential)
        println(returnCredential)

        return ReadCredentialResponse(
            message = "Credential successfully read!",
            credential = returnCredential.toTypedArray()
        )
    }


    @OptIn(PrismSdkInternal::class)
    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca", "http://localhost:4200"])
    @PostMapping("/verify/credential/returnValid")
    suspend fun verifyCredentialAndReturn(
        @RequestBody @Valid request: VerifyCredentialReturnValidRequest
    ): VerifyCredentialReturnValidResponse {
        var isValid: Boolean
        var result: MutableList<User> = arrayListOf()

        request.users.forEach{ userElement ->
            isValid = true

            val json: JsonObject = Json.parseToJsonElement(userElement.credential.credential).jsonObject

            val credential = JsonBasedCredential.fromString(json["encodedSignedCredential"]?.jsonPrimitive?.content!!)

            val proof = MerkleInclusionProof.decode(json["proof"]?.jsonObject.toString())

            val batchId = CredentialBatchId.fromString(userElement.credential.batchId)

            if (batchId === null) {
                isValid = false
            }

            val credentialHash = proof.hash

            val status = identityRepository.verifyCredentialFromBlockchain(credential, proof)

            // Check if it is on the blockchain
            if (!status.verificationErrors.isEmpty()) {
                val revocationTime = identityRepository.checkRevocationTime(batchId!!, credentialHash)

                if (revocationTime !== null && status.verificationErrors.contains(VerificationError.CredentialWasRevokedOn(revocationTime.ledgerData!!.timestampInfo))) {
                    isValid = false
                } else if (revocationTime !== null && status.verificationErrors.contains(VerificationError.BatchWasRevokedOn(revocationTime.ledgerData!!.timestampInfo))) {
                    isValid = false
                } else if (status.verificationErrors.contains(VerificationError.IssuerDidNotFoundInCredential)) {
                    isValid = false
                } else if (status.verificationErrors.contains(VerificationError.InvalidMerkleProof)) {
                    isValid = false
                } else if (status.verificationErrors.contains(VerificationError.BatchNotFoundOnChain(batchId.id))) {
                    isValid = false
                } else if (status.verificationErrors.contains(VerificationError.IssuerKeyNotFoundInCredential)) {
                    isValid = false
                } else {
                    isValid = false
                }
            }


            val model = getModel(request.issuerDid)
            val issuerPublicKey = model!!.toProto().publicKeys.find { it.id.equals(PrismDid.DEFAULT_ISSUING_KEY_ID) }
            val ECIssuerPublicKey = issuerPublicKey!!.compressedEcKeyData!!.toModel()
            if (!credential.isValidSignature(ECIssuerPublicKey)) {
                isValid = false
            }


            val credentials = credential.content.getField("credentialSubject")!!.jsonObject.entries
            var emailValid = false
            var idValid = false
            var roleValid = true
            for (credentialData in credentials) {
                if (credentialData.key.equals("userId")) {
                    if (credentialData.value.toString().equals("\"${userElement.user.id_user}\"")) {
                        idValid = true
                    } else {
                        break
                    }
                }
                if (credentialData.key.equals("userEmail")) {
                    if (credentialData.value.toString().equals("\"${userElement.user.email}\"")) {
                        emailValid = true
                    } else {
                        break
                    }
                }
                if (credentialData.key.equals("role")) {
                    if (!credentialData.value.toString().equals("\"${userElement.user.role}\"")) {
                        roleValid = false
                        break
                    }
                }
            }
            if (!idValid || !emailValid || !roleValid) {
                isValid = false
            }

            //TODO -> Check for one more key (sign with 2 keys - 1 for issuer, 1 for website)
            val holderDid = credentials.last().value.toString()
            if (!holderDid.equals("\"${userElement.user.did}\"")) {
                isValid = false
            }

            val credentialName = credentials.first().value.toString()
            if (!credentialName.equals("\"${request.credentialName}\"")) {
                isValid = false
            }
            
            if (isValid) {
                result.add(userElement.user)
            }
        }

        return VerifyCredentialReturnValidResponse(
            filteredUsers = result.toList()
        )
    }

    @OptIn(PrismSdkInternal::class)
    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca", "http://localhost:4200"])
    @PostMapping("/verify/credential")
    suspend fun verifyCredential(
        @RequestBody @Valid request: VerifyCredentialRequest
    ): VerifyCredentialResponse {
        val json = try {
            Json.parseToJsonElement(request.credential).jsonObject
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't revert string to json!", e)
        }

        val credential = try {
            JsonBasedCredential.fromString(json["encodedSignedCredential"]?.jsonPrimitive?.content!!)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the credential!", e)
        }
        val proof = try {
            MerkleInclusionProof.decode(json["proof"]?.jsonObject.toString())
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the proof!", e)
        }
        val batchId = try {
            CredentialBatchId.fromString(request.batchId)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid batchId!", e)
        }
        if (batchId === null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't generate batch!")
        }
        val credentialHash = proof.hash


        val status = try {
            identityRepository.verifyCredentialFromBlockchain(credential, proof)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "There was an error verifying the credential from the blockchain!", e)
        }

        // Check if it is on the blockchain
        if (!status.verificationErrors.isEmpty()) {
            val revocationTime = try {
                identityRepository.checkRevocationTime(batchId, credentialHash)
            } catch (e: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't get the revocation time from the blockchain", e)
            }

            if (revocationTime !== null && status.verificationErrors.contains(VerificationError.CredentialWasRevokedOn(revocationTime.ledgerData!!.timestampInfo))) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The credential is revoked!")
            } else if (revocationTime !== null && status.verificationErrors.contains(VerificationError.BatchWasRevokedOn(revocationTime.ledgerData!!.timestampInfo))) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The batch is revoked!")
            } else if (status.verificationErrors.contains(VerificationError.IssuerDidNotFoundInCredential)) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't find the issuer's did on the chain!")
            } else if (status.verificationErrors.contains(VerificationError.InvalidMerkleProof)) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid proof!")
            } else if (status.verificationErrors.contains(VerificationError.BatchNotFoundOnChain(batchId.id))) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't find the batch on the chain!")
            } else if (status.verificationErrors.contains(VerificationError.IssuerKeyNotFoundInCredential)) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't find the issuer's key in the credential!")
            } else {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, status.verificationErrors[0].errorMessage)
            }
        }

        val model = getModel(request.issuerDid)
        val issuerPublicKey = model!!.toProto().publicKeys.find { it.id.equals(PrismDid.DEFAULT_ISSUING_KEY_ID) }
        val ECIssuerPublicKey = issuerPublicKey!!.compressedEcKeyData!!.toModel()
        if (!credential.isValidSignature(ECIssuerPublicKey)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The credential is not signed by the issuer's issuing key!")
        }

        val credentials = credential.content.getField("credentialSubject")!!.jsonObject.entries
        var emailValid = false
        var idValid = false
        var roleValid = true
        for (credentialData in credentials) {
            if (credentialData.key.equals("userId")) {
                if (credentialData.value.toString().equals("\"${request.userId}\"")) {
                    idValid = true
                } else {
                    break
                }
            }
            if (credentialData.key.equals("userEmail")) {
                if (credentialData.value.toString().equals("\"${request.userEmail}\"")) {
                    emailValid = true
                } else {
                    break
                }
            }
            if (credentialData.key.equals("role")) {
                if (!credentialData.value.toString().equals("\"${request.role}\"")) {
                    roleValid = false
                    break
                }
            }
        }
        if (!idValid || !emailValid || !roleValid) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The account data in the credential doesn't match with the account data in the database!")
        }

        //TODO -> Check for one more key (sign with 2 keys - 1 for issuer, 1 for website)
        val holderDid = credentials.last().value.toString()
        if (!holderDid.equals("\"${request.holderDid}\"")) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The holder DID in the credential doesn't match with the holder DID in the database!")
        }

        val credentialName = credentials.first().value.toString()
        if (!credentialName.equals("\"${request.credentialName}\"")) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The credential name in the credential doesn't match with the credential name in the database!")
        }
        var token = ""
        if (credentialName.equals("\"DIDEdu-Auth\"")) {
            for (credentialData in credentials) {
                if (credentialData.key.equals("didedu-token")) {
                    token = credentialData.value.toString().replace("\"", "")
                    break;
                }
            }
        }

        return VerifyCredentialResponse(
            message = "Valid",
            lastSyncBlock = Date(status.lastSyncBlockTimestamp?.seconds!! * 1000).toString(),
            token = token
        )
    }

    @OptIn(PrismSdkInternal::class)
    @CrossOrigin(origins = ["chrome-extension://dmfpnaafelnjlbkhmococamijdjedcca", "http://localhost:4200"])
    @PostMapping("/verify/presentation")
    suspend fun verifyPresentation(
        @RequestBody @Valid request: VerifyPresentationRequest
    ): VerifyCredentialResponse {
        val json = try {
            Json.parseToJsonElement(request.credential).jsonObject
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't revert string to json!", e)
        }

        val credential = try {
            JsonBasedCredential.fromString(json["encodedSignedCredential"]?.jsonPrimitive?.content!!)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the credential!", e)
        }
        val proof = try {
            MerkleInclusionProof.decode(json["proof"]?.jsonObject.toString())
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the proof!", e)
        }
        val batchId = try {
            CredentialBatchId.fromString(request.batchId)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid batchId!", e)
        }
        if (batchId === null) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't generate batch!")
        }
        val credentialHash = proof.hash


        val status = try {
            identityRepository.verifyCredentialFromBlockchain(credential, proof)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "There was an error verifying the credential from the blockchain!", e)
        }

        // Check if it is on the blockchain
        if (!status.verificationErrors.isEmpty()) {
            val revocationTime = try {
                identityRepository.checkRevocationTime(batchId, credentialHash)
            } catch (e: Exception) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't get the revocation time from the blockchain", e)
            }

            if (revocationTime !== null && status.verificationErrors.contains(VerificationError.CredentialWasRevokedOn(revocationTime.ledgerData!!.timestampInfo))) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The credential is revoked!")
            } else if (revocationTime !== null && status.verificationErrors.contains(VerificationError.BatchWasRevokedOn(revocationTime.ledgerData!!.timestampInfo))) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The batch is revoked!")
            } else if (status.verificationErrors.contains(VerificationError.IssuerDidNotFoundInCredential)) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't find the issuer's did on the chain!")
            } else if (status.verificationErrors.contains(VerificationError.InvalidMerkleProof)) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid proof!")
            } else if (status.verificationErrors.contains(VerificationError.BatchNotFoundOnChain(batchId.id))) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't find the batch on the chain!")
            } else if (status.verificationErrors.contains(VerificationError.IssuerKeyNotFoundInCredential)) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't find the issuer's key in the credential!")
            } else {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, status.verificationErrors[0].errorMessage)
            }
        }

        val model = getModel(request.issuerDid)
        val issuerPublicKey = model!!.toProto().publicKeys.find { it.id.equals(PrismDid.DEFAULT_ISSUING_KEY_ID) }
        val ECIssuerPublicKey = issuerPublicKey!!.compressedEcKeyData!!.toModel()
        if (!credential.isValidSignature(ECIssuerPublicKey)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The credential is not signed by the issuer's issuing key!")
        }

        val credentials = credential.content.getField("credentialSubject")!!.jsonObject.entries

        var validTitle = false
        var passed = false

        for (credentialData in credentials) {
            if (credentialData.key.equals("subjectTitle")) {
                if (credentialData.value.toString().equals("\"${request.subjectTitle}\"")) {
                    validTitle = true
                } else {
                    break
                }
            }
            if (credentialData.key.equals("result")) {
                if (credentialData.value.toString().equals("\"Passed\"")) {
                    passed = true
                } else {
                    break
                }
            }
        }
        if (!validTitle) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The account data in the credential doesn't match with the account data in the database!")
        }
        if (!passed) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The presentation isn't verified! Please get a new one!")
        }

        //TODO -> Check for one more key (sign with 2 keys - 1 for issuer, 1 for website)
        val holderDid = credentials.last().value.toString()
        if (!holderDid.equals("\"${request.issuerDid}\"")) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The holder DID in the credential doesn't match with the holder DID in the database!")
        }

        val credentialName = credentials.first().value.toString()
        if (!credentialName.equals("\"${request.title}\"")) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "The credential name in the credential doesn't match with the credential name in the database!")
        }


        return VerifyCredentialResponse(
            message = "Valid",
            lastSyncBlock = Date(status.lastSyncBlockTimestamp?.seconds!! * 1000).toString(),
            token = ""
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

    private fun getModel(
        did: String
    ): PrismDidDataModel? {
        val mainDid = try {
            Did.fromString(did)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "illegal DID: ${did}", e)
        }

        return try {
            identityRepository.readFromBlockchain(mainDid)
        } catch (e: Exception) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Couldn't read the did from the blockchain.", e)
        }
    }
}