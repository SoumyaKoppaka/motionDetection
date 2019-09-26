// DETECT FACES
const video = document.getElementById('video')
var previousFrameData
var currentFrameData

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

function motionDetectionGrey(oldData,newData)
{
  // console.log("In FUnction")
  var changedPixels=0
  const threshold=40
  if(oldData === undefined)
  {
    console.log("Started video")
    return -1
  }
  // console.log(oldData.data.length)
  // console.log(newData.data[12]-oldData.data[12])
  var x = 0
  while(x<oldData.data.length){
    var oldLum=oldData.data[x]*0.299 +oldData.data[x+1]*0.587 +oldData.data[x+2]*0.114
    var newLum=newData.data[x]*0.299 +newData.data[x+1]*0.587 +newData.data[x+2]*0.114
    var diff=Math.abs(newLum-oldLum)
    // var r = Math.abs(newData.data[x]-oldData.data[x])
    // var b = Math.abs(newData.data[x+1]-oldData.data[x+1])
    // var g = Math.abs(newData.data[x+2]-oldData.data[x+2])
    // // console.log(r+" "+b+" "+g)
    x+=4
    // console.log((r+b+g))
    if(diff>threshold){
      changedPixels++
    }

    if(changedPixels>500){
      console.log(changedPixels)
      return 1
    }

  } 
  console.log(changedPixels)
  return 0
}

function motionDetection(oldData,newData,width,height)
{
  var changedPixelsArray=[0,0,0,0]
  var changedPixelsPoints = [[],[],[],[]]
  var resultArray=[0,0,0,0,1]
  const threshold=80
  if(oldData === undefined)
  {
    console.log("Started of video")
    return resultArray
  }
  
  for(var yp =0; yp<height;yp++){
    for(var xp=0;xp<width;xp++)
    {      
      var p = 4*yp*width+4*xp
      var r = Math.abs(newData.data[p]-oldData.data[p])
      var g = Math.abs(newData.data[p+1]-oldData.data[p+1])
      var b = Math.abs(newData.data[p+2]-oldData.data[p+2])

      if((r+b+g)>threshold){
        changedPixelsArray[parseInt(4*xp/width)]++
        changedPixelsPoints[parseInt(4*xp/width)].push({x:xp,y:yp})
        if(changedPixelsArray[parseInt(4*xp/width)]>125){
          resultArray[parseInt(4*xp/width)]=1
          resultArray[4]=0
          xp=(parseInt(4*xp/width)+1)*(width/4)

        }
      }
    }
  }
  // console.log(changedPixelsPoints)
  return resultArray

}



function generalMotionDetection(oldData,newData)
{
  // console.log("In FUnction")
  var changedPixels=0
  const threshold=80
  if(oldData === undefined)
  {
    console.log("Started of video")
    return -1
  }
  // console.log(oldData.data.length)
  // console.log(newData.data[12]-oldData.data[12])
  var x = 0
  while(x<oldData.data.length){
    var r = Math.abs(newData.data[x]-oldData.data[x])
    var g = Math.abs(newData.data[x+1]-oldData.data[x+1])
    var b = Math.abs(newData.data[x+2]-oldData.data[x+2])
    // console.log(r+" "+b+" "+g)
    x+=4
    // console.log((r+b+g))
    if((r+b+g)>threshold){
      changedPixels++
    }
  } 
  if(changedPixels>500){
    // console.log(changedPixels)
    return 1
  }
  // console.log(changedPixels)
  return 0
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  canvas.width = video.offsetWidth;
  canvas.height = video.offsetHeight;


  // document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    //Motion Detection
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //resultArray is array of length 5, the first four indices correspond to motion in the 4 vertical sections in the screen
    //and the last one indicates no motion in any section. The value is a boolean(1 or 0) indicating motion, or no motion 
    var resultArray = motionDetection(previousFrameData,currentFrameData,canvas.width,canvas.height)

    var output=[]
    if(resultArray[0]==1)
      output.push("Col 1")
    if(resultArray[1]==1)
      output.push("Col 2")
    if(resultArray[2]==1)
      output.push("Col 3")
    if(resultArray[3]==1)
      output.push("Col 4")
    console.log(output)
    previousFrameData=currentFrameData
  }, 100)
})



