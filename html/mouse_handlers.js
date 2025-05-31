function getCanvasMouseLocation(e) {
  //provide the mouse location relative to the upper left corner
  //of the canvas

  /*
  This code took some trial and error. If someone wants to write a
  nice tutorial on how mouse-locations work that would be great.
  */
  let rect = canvas.getBoundingClientRect()

  //account for amount the document scroll bars might be scrolled

  //get the scroll offset
  const element = document.getElementsByTagName("html")[0]
  let scrollOffsetX = element.scrollLeft
  let scrollOffsetY = element.scrollTop

  let canX = e.pageX - rect.left - scrollOffsetX
  let canY = e.pageY - rect.top - scrollOffsetY

  return {
    x: canX,
    y: canY
  }
}

function handleMouseDown(e) {
  if(enableShooting === false) return //cannot shoot when stones are in motion
  if(!isClientFor(whosTurnIsIt)) return //only allow controlling client

  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y
  //console.log("mouse down:" + canvasX + ", " + canvasY)

  stoneBeingShot =allStones.stoneAtLocation(canvasX, canvasY)

  if(stoneBeingShot === null){
    if(iceSurface.isInShootingCrosshairArea(canvasMouseLoc)){
      //  Changed place in A5
      console.log('inCorrectLocation')
      if(shootingQueue.isEmpty()) {
        stageStones();
        //  Send singal to other players to restart
        socket.emit('restart');
      }
      //console.log(`shooting from crosshair`)
      stoneBeingShot = shootingQueue.front()
      //console.log(shootingQueue);
      stoneBeingShot.setLocation(canvasMouseLoc)
      //console.log(stoneBeingShot);
      console.log('AimingStart');
      socket.emit('aimingStart', canvasMouseLoc);
      //we clicked near the shooting crosshair
    }
  }

  if (stoneBeingShot != null) {
    console.log('readyForShoot')
    shootingCue = new Cue(canvasX, canvasY)
    //console.log(shootingCue);
    document.getElementById('canvas1').addEventListener('mousemove', handleMouseMove)
    document.getElementById('canvas1').addEventListener('mouseup', handleMouseUp)

  }

  // Stop propagation of the event and stop any default
  //  browser action
  e.stopPropagation()
  e.preventDefault()

  drawCanvas()
}

function handleMouseMove(e) {


  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y

  //console.log("mouse move: " + canvasX + "," + canvasY)

  //  Changed place in A5
  if (shootingCue != null) {
    shootingCue.setCueEnd(canvasX, canvasY)
    //console.log(shootingCue);
    socket.emit('aimingMove', {
      cueTipX: shootingCue.cueTipX,
      cueTipY: shootingCue.cueTipY,
      cueEndX: canvasX,
      cueEndY: canvasY
    });
  }

  e.stopPropagation()

  drawCanvas()
}

function handleMouseUp(e) {
  console.log("shot")
  e.stopPropagation()
  if (shootingCue != null) {
    let cueVelocity = shootingCue.getVelocity()
    //console.log(cueVelocity);
    if (stoneBeingShot != null) stoneBeingShot.addVelocity(cueVelocity)
    shootingCue = null
    shootingQueue.dequeue()

    //  Changed place in A5
    console.log(shootingQueue)
    enableShooting = false //disable shooting until shot stone stops
    socket.emit('startShooting', {cueVelocity});
  }

  //remove mouse move and mouse up handlers but leave mouse down handler
  document.getElementById('canvas1').removeEventListener('mousemove', handleMouseMove)
  document.getElementById('canvas1').removeEventListener('mouseup', handleMouseUp)

  drawCanvas() //redraw the canvas
}
