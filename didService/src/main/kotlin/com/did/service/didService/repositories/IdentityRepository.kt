package com.did.service.didService.repositories

import io.iohk.atala.prism.api.models.AtalaOperationId
import io.iohk.atala.prism.api.node.NodeAuthApiImpl
import io.iohk.atala.prism.api.node.NodePayloadGenerator
import io.iohk.atala.prism.common.PrismSdkInternal
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
    fun checkStatus(operationId: AtalaOperationId): Int {
        return runBlocking {
            nodeAuthApi.getOperationStatus(operationId)
        }
    }

    // TODO
    @Suppress("DEPRECATION")
    fun addToBlockchain(longDID: LongFormPrismDid, masterPrivateKey: ECPrivateKey, issuingPrivateKey: ECPrivateKey, revocationPrivateKey: ECPrivateKey): AtalaOperationId {
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
        var status = runBlocking {
            nodeAuthApi.getOperationStatus(createDidOperationId)
        }

        return createDidOperationId
    }

    // TODO
    fun readFromBlockchain(did: Did): PrismDidDataModel? {
        val prismDid = try { PrismDid.fromDid(did) } catch (e: Exception) { throw Exception("not a Prism DID: $did") }
        try {
            return runBlocking { nodeAuthApi.getDidDocument(prismDid).didData }
        } catch (e: Exception) {
            return null
        }
    }
}