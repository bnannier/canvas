// Config plugin for the component audit's native build only (docs/app.config.js under
// CANVAS_AUDIT_BUILD=1). The audit sweeps run on a Release build, and a Release
// assemble of this app runs lint's release checks and dexes every library in one daemon:
// on the template's 512 MiB metaspace the Gradle daemon ran out ("OutOfMemoryError:
// Metaspace" in lintVitalAnalyzeRelease and mergeExtDexRelease) on the first audit
// build. The docs development app builds Debug, which does neither, and keeps the
// template's settings.
const { withGradleProperties } = require("expo/config-plugins");

const JVM_ARGS = "-Xmx4096m -XX:MaxMetaspaceSize=1024m";

function withGradleReleaseMemory(config) {
  return withGradleProperties(config, (mod) => {
    const existing = mod.modResults.find((entry) => entry.type === "property" && entry.key === "org.gradle.jvmargs");
    if (existing) existing.value = JVM_ARGS;
    else mod.modResults.push({ type: "property", key: "org.gradle.jvmargs", value: JVM_ARGS });
    return mod;
  });
}

module.exports = withGradleReleaseMemory;
