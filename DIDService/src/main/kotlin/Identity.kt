import com.google.gson.Gson
import io.iohk.atala.prism.api.CredentialClaim
import io.iohk.atala.prism.api.KeyGenerator
import io.iohk.atala.prism.api.models.AtalaOperationId
import io.iohk.atala.prism.api.models.AtalaOperationStatus
import io.iohk.atala.prism.api.node.NodeAuthApiImpl
import io.iohk.atala.prism.api.node.NodePayloadGenerator
import io.iohk.atala.prism.api.node.NodePublicApi
import io.iohk.atala.prism.common.PrismSdkInternal
import io.iohk.atala.prism.credentials.json.JsonBasedCredential
import io.iohk.atala.prism.crypto.MerkleInclusionProof
import io.iohk.atala.prism.crypto.Sha256Digest
import io.iohk.atala.prism.crypto.derivation.KeyDerivation
import io.iohk.atala.prism.crypto.keys.ECKeyPair
import io.iohk.atala.prism.identity.*
import io.iohk.atala.prism.protos.GetOperationInfoRequest
import io.iohk.atala.prism.protos.GrpcClient
import io.iohk.atala.prism.protos.GrpcOptions
import io.iohk.atala.prism.protos.NodeServiceCoroutine
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.*
import pbandk.ByteArr
import java.io.File


const val env = "ppp.atalaprism.io"
val grpcOptions = GrpcOptions("https", env, 50053)
val nodeAuthApi = NodeAuthApiImpl(grpcOptions)

@Suppress("DEPRECATION")
class Identity {
    private var firstName: String
    private var lastName: String
    private var email: String
    private var masterKeyPair: ECKeyPair? = null
    private var issuingKeyPair: ECKeyPair? = null
    private var revocationKeyPair: ECKeyPair? = null
    private var unpublishedDid: LongFormPrismDid? = null
    private var published: Boolean
    private var hashFile: File
    private var seedFile: File
    private var batches: MutableList<Batch> = mutableListOf()

    constructor(firstName: String, lastName: String, email: String) {
        this.firstName = firstName
        this.lastName = lastName
        this.email = email
        println()
        this.hashFile = File(System.getProperty("user.dir") + "\\Hashes\\" + firstName + lastName + "PrevHash.hash")
        this.seedFile = File(System.getProperty("user.dir") + "\\Seeds\\" + firstName + lastName + "Seed")
        if (seedFile.length() == 0L) {
            this.generateDID("create")
        } else {
            this.generateDID("recreate")
        }
        this.published = this.readDID(this.getDID()) !== null
    }

    fun getFullName(): String {
        return this.firstName + " " + this.lastName
    }

    fun getEmail(): String {
        return this.email
    }

    fun getDID(): String {
        return this.unpublishedDid!!.asCanonical().did.toString()
    }

    fun getUnpublishedDID(): LongFormPrismDid {
        return this.unpublishedDid!!
    }

    fun isPublished(): Boolean {
        return this.published
    }

    fun getSeedFile(): File {
        return this.seedFile
    }

    fun getBatches(): MutableList<Batch> {
        return this.batches
    }

    fun getRevocationTime(batchId: String, credentialHash: Sha256Digest) {
        return runBlocking {
            nodeAuthApi.getCredentialRevocationTime(
                batchId,
                credentialHash
            )
        }
    }

    private fun generateDID(action: String) {
        //println("-- READ/WRITE SEED FROM/IN FILE ${this.seedFile} START --")
        var seed: ByteArray
        try {
            when (action) {
                "create" -> {
                    seed = KeyDerivation.binarySeed(KeyDerivation.randomMnemonicCode(), "passphrase")
                    this.seedFile.writeBytes(seed)
                }
                "recreate" -> {
                    seed = this.seedFile.readBytes()
                }
                else -> {
                    throw Exception("Wrong action for generating DID! Please use 'create' or 'recreate'")
                }
            }
            this.masterKeyPair = KeyGenerator.deriveKeyFromFullPath(seed, 0, MasterKeyUsage, 0)
            this.issuingKeyPair = KeyGenerator.deriveKeyFromFullPath(seed, 0, IssuingKeyUsage, 0)
            this.revocationKeyPair = KeyGenerator.deriveKeyFromFullPath(seed, 0, RevocationKeyUsage, 0)

            this.unpublishedDid = PrismDid.buildExperimentalLongFormFromKeys(
                this.masterKeyPair!!.publicKey,
                this.revocationKeyPair!!.publicKey,
                this.revocationKeyPair!!.publicKey
            )
        } catch (e: Exception) {
            println(e.message)
        }


        //println("canonical: ${this.getDID()}")
        //println("long form: ${this.getUnpublishedDID()}")
        //println("-- READ/WRITE SEED FROM/IN FILE ${this.seedFile} START --")
        //println()
    }

