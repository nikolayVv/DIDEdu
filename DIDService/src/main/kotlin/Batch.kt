import io.iohk.atala.prism.api.CredentialClaim

class Batch (
    val title: String,
    val claims: MutableList<CredentialClaim>,
    var batchId: String,
    var credentialHashes: MutableList<String>
)
