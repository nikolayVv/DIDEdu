package com.did.service.didService.repositories

import com.did.service.didService.models.Identity
import io.iohk.atala.prism.api.models.AtalaOperationId
import io.iohk.atala.prism.api.models.AtalaOperationStatus
import io.iohk.atala.prism.api.node.NodeAuthApiImpl
import io.iohk.atala.prism.api.node.NodePayloadGenerator
import io.iohk.atala.prism.api.node.NodePublicApi
import io.iohk.atala.prism.common.PrismSdkInternal
import io.iohk.atala.prism.crypto.keys.ECPrivateKey
import io.iohk.atala.prism.identity.Did
import io.iohk.atala.prism.identity.LongFormPrismDid
import io.iohk.atala.prism.identity.PrismDid
import io.iohk.atala.prism.protos.GetOperationInfoRequest
import io.iohk.atala.prism.protos.GrpcClient
import io.iohk.atala.prism.protos.GrpcOptions
import io.iohk.atala.prism.protos.NodeServiceCoroutine
import kotlinx.coroutines.runBlocking
import pbandk.ByteArr
import java.security.PrivateKey

const val env = "ppp.atalaprism.io"
val grpcOptions = GrpcOptions("https", env, 50053)
val nodeAuthApi = NodeAuthApiImpl(grpcOptions)

class IdentityRepository {
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

    // TODO
    @Suppress("DEPRECATION")
    @OptIn(PrismSdkInternal::class)
    fun addToBlockchain(longDID: LongFormPrismDid, privateKey: ECPrivateKey): Did {
            println("-- PUBLISH DID START --")
            val didCanonical = longDID.asCanonical().did
            val didLongForm = longDID.did

            println("canonical: $didCanonical")
            println("long form: $didLongForm")
            println()

            var nodePayloadGenerator = NodePayloadGenerator(
                longDID,
                mapOf(
                    PrismDid.DEFAULT_MASTER_KEY_ID to privateKey,
                    PrismDid.DEFAULT_ISSUING_KEY_ID to privateKey,
                    PrismDid.DEFAULT_REVOCATION_KEY_ID to privateKey
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
            println("DID published")

            //val hash = createDidInfo.operationHash.hexValue
            //println("hash: $hash")
            //println("wrote hash to file ${this.hashFile}")
            println("-- PUBLISH DID END --")
        println()

        return didCanonical
    }

    // TODO
    fun readFromBlockchain() {

    }
}