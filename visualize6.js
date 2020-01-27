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
    song = loadSound('../MUSIC/djsnake.mp3')
}

function setup() {
    createCanvas(mywidth,myheight)
    background(0)

    songButton = createButton('play')
    songButton.mousePressed(togglePlay)
    
    fft = new p5.FFT(0.9,bins)
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
var maxx=0

function draw() {
    background(0)

    strokeWeight(5)

    spectrum = fft.analyze()
    
    var imaxx = 0

    for(var i=0;i<bins;i++){
        var f = map(i,0,bins,1,23714)
        if(fft.getEnergy(f,f+1) >= strength){
            var x = map(i,0,bins/8,0,width)
            var y = map(spectrum[i],strength,255,height,height/2)

            if(height-y < maxx/2) stroke(0,255,0)
            else stroke(255,0,0)

            if(imaxx<height-y) imaxx=height-y

            line(x,height,x,y)
            //myspectrum.push(y)
        } 
    }

    maxx = imaxx
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
