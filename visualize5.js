var song
var songButton
var songslider

var amp
var fft
var waveform
var spectrum = []
var myspectrum = [0,0,0,0,0,0,0,0]
var res = []
var bins = 1024
var strength = 180

var myheight = 580
var mywidth = 1600

function preload() {
    song = loadSound('../MUSIC/ud_chala.mp3')
}

function setup() {
    createCanvas(mywidth,myheight)
    background(0)

    songButton = createButton('play')
    songButton.mousePressed(togglePlay)
    songslider = createSlider(0,song.duration(),0)
    songslider.mousePressed(seeks)

    //amp = new p5.Amplitude()
    fft = new p5.FFT(0.9,bins)
    mic = new p5.AudioIn()
    mic.connect()
}

function togglePlay() {
    if(song.isPlaying()){
        song.pause()
        songButton.html('play')
    }
    else{
        song.play()
        songButton.html('pause')
    }
}

function seeks() {
    //song.stop()
    song.jump(songslider.value())
}

function draw() {
    background(0)

    stroke(255)
    strokeWeight(5)
    text(mic.getLevel(),100,100)
    spectrum = fft.analyze()
    
    for(var i=0;i<bins;i++){
        var f = map(i,0,bins,1,23714)
        if(fft.getEnergy(f,f+1) >= strength){
            var x = map(i,0,bins/8,0,width)
            var y = map(spectrum[i],strength,255,height,height/2)
            
            if(height-y < 120) stroke(0,255,0)
            else stroke(255,0,0)
            /*if(height-y > 10) */line(x,height,x,y)
            myspectrum.push(y)
        } 
    }
    //console.log(myspectrum)
    
    /*res = smoothed_z_score(myspectrum)
    beginShape()
    for(var i=0;i<res.length;i++)
    {
        var x = map(i,0,bins/8,0,width)
        var y = map(res[i],-1,1,300,100)

        noFill()
        vertex(x,y)
    }
    endShape()
    if(myspectrum.length >10 ) myspectrum.splice(0,myspectrum.length-6)*/
}


function sum(a) {
    return a.reduce((acc, val) => acc + val)
}

function mean(a) {
    return sum(a) / a.length
}

function stddev(arr) {
    const arr_mean = mean(arr)
    const r = function(acc, val) {
        return acc + ((val - arr_mean) * (val - arr_mean))
    }
    return Math.sqrt(arr.reduce(r, 0.0) / arr.length)
}

function smoothed_z_score(y, params) {
    var p = params || {}
    // init cooefficients
    const lag = p.lag || 5
    const threshold = p.threshold || 3.5
    const influence = p.influece || 0.5

    if (y === undefined || y.length < lag + 2) {
        throw ` ## y data array to short(${y.length}) for given lag of ${lag}`
    }
    //console.log(`lag, threshold, influence: ${lag}, ${threshold}, ${influence}`)

    // init variables
    var signals = Array(y.length).fill(0)
    var filteredY = y.slice(0)
    const lead_in = y.slice(0, lag)
    //console.log("1: " + lead_in.toString())

    var avgFilter = []
    avgFilter[lag - 1] = mean(lead_in)
    var stdFilter = []
    stdFilter[lag - 1] = stddev(lead_in)
    //console.log("2: " + stdFilter.toString())

    for (var i = lag; i < y.length; i++) {
        //console.log(`${y[i]}, ${avgFilter[i-1]}, ${threshold}, ${stdFilter[i-1]}`)
        if (Math.abs(y[i] - avgFilter[i - 1]) > (threshold * stdFilter[i - 1])) {
            if (y[i] > avgFilter[i - 1]) {
                signals[i] = +1 // positive signal
            } else {
                signals[i] = -1 // negative signal
            }
            // make influence lower
            filteredY[i] = influence * y[i] + (1 - influence) * filteredY[i - 1]
        } else {
            signals[i] = 0 // no signal
            filteredY[i] = y[i]
        }

        // adjust the filters
        const y_lag = filteredY.slice(i - lag, i)
        avgFilter[i] = mean(y_lag)
        stdFilter[i] = stddev(y_lag)
    }

    return signals
}
