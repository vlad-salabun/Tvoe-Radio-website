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

            console.log("playlistByDates", this.playlistByDates)

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