    fun readDID(didRead: String): PrismDidDataModel? {
        //println("-- READ LONG DID START --")

        val did = try { Did.fromString(didRead) } catch (e: Exception) { throw Exception("illegal DID: $didRead") }
        val prismDid = try { PrismDid.fromDid(did) } catch (e: Exception) { throw Exception("not a Prism DID: $did") }

        //println("trying to retrieve document for $did")
        try {
            return runBlocking { nodeAuthApi.getDidDocument(prismDid) }
            //println(model.publicKeys.size)
            //println(model.didDataModel)
        } catch (e: Exception) {
            println(e.message)
            if (!this.published) {
                println("Unknown prism DID")
            } else {
                println("Error!")
            }
            return null
        }
        //println("-- READ DID END --")
        //println()
    }

    @Suppress("DEPRECATION")
    @PrismSdkInternal
    private fun waitUntilConfirmed(nodePublicApi: NodePublicApi, operationId: AtalaOperationId) {
        var tid = ""
        var status = runBlocking {
            nodePublicApi.getOperationStatus(operationId)
        }
        while (status != AtalaOperationStatus.CONFIRMED_AND_APPLIED &&
            status != AtalaOperationStatus.CONFIRMED_AND_REJECTED
        ) {
            println("Current operation status: ${AtalaOperationStatus.asString(status)}")
            if (tid.isNullOrEmpty()) {
                tid = transactionId(operationId)
                if (!tid.isNullOrEmpty()) {
                    println("Transaction id: $tid")
                    println("Track the transaction in:\n- https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=$tid")
                }
            }

            Thread.sleep(10000)
            status = runBlocking {
                nodePublicApi.getOperationStatus(operationId)
            }
        }
    }

    @PrismSdkInternal
    private fun transactionId(oid: AtalaOperationId): String {
        val node = NodeServiceCoroutine.Client(GrpcClient(grpcOptions))
        val response = runBlocking {
            node.GetOperationInfo(GetOperationInfoRequest(ByteArr(oid.value())))
        }
        return response.transactionId
    }

    @Suppress("DEPRECATION")
    @PrismSdkInternal
    fun publishDID() {
        if (!this.published) {
            println("-- PUBLISH DID START --")
            val longDID = this.unpublishedDid!!

            val didCanonical = longDID.asCanonical().did
            val didLongForm = longDID.did

            println("canonical: $didCanonical")
            println("long form: $didLongForm")
            println()

            var nodePayloadGenerator = NodePayloadGenerator(
                longDID,
                mapOf(
                    PrismDid.DEFAULT_MASTER_KEY_ID to this.masterKeyPair!!.privateKey,
                    PrismDid.DEFAULT_ISSUING_KEY_ID to this.issuingKeyPair!!.privateKey,
                    PrismDid.DEFAULT_REVOCATION_KEY_ID to this.revocationKeyPair!!.privateKey
                )
            )
            val createDidInfo = nodePayloadGenerator.createDid()
            val createDidOperationId = runBlocking {
                nodeAuthApi.createDid(
                    createDidInfo.payload,
                    longDID,
                    PrismDid.DEFAULT_MASTER_KEY_ID)
            }

            println(
                """
                - Sent a request to create a new DID to PRISM Node.
                - The transaction can take up to 10 minutes to be confirmed by the Cardano network.
                - Operation identifier: ${createDidOperationId.hexValue()}
                """.trimIndent()
            )
            println()
            this.waitUntilConfirmed(nodeAuthApi, createDidOperationId)

            val status = runBlocking { nodeAuthApi.getOperationStatus(createDidOperationId) }
            require(status == AtalaOperationStatus.CONFIRMED_AND_APPLIED) {
                "expected publishing to be applied"
            }
            this.published = true
            println("DID published")

            val hash = createDidInfo.operationHash.hexValue
            println("hash: $hash")
            this.hashFile.writeText(hash)
            println("wrote hash to file ${this.hashFile}")
            println("-- PUBLISH DID END --")
        } else {
            println("The Identity is already published")
        }
        println()
    }

