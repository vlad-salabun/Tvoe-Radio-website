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
    barHeight = 10
    WIDTH = 0
    HEIGHT = 0
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
        this.WIDTH = this.canvas.width
        this.HEIGHT = this.canvas.height

        this.ctx = this.canvas.getContext("2d")

        this.analyser.fftSize = 128;
        this.bufferLength = this.analyser.frequencyBinCount
        this.dataArray = new Uint8Array(this.bufferLength)
        this.barWidth = this.WIDTH / this.bufferLength

        renderFrame()
    }

}
let visualizer = new Visualizer


/**
 * Анімація стовпців
 */
function renderFrame()
{
    requestAnimationFrame(renderFrame);

    let x = 0;

    visualizer.analyser.getByteFrequencyData(visualizer.dataArray);

    visualizer.ctx.fillStyle = "#2b2b2b";
    visualizer.ctx.fillRect(0, 0, visualizer.canvas.width, visualizer.canvas.height);

    for (var i = 0; i < visualizer.bufferLength; i++) {
        visualizer.barHeight = visualizer.dataArray[i];

        var r = visualizer.barHeight + (25 * (i/visualizer.bufferLength));
        var g = 250 * (i/visualizer.bufferLength);
        var b = 50;

        visualizer.ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        visualizer.ctx.fillRect(x, visualizer.canvas.height - visualizer.barHeight, visualizer.barWidth, visualizer.barHeight);

        x += visualizer.barWidth + 1;

    }
}
