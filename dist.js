class Config
{
    currentTrackURL = "https://www.tvoeradio.com/online/index.php"
    playListURL = "https://www.tvoeradio.com/online/playlist.php"

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
}



class Playlist
{
    currentTrackURL = ""
    currentArtist = ""
    currentSong = ""
    playlistByDates = [] // масив з обєктами, які містять дати та плейлисти
    config = {}

    /**
     * Допоміжні змінні, щоб мені зручненько було:
     */
    today = ''
    yesterday = ''

    constructor()
    {
        this.config = new Config

        // TODO: Після завантаження DOM
        setTimeout(() => {
            this.getCurrentTrack()
            this.getPlayList()
            this.downloadButtonListener()
            this.actionButtonListener()

        }, 100)

        setInterval( () => {
            this.getCurrentTrack()
            this.getPlayList()
        }, 30000)

    }

    downloadButtonListener()
    {
        $("#download-button").click( () => {
            console.log(
                "download-button",
                this.currentArtist,
                this.currentSong,
            )

            window.api.send("open-external-url", "https://google.com/search?q=" + encodeURIComponent(this.currentArtist + " — " + this.currentSong + " завантажити"));
        });
    }

    actionButtonListener()
    {
        $("#action-button").click( () => {
            console.log('action-button')
            this.showCurrentTrack(this.currentArtist, this.currentSong)
        });
    }

    getCurrentTrack()
    {
        axios.post(this.config.currentTrackURL, {}).then((response) => {

            // TODO: перевір чи це рядок, і якої довжини? Обрізай

            let arr = response.data.split(" - ")

            if (arr.length == 1) {
                this.showCurrentTrack(arr[0], "")
            } else if (arr.length == 2) {
                this.showCurrentTrack(arr[0], arr[1])
            }

        }).catch((error) => {
           // console.log("getCurrentTrack error", error);
            this.showCurrentTrack(this.config.errorMessages.api_errors[1][1], this.config.errorMessages.api_errors[1][0])
        });
    }

    showCurrentTrack(title, description)
    {
        this.currentArtist = title
        this.currentSong = description
        document.title = title + " — " + description

        let titleElement = document.getElementById("header-title");
        let descriptionElement = document.getElementById("header-description");

        if(titleElement === undefined || descriptionElement ===  undefined) {
            return
        }

        $("#header-title").addClass("header-font-hide")
        $("#header-description").addClass("header-font-hide")

        setTimeout( () => {

            titleElement.innerHTML = this.currentArtist
            descriptionElement.innerHTML = this.currentSong

            $("#header-title").removeClass("header-font-hide")
            $("#header-description").removeClass("header-font-hide")
        }, 700)
    }

    getPlayList()
    {
        let parser = new DOMParser();

        // Дізнаюсь сьогоднішню дату:
        this.setDates()

        $("#content-inner").text("")

        let lastTime = null

        axios.post(this.config.playListURL, {}).then((response) => {

            // TODO: перевір чи добре розпарсилось?
            let htmlDoc = parser.parseFromString(response.data, 'text/html');
            let items = htmlDoc.getElementsByClassName("update-nag")

            if(items.length == 0) {
                console.error("Не парситься HTML плейлиста", items)
                return
            }

            // Обробляю вхідний HTML:
            Array.prototype.forEach.call(items, (item, index) => {

                let timeNode = item.getElementsByClassName("update-split")
                let textNode = item.getElementsByClassName("update-text")

                // TODO: що робити, якщо вміст плейлиста не парситься?
                if(timeNode.length < 1 || textNode.length < 1) {
                    return
                }

                let playedYesterday = false

                // TODO: перевір чи час відтворення є валідним у HTML
                let songTime = timeNode[0].innerHTML.trim()

                // Дата відтворення:
                let playDate = moment(this.today + "T" + songTime + ":00")

                // Дізнаюсь чи ця дата є вчорашньою:
                if(lastTime == null) {
                    // Сьогоднішня:
                    lastTime = moment(this.today + "T" + songTime + ":00")

                } else {
                    // Якщо дата зросла, то це ознака вчорашньої дати:
                    if(playDate.unix() > lastTime.unix()) {
                        playedYesterday = true
                        playDate = moment(this.yesterday + "T" + songTime + ":00")
                        lastTime = moment(this.yesterday + "T" + songTime + ":00")

                    }
                }

                // Шукаю у плейлисті вказану дату:
                let playListByDate = this.playlistByDates.find( (element) => {
                    if(playedYesterday) {
                        if (element.date == this.yesterday) {
                            return true
                        }
                    } else {
                        if (element.date == this.today) {
                            return true
                        }
                    }
                })

                // Якщо не знайдена дата, то додаю її з порожнім листом:
                if(playListByDate == undefined) {

                    let dateString = playedYesterday ? this.yesterday : this.today
                    let dateObj = moment(dateString)

                    this.playlistByDates.push({
                        date: playedYesterday ? this.yesterday : this.today,
                        unix: dateObj.unix(),
                        items: []
                    })
                } else {

                    // Дізнаюсь чи є вже це трек у списку за вказаною датою:
                    let listItem = playListByDate.items.find( (element) => {
                        if(playedYesterday) {
                            if (element.date == this.yesterday + "T" + songTime + ":00") {
                                return true
                            }
                        } else {
                            if (element.date == this.today + "T" + songTime + ":00") {
                                return true
                            }
                        }
                    })

                    // Якщо нема, то додаю:
                    if(listItem == undefined) {

                        let dateString = playedYesterday ? this.yesterday + "T" + songTime + ":00" : this.today + "T" + songTime + ":00"
                        let dateObj = moment(dateString)

                        playListByDate.items.push({
                            date: playedYesterday ? this.yesterday + "T" + songTime + ":00" : this.today + "T" + songTime + ":00",
                            unix: dateObj.unix(),
                            time: songTime,
                            track: textNode[0].innerHTML.trim(),
                            artist: textNode[0].innerHTML.trim(),
                        })
                    }

                }

            });



            setTimeout( () => {
                this.sortPlayList()
            }, 300)

            setTimeout( () => {
                this.renderPlayList()
            }, 1000)

        }).catch((error) => {
            console.log("getPlayList error", error)

        });
    }

