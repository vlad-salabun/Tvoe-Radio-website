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
            <canvas id="canvas"></canvas>
            <div id="header-info-wrapper">
                <div id="header-title"></div>
                <div id="header-description"></div>
            </div>




        </div>
        <div id="buttons">
            <div id="buttons-inner">
                <div id="buttons-inner-left">
                    <div id="mute-button">
                        <img class="pointer" style="" id="not-muted" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAACeUlEQVQ4ja2UMWgUQRSG/zc7eBqVkE4Q7IIQCIqnQXERlp291YNEtLhCGwsRCxXFwiIQT0SwMSDETgimEdMYc3DxZuZuRRcTNKksLNIJgtoFoqdmb8YmB+e5uTOQv5qZ/+eb94bHAFss6haoVqtDxph7RPRICDHTLc86mUop1xgzAeCatfZmu6+1HvhvoFLKBTDOOR8JguAjEe1IiRWllE/jON7dEdgK8zzvS7tfKpV6yuVyRghRIKK5er0+14T+A1RKudbaBxvBACCTyRzjnL+u1Wr7gyCYIqKper0+AQCklDoLIFzPkrX2AGNsRAjxtRWitV4UQhxuuXgQwBNjzMkwDL9JKcuMsdscwH0iOt9oNAxjbNJxnFO+7/8FayqKol1Jkoxyzh96nvdBSnnXcZwxAFcYY+MALjEA34UQ78MwXCKi377vf06DAYDneavW2vkkSWajKNoeBMEMAHd6etqJ47hmrT3UcWzSlMvlZq21L5MkCYnIGmOWe3t79xWLRQOgsWlgN20aqJQ6DSDknFestcQY619ZWflULBYZAIcB2Km1PlKpVLLW2m3VanXvRrBSqdRDREOMsRHP835qrc9Ya98UCoWG67o+gCVurb0F4CJjDAAWjDHPoyhKncHh4eEfAEbXKx0EMMo5DwHAGHMDwFhaS65S6l0URXtaz7XWi821lPK4UmpeStm/vr+stZ4EUt4wCIKYMXZ9bW3tRTu0qSRJFvv6+k7kcrllKeUFIjrnOM7VVCAA+L7/thM0n8//ymaziVLqGREJznne87zVNFZ7+0eVUgta6wGl1Kt2v9lyq7p+sFLKg0R0xxjzOAzDUtcqtlp/AMoMIysodQCmAAAAAElFTkSuQmCC">

                        <img class="pointer" style="display: none" id="muted" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAADFUlEQVQ4ja3TTWgkRRQH8P+/uifJiIedrOxeBG8bRA+CXsSsTno6PeMgigqDOIp6cFFESCCIHwuGiMYPEGQR0QURcTxMBC8TzVRXeiKRIBgR9JST4EFhFyaom6CZrnpepiHpJO4efKeCevXj1atX0FrrJEkm8D+F8n3/eedc6zhUa12J4zjRWtevCQyCYEsp1bTWfmaMObN/c3V19V6SL4rICySf3b8nItRa33YIBIAgCLY8z3tMRFoZaoypWWtnfd9/UCn1C4CR/QeXlpYUybe01p9sbGwUD4B5VGv9jIjMFgqFh6ampq7kq+j1emMAEIZhDcCPOzs77Xa77R0AM5TkEyTPK6VeOgoDAGttWCqVvllZWbkpiqL3ROT78fHx1wGAxpimiNw9zPUBpJ7nveucaymlmkEQbBljTorI59PT09UMNcacBXDB87xyuVz+I47j75xzTSUicyJy0Tn3EYC7isXiXPZQ+dfvdruntNYLnU6nFIbhuoh8mKbpyySF5Pu+7z+lAFyKomizWq3+QPLK5OTkX9n1MxTAGQCIouiyUuqn0dHRL9vttjcYDD4G8ICI0Dm34pwrH+hhPvahFwGApIRh+AWAn0ul0p31ev0fAL+tra2drlarl0ie+E8wQ33ff5jk6ez6IlIgyWFK6pzzhuvdq4IAMDY29quIzDjnWnEcz5C8td/vb2xubhYA3Li+vv57r9c7QfJPBeCU1vqObrd7u4hc3+l0Snlwd3f3OgAzSqkmgDmSs41Gw25vbz9Ocnl+ft6laXq/c04rAO+QfFopdU5Evh0ZGekchQIoDoe/AuCDOI4fBfDc3t7ewnCozxUKhRbzp7TWdZLnrbX31Wq1PgDk5zBJkglrbULyyTAM4ziOXyHpwjBcPNTDKIq+Ukq95nnesjHm5FE9HVYaAFg0xrwJ4OZ+v/82kPt6WVQqla+VUgsistzr9W44DlVKNUXkEZJvNBoNeyyYoSTnB4PBsrX2FgB/H1NpFcCn2Ugd6mE+tNb3kHyV5GIYhvFROUmSTGR//6rgtUaSJBNpml74F1Phi0WNS9/MAAAAAElFTkSuQmCC">
                    </div>
                    <div id="volume-value" class=""></div>

                </div>
                <div id="buttons-inner-middle">
                    <div id="volume-button"><input type="range" class="form-range pointer" min="0" max="100" id="volume-slider" ></div>
                </div>

                <div id="buttons-inner-right">
                    <div id="download-button">
                        <img class="pointer"
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAABmJLR0QA/wD/AP+gvaeTAAACPElEQVRIie2UsWsUQRSHv5lNiBeC4KJgaSIRQVAIRLxwhQm7hhxoI6RJIYgWQbAJl0rhUFCMoGIj+QuUQxQ5Eu5u57KNJIKliHZaWSiGRJHo7e48m1MOvb1o0uZrhjfvN9+8aQZ2aIPq1FxcXNzd3d09pJTaFUXR24mJiffblodh2BfH8W3gNPAC+A4cBdaAS77vv9qSPAzDviiK6sBCHMe38vn8j189Y4wnIvPAOd/3n/+33BhzD/jsed71dgeWlpaOJElSAxIgA3xQSs2vrq7OT05OJq1Z3VqUy+VeETnTaDTm0qYZGxt7ba3NRVE06Pv+viRJzopIznXdp2EYdqU+o16vHw+C4HHHt6YQBMGDIAiu/DV5qVRyjDGz1tpHSqnlDgKT1stkMrPA+dbpdbFY1K7rPgQGu7q6hjzPu9NhwGNpjVwu91Up9S6O48Hf8pGRkSkR0Z7nXRwdHV3rIP4XngFlY8wUgFZKTVtri2npSqXiVqvV/ta9arXaX6lU3D+znufdj6IoKyIztVrtlAYOrq+vv0mTO44zrLU2xpgBAGPMgNbaOI4z3C6fz+c/WWunlVJXNWABJ03u+34VKIhIAPQ210Jzvy0rKysvgcMaWHZdN58WbF7wBCg0y0KzTiWbze4FGtpae0NE5sIw3L/ZBdba/s3EAEqpGaCkAIwxUyJyTURuOo4TbGxsfNlM0I6enp4DwAUgG0XRyd9/izHmEHAZOCEie7YiBz4CC9bau+Pj49+26NhhG/wEK3XyGXXZXDAAAAAASUVORK5CYII=">
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
            <div id="version-inner" class="hidden-content">
