class Config
{
    defaultVolume = 0.5


    currentTrackURL = "https://www.tvoeradio.com/online/index.php"
    playListURL = "https://www.tvoeradio.com/online/playlist.php"

    userConfigs = {
        userVolume: 0.5
    }

    errorMessages = {
        "sound_errors": [
            ["Зачекайте...", "Зв'язок з сервером відсутній! Підключаюсь..."],
            ["Збій!", "Відсутнє з'єднання з сервером! Лагодимо..."],
            ["Помилка!", "Немає з'єднання з сервером! Лагодимо..."],
        ],
        "api_errors": [
            ["Зачекайте...", "Зв'язок з сервером відсутній! Підключаюсь..."],
            ["Встановлюю з'єднання", "Зв'язок з сервером втрачено :("],
            ["Збій!", "Відсутнє з'єднання з сервером! Лагодимо..."],
            ["Помилка!", "Немає з'єднання з сервером! Лагодимо..."],
        ],
    }

    constructor()
    {

    }

    getConfigFromStorage()
    {
        window.api.send("read-one-from-storage", {"key": "configs"})
    }

    /**
     * Завантаження користувацьких конфігів з сховища:
     */
    updateConfigFromStorage(data)
    {
        if("userVolume" in data) {
            this.userConfigs.userVolume = data.userVolume
        } else {
            this.userConfigs.userVolume = this.defaultVolume
        }

        console.log("CONFIG updated from storage", this.userConfigs)

    }

    /**
     * Оновлення одного конфігу:
     */
    saveConfigToStorage(configName, configValue)
    {
        this.userConfigs[configName] = configValue

        window.api.send("save-to-storage", {
            "key": "configs",
            "data": this.userConfigs
        });
    }
}
let configs = new Config
    configs.getConfigFromStorage()
