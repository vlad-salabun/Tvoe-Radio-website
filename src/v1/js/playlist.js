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