    @PrismSdkInternal
    fun updateDID() {
        val seed = this.seedFile.readBytes()
        println("read seed from file ${this.seedFile}")
        val oldHash = Sha256Digest.fromHex(this.hashFile.readText())
        println("read old hash from ${this.hashFile}: ${oldHash.hexValue}")

        val longDid = this.unpublishedDid!!

        val didCanonical = longDid.asCanonical().did
        val didLongForm = longDid.did
        val issuingKeyPair = KeyGenerator.deriveKeyFromFullPath(seed, 0, IssuingKeyUsage, 0)

        println("canonical: $didCanonical")
        println("long form: $didLongForm")
        println()

        println("updating DID...")
        var nodePayloadGenerator = NodePayloadGenerator(
            longDid,
            mapOf(PrismDid.DEFAULT_MASTER_KEY_ID to masterKeyPair!!.privateKey))
        val issuingKeyInfo = PrismKeyInformation(
            DidPublicKey(
                PrismDid.DEFAULT_ISSUING_KEY_ID,
                IssuingKeyUsage,
                issuingKeyPair.publicKey
            )
        )
        val updateDidInfo = nodePayloadGenerator.updateDid(
            previousHash = oldHash,
            masterKeyId = PrismDid.DEFAULT_MASTER_KEY_ID,
            keysToAdd = arrayOf(issuingKeyInfo))
        val updateDidOperationId = runBlocking {
            nodeAuthApi.updateDid(
                payload = updateDidInfo.payload,
                did = longDid.asCanonical(),
                masterKeyId = PrismDid.DEFAULT_MASTER_KEY_ID,
                previousOperationHash = oldHash,
                keysToAdd = arrayOf(issuingKeyInfo),
                keysToRevoke = arrayOf())
        }

        println(
            """
        - Sent a request to update the DID to PRISM Node.
        - The transaction can take up to 10 minutes to be confirmed by the Cardano network.
        - Operation identifier: ${updateDidOperationId.hexValue()}
        """.trimIndent())
        println()
        this.waitUntilConfirmed(nodeAuthApi, updateDidOperationId)

        val status = runBlocking { nodeAuthApi.getOperationStatus(updateDidOperationId) }
        require(status == AtalaOperationStatus.CONFIRMED_AND_APPLIED) {
            "expected updating to be applied"
        }

        println("DID updated")
        val newHash = updateDidInfo.operationHash.hexValue
        this.hashFile.writeText(newHash)
        println("rewrote the hash in the file ${this.hashFile}")
        println()
    }

//    fun issueLocal(credential: JsonObject, holderLongDid: LongFormPrismDid) {
//        val longDid = this.unpublishedDid!!
//
//        val issuerDidCanonical = longDid.asCanonical().did
//        val issuerDidLongForm = longDid.did
//
//        println("issuer canonical: $issuerDidCanonical")
//        println("issuer long form: $issuerDidLongForm")
//        println()
//
//        val holderDidCanonical = holderLongDid.asCanonical().did
//        val holderDidLongForm = holderLongDid.did
//
//        println("holder canonical: $holderDidCanonical")
//        println("holder long form: $holderDidLongForm")
//        println()
//
//        val credentialClaim = CredentialClaim(
//            subjectDid = holderLongDid,
//            content = credential
//        )
//
//        // We use private key belonging to the issuing public key
//        val issuerNodePayloadGenerator = NodePayloadGenerator(
//            longDid,
//            mapOf(PrismDid.DEFAULT_ISSUING_KEY_ID to this.issuingKeyPair!!.privateKey))
//
//        val issueCredentialsInfo = issuerNodePayloadGenerator.issueCredentials(
//            PrismDid.DEFAULT_ISSUING_KEY_ID,
//            arrayOf(credentialClaim))
//
//        val holderSignedCredential = issueCredentialsInfo.credentialsAndProofs.first().signedCredential
//        println(holderSignedCredential)
//        println()
//        println(holderSignedCredential.content)
//        println()
//        // holder checks that issuer signed it
//        println(holderSignedCredential.isValidSignature(this.issuingKeyPair!!.publicKey))
//        // We get false because we use the issuer public
//        println(holderSignedCredential.isValidSignature(this.masterKeyPair!!.publicKey))
//    }

