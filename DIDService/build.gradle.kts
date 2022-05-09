import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
	id("org.springframework.boot") version "2.6.7"
	id("io.spring.dependency-management") version "1.0.11.RELEASE"
	kotlin("jvm") version "1.6.21"
	kotlin("plugin.spring") version "1.6.21"
}

group = "com.did.service"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_11

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
	// needed for cryptography primitives implementation
	implementation("io.iohk.atala:prism-crypto:v1.3.3")
	// needed to deal with DIDs
	implementation("io.iohk.atala:prism-identity:v1.3.3")
	// needed to deal with credentials
	implementation("io.iohk.atala:prism-credentials:v1.3.3")
	// needed to interact with PRISM Node service
	implementation("io.iohk.atala:prism-api:v1.3.3")
	// needed for the credential content, bring the latest version
	implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.3.2")
	// needed for dealing with dates, bring the latest version
	implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.3.2")
	// Fixes a bug from SLF4J
//	implementation("org.slf4j:slf4j-simple:1.7.36")
	// Fixes a build issue
	implementation("com.soywiz.korlibs.krypto:krypto-jvm:2.7.0")
	// com.google.gson
	implementation("com.squareup.retrofit2:converter-gson:2.9.0")

	implementation("org.springframework.boot:spring-boot-starter-data-r2dbc")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-webflux")
	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
	implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")
	implementation("com.h2database:h2")

	implementation("org.springdoc:springdoc-openapi-webflux-ui:1.6.8")
	implementation("org.springdoc:springdoc-openapi-kotlin:1.6.8")
	implementation("io.ktor:ktor-server-cors:2.0.1")

	runtimeOnly("io.r2dbc:r2dbc-h2")
}

tasks.withType<KotlinCompile> {
	kotlinOptions {
		freeCompilerArgs = listOf("-Xjsr305=strict")
		jvmTarget = "11"
	}
}

tasks.withType<Test> {
	useJUnitPlatform()
}
