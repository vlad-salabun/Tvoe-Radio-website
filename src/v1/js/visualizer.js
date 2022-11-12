class Visualizer
{
    audioCtx = null
    audioSource = null
    analyser = null
    canvas = null
    ctx = null
    bufferLength = null
    dataArray = null
    barWidth = null
    barHeight = 0
    width = 0
    height = 0
    x = 0

    constructor()
    {

    }

    init(player)
    {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        this.audioSource = this.audioCtx.createMediaElementSource(player)
        this.analyser = this.audioCtx.createAnalyser()
        this.audioSource.connect(this.analyser)
        this.analyser.connect(this.audioCtx.destination)

        this.canvas = document.getElementById("canvas")
        this.width = canvas.getBoundingClientRect().width;
        this.height = canvas.getBoundingClientRect().height;

        this.canvas.width = this.width
        this.canvas.height = this.height

        this.ctx = this.canvas.getContext("2d")

        this.analyser.fftSize = 2048;
        this.bufferLength = this.analyser.frequencyBinCount
        this.dataArray = new Uint8Array(this.bufferLength)
        this.barWidth = this.width / this.bufferLength
        renderFrame()
    }

}
let visualizer = new Visualizer

function renderFrame()
{
    // basicAnimation()
    basicAnimation2()
}


/**
 * Анімація стовпців
 */
function basicAnimation()
{


    visualizer.analyser.fftSize = 2048;

    let x = 0;
    let sliceWidth = (visualizer.width * 1.0) / visualizer.bufferLength;

    visualizer.analyser.getByteFrequencyData(visualizer.dataArray);

    // Стирання стовпців:
    visualizer.ctx.fillStyle = "#2b2b2b";
    visualizer.ctx.fillRect(0, 0, visualizer.width, visualizer.height);

    for (var i = 0; i < visualizer.bufferLength; i++) {

        // ???
        let barHeight = visualizer.dataArray[i] / 2.55; // 2.55

        // Відображення стовпців:
        /*
        visualizer.ctx.fillStyle = "#bbbbbb"
        visualizer.ctx.fillStyle = "#8d8d8d"
        visualizer.ctx.fillStyle = "#4c4b4b"*/


        visualizer.ctx.fillStyle = "#4c4b4b"


        visualizer.ctx.fillRect(
            x,
            visualizer.height - barHeight,
            //visualizer.barWidth,
            7,
            barHeight
        );

        // Відступ від попереднього стовпця:
        x += 8;

    }

    requestAnimationFrame(basicAnimation);
}

/**
 * Анімація стовпців
 */
function basicAnimation2()
{


    visualizer.analyser.fftSize = 2048;

    let x = 0;
    let sliceWidth = (visualizer.width * 1.0) / visualizer.bufferLength;

    visualizer.analyser.getByteFrequencyData(visualizer.dataArray);

    // Стирання стовпців:
    visualizer.ctx.fillStyle = "#2b2b2b";
    visualizer.ctx.fillRect(0, 0, visualizer.width, visualizer.height);

    for (var i = 0; i < visualizer.bufferLength; i++) {

        // ???
        let barHeight = visualizer.dataArray[i] / 2.55; // 2.55

        // Відображення стовпців:
        /*
        visualizer.ctx.fillStyle = "#bbbbbb"
        visualizer.ctx.fillStyle = "#8d8d8d"
        visualizer.ctx.fillStyle = "#4c4b4b"*/


        visualizer.ctx.fillStyle = "#4c4b4b"


        visualizer.ctx.fillRect(
            x,
            visualizer.height - barHeight,
            2,
            barHeight
        );

        // Відступ від попереднього стовпця:
        x += 3;

    }
    requestAnimationFrame(basicAnimation2);
}
