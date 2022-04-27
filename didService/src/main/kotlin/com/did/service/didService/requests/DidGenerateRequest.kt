package com.did.service.didService.requests

import io.iohk.atala.prism.crypto.keys.ECKeyPair
import io.iohk.atala.prism.crypto.keys.ECPublicKey
import pbandk.ByteArr
import pbandk.UnknownField
import javax.validation.constraints.Email
import javax.validation.constraints.NotEmpty
import kotlin.reflect.jvm.internal.impl.descriptors.Visibilities.Unknown


data class PublicKey(
    @field:NotEmpty
    var curve: String,

    @field:NotEmpty
    var data: ByteArr,

    @field:NotEmpty
    var unknownFields: Map<Int, UnknownField>
)

data class DidGenerateRequest(
    @field:NotEmpty
    var firstName: String,

    @field:NotEmpty
    var lastName: String,

    @field:Email
    var email: String,

    @field:NotEmpty
    var role: String,

    var publicKey: PublicKey
)
