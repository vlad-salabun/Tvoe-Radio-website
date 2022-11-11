class Radio
{
    soundURL = "https://complex.in.ua/tvoeRadio"

    volume = 0.5
    muted = false
    currentTrack = ""
    playList = []

    player = null
    isFirstLaunch = true
    enableMuting = false
    visualizer = null

    constructor()
    {
        setTimeout(() => {
            this.volume = configs.userConfigs.userVolume
        }, 20)

        this.setPlayer()

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

                    if(this.isFirstLaunch ) {

                        if(!this.muted) {
                            this.fadeInVolume()
                        }
                        this.isFirstLaunch = false
                    }

                    if(this.visualizer == null) {
                        visualizer = new Visualizer
                        visualizer.init(this.player)
                        this.visualizer = true
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
        if(!this.enableMuting) {
            return
        }

        $("#not-muted").hide()
        $("#muted").show()

        this.player.volume = 0;
    }

    unmute()
    {
        $("#muted").hide()
        $("#not-muted").show()

        this.player.volume = this.volume
    }

    fadeInVolume()
    {
        document.getElementById("volume-slider").disabled = true

        this.player.volume = 0
        let steps = 10
        let part = parseFloat(this.volume / steps)

        for (var i = 0; i <= steps; i++) {

            if(i == steps) {
                setTimeout(() => {
                    this.player.volum = this.volume
                    this.enableMuting = true
                    document.getElementById("volume-slider").disabled = false
                }, 50 * i);

            } else {
                setTimeout(() => {
                    this.player.volume = this.player.volume + part
                }, 30 * i);
            }
        }

    }
}

let radio = new Radio();
radio.play()
