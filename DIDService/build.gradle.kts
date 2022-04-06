import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "1.6.10"
    application
}

group = "me.acer"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
    mavenLocal()
    google()
    maven("https://plugins.gradle.org/m2/")
    // Required for Kotlin coroutines that support new memory management mode
    maven {
        url = uri("https://maven.pkg.jetbrains.space/public/p/kotlinx-coroutines/maven")
    }
    maven {
        url = uri("https://maven.pkg.github.com/input-output-hk/atala-prism-sdk")
        credentials {
            username = "atala-dev"
            password = "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"
        }
    }
}

dependencies {
    testImplementation(kotlin("test"))
    // needed for cryptography primitives implementation
    implementation("io.iohk.atala:prism-crypto:v1.3.2")
    // needed to deal with DIDs
    implementation("io.iohk.atala:prism-identity:v1.3.2")
    // needed to deal with credentials
    implementation("io.iohk.atala:prism-credentials:v1.3.2")
    // needed to interact with PRISM Node service
    implementation("io.iohk.atala:prism-api:v1.3.2")
    // needed for the credential content, bring the latest version
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.3.2")
    // needed for dealing with dates, bring the latest version
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.2.1")
    // Fixes a bug from SLF4J
    implementation("org.slf4j:slf4j-simple:1.7.32")
    // Fixes a build issue
    implementation("com.soywiz.korlibs.krypto:krypto-jvm:2.0.6")
    // com.google.gson
    implementation("com.squareup.retrofit2:converter-gson:2.7.1")
}

tasks.test {
    useJUnitPlatform()
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "11"
}

application {
    mainClass.set("HelloWorld")
}