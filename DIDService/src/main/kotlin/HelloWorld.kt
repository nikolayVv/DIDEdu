import io.iohk.atala.prism.api.CredentialClaim
import io.iohk.atala.prism.api.KeyGenerator
import io.iohk.atala.prism.common.PrismSdkInternal
import io.iohk.atala.prism.crypto.Sha256Digest
import io.iohk.atala.prism.identity.MasterKeyUsage
import io.iohk.atala.prism.identity.PrismDid
import io.iohk.atala.prism.identity.toProto
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

@OptIn(PrismSdkInternal::class)
fun main() {
    val issuer1 = Identity (
        "Marko",
        "Turk",
        "mt1234@profesor.uni-lj.si"
    )

    val holder1 = Identity (
        "Eva",
        "Bizjak",
        "eb3345@student.uni-lj.si"
    )
    val holder2 = Identity(
        "Franc",
        "Horvat",
        "fh4444@student.uni-lj.si"
    )
    val holder3 = Identity(
        "Tomaž",
        "Kotnik",
        "tk8787@student.uni-lj.si"
    )

    //println(issuer1.isPublished())
    //issuer1.readDID("did:prism:0ab42724802464560f5068d19e574f2887dc9f8d2632781f01e8e048441bdab3")
    //issuer1.readDID("did:prism:0ab42724802464560f5068d19e574f2887dc9f8d2632781f01e8e048441bdab3:Cj8KPRI7CgdtYXN0ZXIwEAFKLgoJc2VjcDI1NmsxEiEDrwbZz5kgptfuIq4cVp_G1E-bpBJyztvt6-xpfYKiyqk")
    issuer1.publishDID()
    println(issuer1.readDID(issuer1.getDID())!!.didDataModel)
//    holder1.publishDID()
//    holder2.publishDID()
//    holder3.publishDID()
    //id, publicKeys, did, didDataModel -> didDocument: PrismDidDataModel
//    val model = issuer1.readDID("did:prism:0ab42724802464560f5068d19e574f2887dc9f8d2632781f01e8e048441bdab3")
//    println(model!!.didDataModel)
//    for (info in model!!.publicKeys) {
//        println()
//        println(info)
//    }
    //println(issuer1.readDID("did:prism:0ab42724802464560f5068d19e574f2887dc9f8d2632781f01e8e048441bdab3")!!.toProto().publicKeys.size)
    //issuer1.updateDID()
    //println(issuer1.readDID("did:prism:0ab42724802464560f5068d19e574f2887dc9f8d2632781f01e8e048441bdab3")!!.toProto().publicKeys)

//    val credential = JsonObject(mapOf(
//            Pair("name", JsonPrimitive("Lars Brünjes")),
//            Pair("role", JsonPrimitive("Director of Education")),
//            Pair("yearOfBirth", JsonPrimitive(1971)),
//            Pair("courses", JsonArray(listOf(
//                JsonObject(mapOf(
//                    Pair("year", JsonPrimitive(2017)),
//                    Pair("type", JsonPrimitive("Haskell")),
//                    Pair("location", JsonPrimitive("Athens")))),
//                JsonObject(mapOf(
//                    Pair("year", JsonPrimitive(2018)),
//                    Pair("type", JsonPrimitive("Haskell")),
//                    Pair("location", JsonPrimitive("Barbados")))),
//                JsonObject(mapOf(
//                    Pair("year", JsonPrimitive(2019)),
//                    Pair("type", JsonPrimitive("Haskell")),
//                    Pair("location", JsonPrimitive("Addis Ababa")))),
//                JsonObject(mapOf(
//                    Pair("year", JsonPrimitive(2019)),
//                    Pair("type", JsonPrimitive("Haskell")),
//                    Pair("location", JsonPrimitive("Addis Ababa")))),
//                JsonObject(mapOf(
//                    Pair("year", JsonPrimitive(2020)),
//                    Pair("type", JsonPrimitive("Haskell")),
//                    Pair("location", JsonPrimitive("virtual")))),
//                JsonObject(mapOf(
//                    Pair("year", JsonPrimitive(2021)),
//                    Pair("type", JsonPrimitive("Plutus")),
//                    Pair("location", JsonPrimitive("virtual")))),
//                JsonObject(mapOf(
//                    Pair("year", JsonPrimitive(2021)),
//                    Pair("type", JsonPrimitive("Prism")),
//                    Pair("location", JsonPrimitive("virtual"))))))))))

//    val credential = JsonObject(mapOf(
//            Pair("name", JsonPrimitive(holder1.getFullName())),
//            Pair("degree", JsonPrimitive("Bachelor of Computer Science")),
//            Pair("year", JsonPrimitive(2022)))
//    )
//    issuer1.issueCredential(credential, holder1.getUnpublishedDID())
//

//    val modelHolder = issuer1.readDID("did:prism:7f309c5ffe62813f37da8c93bdc2d0f11d84edeade627ddf0f18f05eb0c05a25:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQIzR6mHSxlzScQJYv98U-38k0vyb7yfn8DDHwoel-dz_RI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA1gdPOKx8QMhxz3wPX6BI0_TIIyg1nd4nnbGmFwCE4xwEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiEDWB084rHxAyHHPfA9foEjT9MgjKDWd3iedsaYXAITjHA")
//    println(modelHolder!!.didDataModel)

    //issuer1.deactivateDID()
//    var modelIssuer = issuer1.readDID("did:prism:96dec7e196c4c7100b4cb2a29678a51428bdeec7d02cd4e423c1b0b153c0fa04")
//    for (info in modelIssuer!!.publicKeys) {
//        println()
//        println(info)
//    }

    val holders = arrayOf(
        holder1,
        holder2,
        holder3
    )

    for (holder in holders) {
        println(issuer1.readDID(holder.getUnpublishedDID().toString())!!.toProto())
    }
    val claims = mutableListOf<CredentialClaim>()
    for (holder in holders) {
        val holderLongDid = holder.getUnpublishedDID()

        val holderDidCanonical = holderLongDid.asCanonical().did
        val holderDidLongForm = holderLongDid.did

        println("${holder.getFullName()} canonical: $holderDidCanonical")
        println("${holder.getFullName()} long form: $holderDidLongForm")
        println()

        val credentialClaim = CredentialClaim(
            subjectDid = holderLongDid,
            content = JsonObject(mapOf(
                Pair("name", JsonPrimitive(holder.getFullName())),
                Pair("Web Programming", JsonPrimitive("Passed exam")),
                Pair("year", JsonPrimitive(2022)))
            )
        )

        claims.add(credentialClaim)
    }
    val batch = Batch(
        "Web programming",
        claims,
        "",
        mutableListOf()
    )
    issuer1.issueCredentials(batch)
//    for (holder in holders) {
//        println(issuer1.readDID(holder.getDID()))
//    }

    //val issuer1Batches = issuer1.getBatches()
    //issuer1.revokeCredentials(issuer1Batches[0].batchId, Sha256Digest.fromHex(issuer1Batches[0].credentialHashes[0]), "credential")

//    issuer1.verifyCredentials(batch)
}
