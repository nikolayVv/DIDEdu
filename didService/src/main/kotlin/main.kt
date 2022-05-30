import com.did.service.didService.repositories.nodeAuthApi
import io.iohk.atala.prism.api.KeyGenerator
import io.iohk.atala.prism.api.models.AtalaOperationId
import io.iohk.atala.prism.api.node.NodePayloadGenerator
import io.iohk.atala.prism.common.PrismSdkInternal
import io.iohk.atala.prism.crypto.Sha256Digest
import io.iohk.atala.prism.crypto.derivation.KeyDerivation
import io.iohk.atala.prism.crypto.keys.ECPublicKey
import io.iohk.atala.prism.crypto.keys.toProto
import io.iohk.atala.prism.identity.*
import io.iohk.atala.prism.protos.PublicKey
import kotlinx.coroutines.runBlocking
import pbandk.decodeFromByteArray
import reactor.kotlin.core.publisher.toMono

@OptIn(PrismSdkInternal::class)
fun main(args: Array<String>) {
    val mnemonic = KeyDerivation.randomMnemonicCode()
    val seed = KeyDerivation.binarySeed(mnemonic, "passphrase")
    val keyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, MasterKeyUsage, 0)

    //println(mnemonic.words.toString())


    val masterKeyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, MasterKeyUsage, 0)
    val issuingKeyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, IssuingKeyUsage, 0)
    val revocationKeyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, RevocationKeyUsage, 0)

    val longDID = PrismDid.buildExperimentalLongFormFromKeys(
            masterKeyPair.publicKey,
            issuingKeyPair.publicKey,
            revocationKeyPair.publicKey
        )

    val didCanonical = longDID.asCanonical().did
    val didLongForm = longDID.did

    val hex = issuingKeyPair.publicKey.getHexEncoded()
    println(issuingKeyPair.publicKey.toProto())




//    var nodePayloadGenerator = NodePayloadGenerator(
//        longDID,
//        mapOf(
//            PrismDid.DEFAULT_MASTER_KEY_ID to masterKeyPair.privateKey,
//            PrismDid.DEFAULT_ISSUING_KEY_ID to issuingKeyPair.privateKey,
//            PrismDid.DEFAULT_REVOCATION_KEY_ID to revocationKeyPair.privateKey
//        )
//    )
//    val createDidInfo = nodePayloadGenerator.createDid()
//    val createDidOperationId = runBlocking {
//        nodeAuthApi.createDid(
//            createDidInfo.payload,
//            longDID,
//            PrismDid.DEFAULT_MASTER_KEY_ID)
//    }
//    println(createDidOperationId.hexValue())
//    val hash = createDidOperationId.digest;
//    println(hash.hexValue)
//    val hex = hash.hexValue
    //val newDigest = Sha256Digest.fromHex(hex)
//    println(newDigest);
//    println(AtalaOperationId(newDigest).hexValue());


//    //PUBLIC
//    println("------- PUBLIC KEY START -------")
//    println("KEY1: " + keyPair.publicKey.getHexEncoded())
//    val compressedDataPublic = keyPair.publicKey.toProto()
//    val curve = compressedDataPublic.curve
//    val data = compressedDataPublic.data
//    val unknownFields = compressedDataPublic.unknownFields
//    println("KEY1CURVE: " + curve)
//    println("KEY1DATA: " + data)
//    println("KEY1UF: " + unknownFields)
//    val newCompessedDataPublic = CompressedECKeyData(curve, data, unknownFields)
//    val newPublicKey = newCompessedDataPublic.toModel();
//    println("KEY2: " + newPublicKey.getHexEncoded())
//    println("------- PUBLIC KEY END -------")
//
//
//    //PRIVATE
//    println("------- PRIVATE KEY START -------")
//    println("KEY1: " + keyPair.privateKey.getHexEncoded())
//    // ByteArray
//    val compressedDataPrivate = keyPair.privateKey.getD().toString()
//    println("KEY1D: " + compressedDataPrivate)
//
//
//    val params = AlgorithmParameters.getInstance("EC")
//    params.init(ECGenParameterSpec("secp256k1"))
//    val ecParameterSpec = params.getParameterSpec(ECParameterSpec::class.java)
//    val privateKeySpec = ECPrivateKeySpec(compressedDataPrivate.toBigInteger(), ecParameterSpec)
//    val keyFactory = KeyFactory.getInstance("EC")
//    val newPrivateKey = keyFactory.generatePrivate(privateKeySpec) as PrivateKey
//
//    val newPrivateKeyPRISM = ECPrivateKey(newPrivateKey)
//
//    println("KEY1New: " + newPrivateKeyPRISM.getD())
//    println("------- PRIVATE KEY END -------")
}