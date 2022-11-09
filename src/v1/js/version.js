class Version {
    version = "v1.0.0"
    description = ""

    changelog = []

    constructor() {
        console.log('version', this.version)
        setTimeout(() => {
            let versionElement = document.getElementById("version");

            if (versionElement !== undefined) {
                versionElement.innerText = this.version
            }
        }, 100)
    }
}
let version = new Version