    @PrismSdkInternal
    fun issueCredentials(batch: Batch) {
        val longDid = this.unpublishedDid!!

        val issuerDidCanonical = longDid.asCanonical().did
        val issuerDidLongForm = longDid.did

        println("issuer canonical: $issuerDidCanonical")
        println("issuer long form: $issuerDidLongForm")
        println()

        val nodePayloadGenerator = NodePayloadGenerator(
            longDid,
            mapOf(PrismDid.DEFAULT_ISSUING_KEY_ID to this.issuingKeyPair!!.privateKey)
        )

        val credentialsInfo = nodePayloadGenerator.issueCredentials(
            PrismDid.DEFAULT_ISSUING_KEY_ID,
            batch.claims.toTypedArray()
        )

        batch.batchId = credentialsInfo.batchId.id
        println("batchId: ${credentialsInfo.batchId.id}")
        var index = 0
        for (info in credentialsInfo.credentialsAndProofs) {
            batch.credentialHashes.add(info.signedCredential.hash().hexValue)
            println(" - ${info.signedCredential.hash().hexValue}")
            val json = JsonObject(mapOf(
                "encodedSignedCredential" to JsonPrimitive(info.signedCredential.canonicalForm),
                "proof" to Json.parseToJsonElement(info.inclusionProof.encode())))
            File("${System.getProperty("user.dir")}\\Credentials\\${batch.title.replace("\\s".toRegex(), "") + index.toString()}.json").writeText(json.toString())
            index++
        }
        println()

        val issueCredentialsOperationId = runBlocking {
            nodeAuthApi.issueCredentials(
                credentialsInfo.payload,
                longDid.asCanonical(),
                PrismDid.DEFAULT_ISSUING_KEY_ID,
                credentialsInfo.merkleRoot)
        }

        println(
            """
            - Sent a request to issue credentials to PRISM Node.
            - The transaction can take up to 10 minutes to be confirmed by the Cardano network.
            - Operation identifier: ${issueCredentialsOperationId.hexValue()}
            """.trimIndent())
        println()
        this.waitUntilConfirmed(nodeAuthApi, issueCredentialsOperationId)

        val status = runBlocking { nodeAuthApi.getOperationStatus(issueCredentialsOperationId) }
        require(status == AtalaOperationStatus.CONFIRMED_AND_APPLIED) {
            "expected credentials to be issued"
        }

        this.batches.add(batch)
        println("credentials issued")
        println()

        val hash = credentialsInfo.operationHash.hexValue
        println("operation hash: $hash")
        this.hashFile.writeText(hash)
        println("wrote old hash to file ${this.hashFile}")
        println()
    }

