class Radio
{
    soundURL = "https://complex.in.ua/tvoeRadio"

    volume = 0.5
    muted = false
    currentTrack = ""
    playList = []

    player = null

    constructor(muted = false)
    {
        setTimeout(() => {
            this.volume = configs.userConfigs.userVolume
        }, 20)

        this.setPlayer()
        this.muted = muted

        setTimeout(() => {
            this.muteListener()
            this.volumeListener()

            $('[type=range]').val(this.volume * 100)
            $("#volume-value").text((Math.round(this.volume * 100)) + "%")
        }, 100)


        setInterval( () => {
            if(this.player.paused) {
                // console.log("main tick, is paused:", this.player.paused)
            }

            this.play()

        }, 1000)
    }

    setPlayer()
    {
        this.player = new Audio(this.soundURL);
        this.player.volume = this.volume

        this.player.onplay = () => {
            // console.log('sound play')
        };

        this.player.onpause = () => {
            // console.log('sound pause')
        };

        this.player.onended = () => {
            // console.log('sound ended')
        };

        this.player.onerror = (error) => {
            console.log('sound error: ', error)
            this.stop()
        }
    }

    play()
    {
        if(!this.player.paused) {
            return
        }

        this.setPlayer()

        try {
            let playPromise = this.player.play()

            if (playPromise !== undefined) {

                playPromise.then((playPromise) => {
                    if(this.muted) {
                        this.mute()
                    }
                    console.log('playPromise: sound in ON!')
                }).catch((error) => {

                    if ("DOMException: The element has no supported sources." == error) {
                        console.log("Відсутнє з'єднання з сервером радіостанції.")
                    } else if ("NotSupportedError: The element has no supported sources." == error) {
                        console.log("Відсутнє з'єднання з сервером радіостанції.")
                    } else if ("AbortError: The play() request was interrupted by a call to pause(). https://goo.gl/LdLk22" == error) {
                        console.log("Підключення триває. Очікуйте відновлення зв'язку")
                    } else if ("NotSupportedError: Failed to load because no supported source was found." == error) {
                        console.log("Підключення триває. Очікуйте відновлення зв'язку")
                    } else if("NotAllowedError: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD" == error) {
                        console.log("Відтворення у браузері неможливе без дозволу користувача.")
                    } else {
                        console.log('playPromise sound error', "[" + error + "]")
                    }

                });
            } else {
                console.log("retry?", playPromise)
            }
        } catch (e) {
            console.log("e", e)
        }
    }

    stop()
    {
        if(!this.player.paused) {
            this.player.pause()
        }
    }

    muteListener()
    {
        $("#not-muted").click( () => {
            this.mute()
        });

        $("#muted").click( () => {
            this.unmute()
        });
    }

    volumeListener()
    {
        $('[type=range]').on('input',  (e) => {
            let volume = $(e.currentTarget).val();

            $("#volume-value").text(volume + "%")
            this.volume = parseFloat(parseInt(volume) / 100);

            if(this.muted) {
                this.unmute()
            }

            this.player.volume = this.volume

        });

        $('[type=range]').on('change',  (e) => {
            let volume = parseFloat(parseInt($(e.currentTarget).val()) / 100);

            configs.saveConfigToStorage("userVolume", volume)
        })
    }

    mute()
    {
        $("#not-muted").hide()
        $("#muted").show()

        this.player.volume = 0;
    }

    unmute()
    {
        $("#muted").hide()
        $("#not-muted").show()

        this.player.volume = this.volume;
    }
}

let radio = new Radio(true);
radio.play()
