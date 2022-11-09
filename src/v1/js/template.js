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
