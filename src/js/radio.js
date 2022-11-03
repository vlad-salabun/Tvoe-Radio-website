class Radio
{
    soundURL = "https://complex.in.ua/tvoeRadio"

    volume = 1
    muted = false
    currentTrack = ""
    playList = []

    player = null

    constructor(muted = false)
    {
        this.setPlayer()
        this.muted = muted

        setTimeout(() => {
            this.muteListener()
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
                    console.log('playPromise sound playPromise')
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