version-inner
            </div>

        </div>
        <div id="footer">
            <div id="footer-left">

                <div class="noselect footer-button footer-button-unactive" id="show-playlist">
                    <div id="ether-icon">
                    </div>
                    <div id="ether-title">Ефір</div>

                </div>
                            <!--
                <div class="noselect footer-button footer-button-unactive" id="show-weather">
                    Погода
                </div>
                --->
            </div>
            <div id="footer-right">
                <div id="version" class="noselect footer-button footer-button-active">
                    <div id="version-icon">
                    </div>
                    <div id="version-number">

                    </div>
                </div>
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
                window.api.send("stealth-window-mode", {
                    "width": 420,
                    "height": 200
                });
*/



            })

            $("#version").click( () => {

                $("#version").addClass("footer-button-unactive")
                $("#version").removeClass("footer-button-active")

                $("#show-playlist").removeClass("footer-button-unactive")
                $("#show-playlist").addClass("footer-button-active")

                //
                $("#content-inner").addClass("hidden-content")
                $("#version-inner").removeClass("hidden-content")
            })

            $("#show-playlist").click( () => {

                $("#version").addClass("footer-button-active")
                $("#version").removeClass("footer-button-unactive")

                $("#show-playlist").removeClass("footer-button-active")
                $("#show-playlist").addClass("footer-button-unactive")

                //
                $("#content-inner").removeClass("hidden-content")
                $("#version-inner").addClass("hidden-content")
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