    setDates()
    {
        let currentDate = moment().tz('Europe/Kiev');
        let yesterdayDate = moment().tz('Europe/Kiev').subtract(1, 'days')
        this.today = currentDate.format('YYYY') + "-" + currentDate.format('DD') + "-" + currentDate.format('MM')
        this.yesterday = yesterdayDate.format('YYYY') + "-" + yesterdayDate.format('DD') + "-" + yesterdayDate.format('MM')
    }

    sortPlayList()
    {
        this.playlistByDates.sort(function(a, b) {

            if (a.unix < b.unix) return 1
            if (a.unix > b.unix) return -1
            return 0;
        });

        this.playlistByDates.forEach((playListByDate) => {
            playListByDate.items.sort(function(c, d) {
                if (c.unix < d.unix) return 1
                if (c.unix > d.unix) return -1
                return 0;
            });
        });

        console.log("playlistByDates", this.playlistByDates)
    }

    renderPlayList()
    {
        /*$("#content-inner").append(`
                    <div class="content-line">
                        <div className="line-time">` + timeNode[0].innerHTML + ` | (` +  playDate.format("DD/MM HH:mm") + `) </div>

                    </div>
                `)*/
        //<div className="line-title">` + textNode[0].innerHTML + `</div>

        // console.log("getPlayList", timeNode[0].innerHTML, textNode[0].innerHTML)
    }



}
let playlist = new Playlist





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








/**
 * https://yoksel.github.io/url-encoder/
 * https://www.base64-image.de/
 */

