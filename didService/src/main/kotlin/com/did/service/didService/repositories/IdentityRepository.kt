package com.did.service.didService.repositories

import io.iohk.atala.prism.api.VerificationResult
import io.iohk.atala.prism.api.models.AtalaOperationId
import io.iohk.atala.prism.api.node.*
import io.iohk.atala.prism.common.PrismSdkInternal
import io.iohk.atala.prism.credentials.CredentialBatchId
import io.iohk.atala.prism.credentials.PrismCredential
import io.iohk.atala.prism.crypto.MerkleInclusionProof
import io.iohk.atala.prism.crypto.Sha256Digest
import io.iohk.atala.prism.crypto.keys.ECPrivateKey
import io.iohk.atala.prism.identity.Did
import io.iohk.atala.prism.identity.LongFormPrismDid
import io.iohk.atala.prism.identity.PrismDid
import io.iohk.atala.prism.identity.PrismDidDataModel
import io.iohk.atala.prism.protos.GrpcOptions
import kotlinx.coroutines.runBlocking

const val env = "ppp.atalaprism.io"
val grpcOptions = GrpcOptions("https", env, 50053)
val nodeAuthApi = NodeAuthApiImpl(grpcOptions)

class IdentityRepository {

    @Suppress("DEPRECATION")
    @PrismSdkInternal
    fun checkStatus(
        operationId: AtalaOperationId
    ): Int {
        return runBlocking {
            nodeAuthApi.getOperationStatus(operationId)
        }
    }

    fun checkRevocationTime(
        batchId: CredentialBatchId,
        credentialHash: Sha256Digest
    ): GetCredentialRevocationTimeResult {
        return runBlocking {
            nodeAuthApi.getCredentialRevocationTime(
                batchId.id,
                credentialHash
            )
        }
    }

    // TODO
    fun addDidToBlockchain(
        longDID: LongFormPrismDid,
        masterPrivateKey: ECPrivateKey,
        issuingPrivateKey: ECPrivateKey,
        revocationPrivateKey: ECPrivateKey
    ): AtalaOperationId {
        var nodePayloadGenerator = NodePayloadGenerator(
            longDID,
            mapOf(
                PrismDid.DEFAULT_MASTER_KEY_ID to masterPrivateKey,
                PrismDid.DEFAULT_ISSUING_KEY_ID to issuingPrivateKey,
                PrismDid.DEFAULT_REVOCATION_KEY_ID to revocationPrivateKey
            )
        )

        val createDidInfo = nodePayloadGenerator.createDid()
        val createDidOperationId = runBlocking {
            nodeAuthApi.createDid(
                createDidInfo.payload,
                longDID,
                PrismDid.DEFAULT_MASTER_KEY_ID)
        }

        return createDidOperationId
    }

    fun issueCredentialToBlockchain(
        issuerUnpublishedDid: LongFormPrismDid,
        credentialsInfo: IssueCredentialsInfo
    ): AtalaOperationId {
        val issueCredentialsOperationId = runBlocking {
            nodeAuthApi.issueCredentials(
                credentialsInfo.payload,
                issuerUnpublishedDid.asCanonical(),
                PrismDid.DEFAULT_ISSUING_KEY_ID,
                credentialsInfo.merkleRoot
            )
        }

        return issueCredentialsOperationId
    }

    fun revokeCredentialFromBlockchain(
        issuerUnpublishedDid: LongFormPrismDid,
        revokeInfo: RevokeCredentialsInfo,
        oldHash: Sha256Digest,
        batchId: CredentialBatchId,
        credentialHash: Sha256Digest
    ): AtalaOperationId {
        val revokeOperationId = runBlocking {
            nodeAuthApi.revokeCredentials(
                revokeInfo.payload,
                issuerUnpublishedDid.asCanonical(),
                PrismDid.DEFAULT_REVOCATION_KEY_ID,
                oldHash,
                batchId.id,
                arrayOf(credentialHash)
            )
        }

        return revokeOperationId
    }

    fun verifyCredentialFromBlockchain(
        credential: PrismCredential,
        proof: MerkleInclusionProof
    ): VerificationResult {
        val result = runBlocking {
            nodeAuthApi.verify(credential, proof)
        }

        return result
    }

    // TODO
    fun readFromBlockchain(
        did: Did
    ): PrismDidDataModel? {
        val prismDid = try { PrismDid.fromDid(did) } catch (e: Exception) { throw Exception("not a Prism DID: $did") }
        try {
            return runBlocking { nodeAuthApi.getDidDocument(prismDid).didData }
        } catch (e: Exception) {
            return null
        }
    }
}