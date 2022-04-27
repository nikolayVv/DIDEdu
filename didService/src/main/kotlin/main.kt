import com.did.service.didService.requests.PublicKey
import com.google.gson.Gson
import io.iohk.atala.prism.api.KeyGenerator
import io.iohk.atala.prism.common.PrismSdkInternal
import io.iohk.atala.prism.crypto.derivation.KeyDerivation
import io.iohk.atala.prism.crypto.keys.*
import io.iohk.atala.prism.identity.MasterKeyUsage
import io.iohk.atala.prism.protos.CompressedECKeyData
import io.iohk.atala.prism.protos.KeyUsage
import org.h2.value.Value.JSON
import pbandk.encodeToByteArray
import pbandk.json.encodeToJsonString
import java.security.KeyFactory
import java.security.KeyPairGenerator
import java.security.PrivateKey
import java.security.spec.ECGenParameterSpec
import java.security.spec.ECParameterSpec
import java.security.spec.EllipticCurve
import java.security.spec.X509EncodedKeySpec
import java.util.Base64

@OptIn(PrismSdkInternal::class)
fun main(args: Array<String>) {
    val seed = KeyDerivation.binarySeed(KeyDerivation.randomMnemonicCode(), "passphrase")
    val keyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, MasterKeyUsage, 0)
    println(keyPair.publicKey)
//    val key = "MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEKAsFhBG7oJV7QDV7kh4PEEiBI6FghVPzh0Jiuc0Q/L4ZXRjIh8ZQl6EGUjBEgxz6h8dXe50e+DTotQnSiqs29A=="
//    println(key)
//    val encoded = Base64.getDecoder().decode(key)
//    val kf = KeyFactory.getInstance("EC")
//    val spec = X509EncodedKeySpec(encoded)
//    val publicKey = kf.generatePublic(spec) as ECPublicKey

    val compressedData = keyPair.publicKey.toProto()
    val compressedDataPrivate = keyPair.privateKey.getD()

    println(keyPair.privateKey.getD())
    //println(compressedData)
    //println()
    val curve = compressedData.curve
    val data = compressedData.data
    val unknownFields = compressedData.unknownFields
    val newCompressed = CompressedECKeyData(curve, data, unknownFields)
    val gson = Gson()
    val jsonData = gson.toJson(PublicKey(
        compressedData.curve,
        compressedData.data,
        compressedData.unknownFields
    ))
    //println(jsonData)
    val keys = gson.toJson(keyPair)
    val private = gson.toJson(keyPair.privateKey.getD())
    println(private)
    //PrivateKey()
    println(keys)
    //println(keys)
    //println(CompressedECKeyData(keys.curve, keys.data, keys.unknownFields))
//    val kty = "EC".
//    val d = "X4_l-QVlxgVF7txb_o_0noaElfkXClZZXb8KPRVxwk8"
//    val crv = "secp256k1"
//
//    val seed = KeyDerivation.binarySeed(KeyDerivation.randomMnemonicCode(), "passphrase")
//    val keyPair = KeyGenerator.deriveKeyFromFullPath(seed,0, MasterKeyUsage, 0)
//    println(keyPair.publicKey.getCurvePoint())
//    val points = keyPair.publicKey.getCurvePoint()
//    val x = points.x
//    val y = points.y
//    println(keyPair.privateKey.getD())
//
//    println(Base64.getEncoder().encodeToString(keyPair.publicKey.getEncoded()))
//    println(ECPoint(x, y))
//
//    val kgp = KeyPairGenerator.getInstance("EC")
//    kgp.initialize(ECGenParameterSpec("secp256r1"))
//    val kp = kgp.generateKeyPair()
//    val publicKey = kp.public
//    println(publicKey.encoded)
}