class Template
{
    template = `
    <div id="page">
        <div id="navbar">
            <div id="burger">
                
            </div>
            <div id="window-title">Твоє радіо!</div>
            <div id="window-buttons">
                <div id="close-button">
                    <img src="svg/icons8-cancel-15.svg" class="pointer">
                </div>
            </div>
        </div>
        <div id="header">
            <div id="header-title"></div>
            <div id="header-description"></div>
            
            <div id="download-button">
                <img class="pointer"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAhklEQVRIiWNgGAUDDRhhDKXDz/4TUNp5z1ayglQLmIhX+r9c6fDzDlItIMEHpIF7tlKMDAwk+YA8MMIsuGcrxQgLW5pYQA4YDBYwdqIHDYL/v5EKFmDPYEqHnzYwMDDWU8ECTEuINZyBgYGBhTgLYJY8/QFhE2c4iRaQZjAMDIZUNAqGOgAAusoomyX5pkMAAAAASUVORK5CYII=">
            </div> 
            
            
        </div>
        <div id="buttons">
            <div id="buttons-inner">
                <div id="buttons-inner-left">
                    <div id="mute-button">
                        <img class="pointer" style="" id="not-muted" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAADAUlEQVRIib2VX4hUZRjGf+93zq5rYsuObTB/cJ0/SLagbqMh7M6sA3YTrtC2IEF2261EhoJBRSAE0aW3QldtYmwQXYygO2d2BSN2lRZim8apdc4Y2O6mZJpzvreb0g1nZk9JPXff+Z7v+b3n8L3vgf9YEta43fsp1aT5mrFMVUbjc2HPuWFMmZL/XJOgCBKxhsPAjrAAEybcCkUg8uejra18yZJ/Ju352X8ESHt+1grn14S3lYN+psLZdKn+VihA2vOzCkWgr2MRMzeeRtVU8vEp9z57VeRQqlx/tyMgVfb3hAkHsKonU+XG+e2zS/HFQuym6drwIiovJ736GIAkZpciGwJn1CKumuA7B7ep1pY6hN+p5mKbHqxUJeU1jiK8bpv39tUKydW052ctTDq3f33WdAfuBYVzgk6KyogN7JthKk/MLkVQNYhoNR/7SJVJ4/acBvg+F/tahDn75KYJA7rz4fvKqgib1wsH6LbOyXS58c3AtL8D4IktK++DjgxM30gCGKsfo0yse03bqToSe0NUTziGc/svqLswOPi7wCeusWMAJpAZQZ7/1wCASj4+pSor153GTgCrfGtFMgCLhdhNRXsfC9BSqrp2+ViAtOe/JKJ9iSB6FcAIzxjVCkCm1OgHVkPNolZKlusfoBwMLOMXC9IcXFjo/m2ZwzYwOQBFh4HLLnAF2AWASC9ib6HrD9lAm6eujWw9jogFuLPc97ZAqVaI1gBUOAL6qdvkfqFLu0atSBcEiwbnokUPsc78+TE3sAI8bDSY4G7PPngwZnZtjKy+0rLUzHR9yBppN+T+1skpzz8FsjdQ98gP+f5GqrjcKz13L6nKsWo++kXbb5GZrg8FIkURtnQEFJd7qwf6biNiM6VGv4r9XNV8Wc1H34MOt6gyGp9Txx5Q5ed2HoDqC5FfELGpsj9uRb+ymLN/hXcEANSGE/MtIPqIcVId0DGjjF/LRT9cuxXqn7xt5vpuY00ReAqYr+ZiQ2HOQchGqw0n5hGyIO8YkVfDhv8v+gPopT6YkpKEPgAAAABJRU5ErkJggg==">
                        <img class="pointer" style="display: none" id="muted" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAB3ElEQVRIib2VTU8TURSGn3NnKkZjjHXlUEihDYkbpNqVtmladWfc6oK4NTH4D1z4D1wYF/wFd24FxNqBFYmyBbHEMpOYaKIuiLFz73UDWA0wAzN6dvfkPe9z77lf8I9DkgonOp/GI6J7yvDifWP4bdI6N4mo/Ca8HKHnQPJGcQe4mBSg4gTFpa0pDS+B/E5qNKl5LKDcDiqi1bwI549imghQbgcVLTKXxhwO2INyO6gYJfPyuy3HBxSWe/kh7TQM4lql1x3cyBizAJxLaw7gntDuosVOChasPDTGVEWyMQdQYCf3Rka+inAmSWFxsXty3A8WRvyP3m5uzA9mSp3w0R8rOO7MNptjP0p++Dxn3VcTy73r2ji3rGXmp0StTAAAGzVvttQJhyLtrADf+hK1erXRcFATe9HSRipAyQ/vW3jgOroqwpOddg1nAvBWwlPGcrcvUWvt6kiwUfNmLfI00mp6UOcCq8AlAETOIuY7Nv6RDaveNtAczHXrF579rXMj+s2czTWMSA70msJ5bbC3yeAWwwH/QXFpa+qQR277Q907nRSw7x5sXiu8s465AXxOanQkwB6E9JBDT1G3Xlg1yty0li8DaZsZAPZt13qmgF0IwhWQx0pkOr7iP8YvPPGm76AWElwAAAAASUVORK5CYII=">
                    </div>
                    <div id="volume-value" class="">100%</div>  
                    <div id="volume-button" class="pointer"><input type="range" class="form-range pointer" min="0" max="100" id="valume-input" value="10"></div>  

                </div>
                <div id="buttons-inner-middle">
                            
                </div>
                
                <div id="buttons-inner-right">
                            
                </div>
            </div>
        </div>
        <div id="content">
            <div id="content-inner">
                <div class="content-line">
                    <div class="line-time"></div>
                    <div class="line-title"></div>
                </div>
            </div>
        </div>
        <div id="footer">
            <div id="footer-left">
                <div class="footer-button">
                    Музика
                </div>
                <div class="footer-button">
                    Погода
                </div>
            </div>
            <div id="footer-right">
                <div id="version"></div>
            </div>
            
        </div>
    </div>
           `

    constructor()
    {
        this.defaultNode = document.getElementById("root")
        this.rootNode = document.getElementById("root")

        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(this.template, 'text/html')
       // console.log(htmlDoc.documentElement.innerHTML)
        this.rootNode.appendChild( htmlDoc.documentElement)

        setTimeout( () => {
            $("#close-button").click( () => {
                window.api.send("exit", {});
                window.api.send("text", {});
            });
        }, 90)
    }


    render()
    {

    }
}

let template = new Template
template.render()


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

