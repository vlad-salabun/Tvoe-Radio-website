class Config
{
    defaultVolume = 0.5


    currentTrackURL = "https://www.tvoeradio.com/online/index.php"
    playListURL = "https://www.tvoeradio.com/online/playlist.php"

    userConfigs = {
        userVolume: 0.5,
        autoLaunch: false,
        windowSizeMode: "standard" //"stealth"
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
        console.log("CONFIG updated from storage", this.userConfigs)
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
    lastItemUnixTime = 0

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
            } else if (arr.length > 2) {
                let title = arr[0]
                arr.shift()
                this.showCurrentTrack(title, arr.join(" - "))
            }
            //console.log("response.data", response.data);
        }).catch((error) => {
            //console.log("getCurrentTrack error", error);
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

                    let songDateString = playedYesterday ? this.yesterday + "T" + songTime + ":00" : this.today + "T" + songTime + ":00"
                    let songDateObj = moment(songDateString)

//console.log("textNode[0].innerHTML.trim()", textNode[0].innerHTML.trim())


                    let trackInfo = this.parseTrackAndArtist(textNode[0].innerHTML.trim())

                    this.playlistByDates.push({
                        date: playedYesterday ? this.yesterday : this.today,
                        unix: dateObj.unix(),
                        items: [{
                            date: playedYesterday ? this.yesterday + "T" + songTime + ":00" : this.today + "T" + songTime + ":00",
                            unix: songDateObj.unix(),
                            time: songTime,
                            track: trackInfo.track,
                            artist: trackInfo.artist,
                        }]
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

                        let songDateString = playedYesterday ? this.yesterday + "T" + songTime + ":00" : this.today + "T" + songTime + ":00"
                        let songDateObj = moment(songDateString)

                        let trackInfo = this.parseTrackAndArtist(textNode[0].innerHTML.trim())

                        playListByDate.items.push({
                            date: playedYesterday ? this.yesterday + "T" + songTime + ":00" : this.today + "T" + songTime + ":00",
                            unix: songDateObj.unix(),
                            time: songTime,
                            track: trackInfo.track,
                            artist: trackInfo.artist,
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

    parseTrackAndArtist(string)
    {
        if(string.length < 1) {
            return {
                artist: "Unknown artist",
                track: "Unknown track",
            }
        }

        let array = string.split(" - ")

        if(array.length == 0) {
            return {
                artist: "Unknown artist",
                track: "Unknown track",
            }
        } else if(array.length == 1) {
            return {
                artist:  this.decodeHTMLEntities(array[0]),
                track: "",
            }
        } else if(array.length == 2) {
            // console.log(array)
            return {
                artist:  this.decodeHTMLEntities(array[0]),
                track:  this.decodeHTMLEntities(array[1]),
            }
        } else if(array.length == 3) {
            // console.log("3:", array, string)
            return {
                artist:  this.decodeHTMLEntities(array[0]),
                track: this.decodeHTMLEntities(array[1]) + ' (' + this.decodeHTMLEntities(array[2]) + ')' ,
            }
        }

        return {
            artist: "Artist",
            track: "Track",
        }
    }

    decodeHTMLEntities(text)
    {
        let entities = [
            ['amp', '&'],
            ['apos', '\''],
            ['#x27', '\''],
            ['#x2F', '/'],
            ['#39', '\''],
            ['#47', '/'],
            ['lt', '<'],
            ['gt', '>'],
            ['nbsp', ' '],
            ['quot', '"']
        ];

        for (let i = 0, max = entities.length; i < max; ++i)
            text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);

        return text;
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
                if (c.unix < d.unix) return -1
                if (c.unix > d.unix) return 1
                return 0;
            });
        });

        // console.log("playlistByDates", this.playlistByDates)
    }

    renderPlayList()
    {
        let lastDateUnixTime = 0
        let lastItemUnixTime = 0

        let contentNode = $("#content-inner")

        if(contentNode.length != 1) {
            console.error("Щось не так з блоком контенту:", contentNode)
            return
        } else {
            contentNode = contentNode[0]
        }

        this.playlistByDates.forEach((playListByDate) => {

            // Шукаю блок за датою:
            let contentDateNode = $(".content-date[unix='" + playListByDate.unix + "']")

            // Якщо нема:
            if(contentDateNode.length == 0) {
                // То вставляю
                let dateNode = document.createElement("div")
                    dateNode.setAttribute("unix", playListByDate.unix)
                    dateNode.classList.add("content-date")

                let dateTitleNode = document.createElement("div")
                    dateTitleNode.innerHTML = "Ефір: " + playListByDate.date
                    dateTitleNode.classList.add("content-date-title")

                let dateInnerNode = document.createElement("div")
                    dateInnerNode.setAttribute("unix", playListByDate.unix)
                    dateInnerNode.classList.add("content-date-inner")

                dateNode.append(dateTitleNode)
                dateNode.append(dateInnerNode)

                // Якщо це перший блок:
                if(lastDateUnixTime == 0) {
                    contentNode.appendChild(dateNode)
                } else {
                    // Якщо не перший, то вставляю після попереднього:
                    if(lastDateUnixTime > 0) {
                        let prevContentDateNode = $(".content-date[unix='" + lastDateUnixTime + "']")
                        if(prevContentDateNode.length == 1) {
                            prevContentDateNode[0].after(dateNode)
                        }
                    }
                }

            } else {
                // А якщо є, то що робити?
            }

            let dateNode = document.createElement("div")

            // Рендер плейлиста дня:
            playListByDate.items.forEach((item) => {

                // Шукаю блок за датою:
                let parentDateNode = document.querySelector(".content-date-inner[unix='" + playListByDate.unix + "']")

                if (parentDateNode === null) {
                    return
                }

                // Шукаю ноду ітема:
                let itemLineNode = $(".item-line[unix='" + item.unix + "']")

                // Якщо нема
                if(itemLineNode.length == 0) {

                    // Створюю ноду ітема:
                    let itemLineNode = document.createElement("div")
                        itemLineNode.setAttribute("unix", item.unix)
                        itemLineNode.classList.add("item-line")
                        itemLineNode.classList.add("item-line-hidden")


                    let itemTimeNode = document.createElement("div")
                        itemTimeNode.classList.add("line-time")
                        itemTimeNode.innerText = item.time

                    let itemTitleNode = document.createElement("div")
                        itemTitleNode.classList.add("line-title")
                        itemTitleNode.innerText = this.textEllipsis(item.artist + " — " + item.track, 40)

                    itemLineNode.append(itemTimeNode)
                    itemLineNode.append(itemTitleNode)


                    // Вставляю першим:
                    if(parentDateNode.firstChild == undefined) {
                        parentDateNode.append(itemLineNode)
                    } else {
                        // Знаходжу попередній ітем:
                        // Шукаю ноду помереднього ітема:
                        let prevLineNode = document.querySelector(".item-line[unix='" + this.lastItemUnixTime + "']")

                        if (prevLineNode === null) {
                           parentDateNode.append(itemLineNode)
                        } else {
                            if(item.unix > this.lastItemUnixTime) {
                                parentDateNode.insertBefore(itemLineNode, parentDateNode.firstChild);
                            } else {
                                prevLineNode.after(itemLineNode)
                            }
                        }
                    }

                    setTimeout( () => {
                        itemLineNode.classList.remove('item-line-hidden');
                    }, 1000)

                } else {
                    // console.log('є', item)
                }

                this.lastItemUnixTime = item.unix
            });

            lastDateUnixTime = playListByDate.unix
        });

    } // <-- /renderPlayList()

    clearOldPlaylist()
    {
        // TODO:
    }

    textEllipsis(str, maxLength, { side = "end", ellipsis = "..." } = {}) {
      if (str.length > maxLength) {
        switch (side) {
          case "start":
            return ellipsis + str.slice(-(maxLength - ellipsis.length));
          case "end":
          default:
            return str.slice(0, maxLength - ellipsis.length) + ellipsis;
        }
      }
      return str;
    }

}
let playlist = new Playlist


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




        </div>
        <div id="buttons">
            <div id="buttons-inner">
                <div id="buttons-inner-left">
                    <div id="mute-button">
                        <img class="pointer" style="" id="not-muted" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAADAUlEQVRIib2VX4hUZRjGf+93zq5rYsuObTB/cJ0/SLagbqMh7M6sA3YTrtC2IEF2261EhoJBRSAE0aW3QldtYmwQXYygO2d2BSN2lRZim8apdc4Y2O6mZJpzvreb0g1nZk9JPXff+Z7v+b3n8L3vgf9YEta43fsp1aT5mrFMVUbjc2HPuWFMmZL/XJOgCBKxhsPAjrAAEybcCkUg8uejra18yZJ/Ju352X8ESHt+1grn14S3lYN+psLZdKn+VihA2vOzCkWgr2MRMzeeRtVU8vEp9z57VeRQqlx/tyMgVfb3hAkHsKonU+XG+e2zS/HFQuym6drwIiovJ736GIAkZpciGwJn1CKumuA7B7ep1pY6hN+p5mKbHqxUJeU1jiK8bpv39tUKydW052ctTDq3f33WdAfuBYVzgk6KyogN7JthKk/MLkVQNYhoNR/7SJVJ4/acBvg+F/tahDn75KYJA7rz4fvKqgib1wsH6LbOyXS58c3AtL8D4IktK++DjgxM30gCGKsfo0yse03bqToSe0NUTziGc/svqLswOPi7wCeusWMAJpAZQZ7/1wCASj4+pSor153GTgCrfGtFMgCLhdhNRXsfC9BSqrp2+ViAtOe/JKJ9iSB6FcAIzxjVCkCm1OgHVkPNolZKlusfoBwMLOMXC9IcXFjo/m2ZwzYwOQBFh4HLLnAF2AWASC9ib6HrD9lAm6eujWw9jogFuLPc97ZAqVaI1gBUOAL6qdvkfqFLu0atSBcEiwbnokUPsc78+TE3sAI8bDSY4G7PPngwZnZtjKy+0rLUzHR9yBppN+T+1skpzz8FsjdQ98gP+f5GqrjcKz13L6nKsWo++kXbb5GZrg8FIkURtnQEFJd7qwf6biNiM6VGv4r9XNV8Wc1H34MOt6gyGp9Txx5Q5ed2HoDqC5FfELGpsj9uRb+ymLN/hXcEANSGE/MtIPqIcVId0DGjjF/LRT9cuxXqn7xt5vpuY00ReAqYr+ZiQ2HOQchGqw0n5hGyIO8YkVfDhv8v+gPopT6YkpKEPgAAAABJRU5ErkJggg==">
                        <img class="pointer" style="display: none" id="muted" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAB3ElEQVRIib2VTU8TURSGn3NnKkZjjHXlUEihDYkbpNqVtmladWfc6oK4NTH4D1z4D1wYF/wFd24FxNqBFYmyBbHEMpOYaKIuiLFz73UDWA0wAzN6dvfkPe9z77lf8I9DkgonOp/GI6J7yvDifWP4bdI6N4mo/Ca8HKHnQPJGcQe4mBSg4gTFpa0pDS+B/E5qNKl5LKDcDiqi1bwI549imghQbgcVLTKXxhwO2INyO6gYJfPyuy3HBxSWe/kh7TQM4lql1x3cyBizAJxLaw7gntDuosVOChasPDTGVEWyMQdQYCf3Rka+inAmSWFxsXty3A8WRvyP3m5uzA9mSp3w0R8rOO7MNptjP0p++Dxn3VcTy73r2ji3rGXmp0StTAAAGzVvttQJhyLtrADf+hK1erXRcFATe9HSRipAyQ/vW3jgOroqwpOddg1nAvBWwlPGcrcvUWvt6kiwUfNmLfI00mp6UOcCq8AlAETOIuY7Nv6RDaveNtAczHXrF579rXMj+s2czTWMSA70msJ5bbC3yeAWwwH/QXFpa+qQR277Q907nRSw7x5sXiu8s465AXxOanQkwB6E9JBDT1G3Xlg1yty0li8DaZsZAPZt13qmgF0IwhWQx0pkOr7iP8YvPPGm76AWElwAAAAASUVORK5CYII=">
                    </div>
                    <div id="volume-value" class=""></div>

                </div>
                <div id="buttons-inner-middle">
                    <div id="volume-button" class="pointer"><input type="range" class="form-range pointer" min="0" max="100" id="volume-slider" ></div>
                </div>

                <div id="buttons-inner-right">
                    <div id="download-button">
                        <img class="pointer"
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAhklEQVRIiWNgGAUDDRhhDKXDz/4TUNp5z1ayglQLmIhX+r9c6fDzDlItIMEHpIF7tlKMDAwk+YA8MMIsuGcrxQgLW5pYQA4YDBYwdqIHDYL/v5EKFmDPYEqHnzYwMDDWU8ECTEuINZyBgYGBhTgLYJY8/QFhE2c4iRaQZjAMDIZUNAqGOgAAusoomyX5pkMAAAAASUVORK5CYII=">
                    </div>
                </div>
            </div>
        </div>
        <div id="content">
            <div id="content-inner">

            </div>
            <div id="weather-inner" class="hidden-content">
weather-inner
            </div>
            <div id="config-inner" class="hidden-content">
config-inner
            </div>
        </div>
        <div id="footer">
            <div id="footer-left">
                <div class="footer-button" id="show-playlist">
                    Ефір
                </div>
                <div class="footer-button" id="show-weather">
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
            });

            $("#show-playlist").click( () => {
                $("#content-inner").removeClass("hidden-content")
                $("#weather-inner").addClass("hidden-content")
            })

            $("#show-weather").click( () => {
                $("#content-inner").addClass("hidden-content")
                $("#weather-inner").removeClass("hidden-content")
/*
                window.api.send("save-to-storage", {
                    "key": "test-key",
                    "data": {
                        "asmrtist": "PPOMO",
                        "keywords": [1,2,3]
                    }
                });
*/
                console.log("configs", configs)


            })





        }, 90)



        setTimeout( () => {
            $("#root").removeClass("hidden-content")
        }, 1500)

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


window.api.receive("read-one-from-storage", (data) => {

    if(data.request.key == "configs") {
        configs.updateConfigFromStorage(data.response)
        return
    }

    console.log("read-one-from-storage", data);
});