    @PrismSdkInternal
    fun revokeCredentials(batchId: String, credentialHash: Sha256Digest?, action: String) {
        val oldHash = Sha256Digest.fromHex(this.hashFile.readText())
        println("read old hash from ${this.hashFile}: ${oldHash.hexValue}")

        val longDid = this.unpublishedDid!!

        val issuerDidCanonical = longDid.asCanonical().did
        val issuerDidLongForm = longDid.did

        println("issuer canonical: $issuerDidCanonical")
        println("issuer long form: $issuerDidLongForm")
        println()

        val nodePayloadGenerator = NodePayloadGenerator(
            longDid,
            mapOf(PrismDid.DEFAULT_REVOCATION_KEY_ID to this.revocationKeyPair!!.privateKey))

        var revokedCredentials: Array<Sha256Digest>
        if (action.trim().equals("credential")) {
            revokedCredentials = arrayOf(credentialHash!!)
        } else {
            revokedCredentials = arrayOf()
        }
        val revokeInfo = nodePayloadGenerator.revokeCredentials(
            PrismDid.DEFAULT_REVOCATION_KEY_ID,
            oldHash,
            batchId,
            revokedCredentials
        )

        val revokeOperationId = runBlocking {
            nodeAuthApi.revokeCredentials(
                revokeInfo.payload,
                longDid.asCanonical(),
                PrismDid.DEFAULT_REVOCATION_KEY_ID,
                oldHash,
                batchId,
                revokedCredentials
            )
        }

        println(
            """
            - Sent a request to revoke credential to PRISM Node.
            - The transaction can take up to 10 minutes to be confirmed by the Cardano network.
            - Operation identifier: ${revokeOperationId.hexValue()}
            """.trimIndent())
        println()
        waitUntilConfirmed(nodeAuthApi, revokeOperationId)

        val status = runBlocking { nodeAuthApi.getOperationStatus(revokeOperationId) }
        require(status == AtalaOperationStatus.CONFIRMED_AND_APPLIED) {
            "expected credential to be revoked"
        }

        println("credential/batch revoked")
        println()
    }

    @PrismSdkInternal
    fun deactivateDID() {
        val seed = this.seedFile.readBytes()
        println("read seed from file ${this.seedFile}")
        val oldHash = Sha256Digest.fromHex(this.hashFile.readText())
        println("read old hash from ${this.hashFile}: ${oldHash.hexValue}")

        val longDid = this.unpublishedDid!!

        val didCanonical = longDid.asCanonical().did
        val didLongForm = longDid.did

        println("canonical: $didCanonical")
        println("long form: $didLongForm")
        println()

        println("deactivating DID...")
        var nodePayloadGenerator = NodePayloadGenerator(
            longDid,
            mapOf(PrismDid.DEFAULT_MASTER_KEY_ID to this.masterKeyPair!!.privateKey))
        val updateDidInfo = nodePayloadGenerator.updateDid(
            previousHash = oldHash,
            masterKeyId = PrismDid.DEFAULT_MASTER_KEY_ID,
            keysToRevoke = arrayOf(PrismDid.DEFAULT_MASTER_KEY_ID, PrismDid.DEFAULT_ISSUING_KEY_ID, PrismDid.DEFAULT_REVOCATION_KEY_ID))
        val updateDidOperationId = runBlocking {
            nodeAuthApi.updateDid(
                payload = updateDidInfo.payload,
                did = longDid.asCanonical(),
                masterKeyId = PrismDid.DEFAULT_MASTER_KEY_ID,
                previousOperationHash = oldHash,
                keysToAdd = arrayOf(),
                keysToRevoke = arrayOf(PrismDid.DEFAULT_MASTER_KEY_ID, PrismDid.DEFAULT_ISSUING_KEY_ID, PrismDid.DEFAULT_REVOCATION_KEY_ID))
        }

        println(
            """
        - Sent a request to deactivate the DID to PRISM Node.
        - The transaction can take up to 10 minutes to be confirmed by the Cardano network.
        - Operation identifier: ${updateDidOperationId.hexValue()}
        """.trimIndent())
        println()
        this.waitUntilConfirmed(nodeAuthApi, updateDidOperationId)

        val status = runBlocking { nodeAuthApi.getOperationStatus(updateDidOperationId) }
        require(status == AtalaOperationStatus.CONFIRMED_AND_APPLIED) {
            "expected updating to be applied"
        }

        println("DID deactivated")
        println()
    }

    fun verifyCredentials(batch: Batch) {
        for (i in 0..batch.claims.size - 1) {
            val json = Json.parseToJsonElement(File("${System.getProperty("user.dir")}\\Credentials\\${batch.title.replace("\\s".toRegex(), "") + i}.json").readText()).jsonObject
            val credential = JsonBasedCredential.fromString(json["encodedSignedCredential"]?.jsonPrimitive?.content!!)
            val proof = MerkleInclusionProof.decode(json["proof"]?.jsonObject.toString())

            println("credential: $credential")
            println("Proof: $proof")
            println()

            val result = runBlocking {
                nodeAuthApi.verify(credential, proof)
            }
            println("verification result${i}: $result")
            println()
        }
    }
}