document.addEventListener('DOMContentLoaded', function() {
  //This is called after the browswer has loaded the web page

  //add mouse down listener to our canvas object
  document.getElementById('canvas1').addEventListener('mousedown', handleMouseDown)

  //add key handler for the document as a whole, not separate elements.
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  //add button handlers
  //add listener to submit button
  document.getElementById('JoinAsHomeButton').addEventListener('click', handleJoinAsHomeButton)
  document.getElementById('JoinAsVisitorButton').addEventListener('click', handleJoinAsVisitorButton)
  document.getElementById('JoinAsSpectatorButton').addEventListener('click', handleJoinAsSpectatorButton)


  const MILLISECONDS = 5
  timer = setInterval(handleTimer, MILLISECONDS) //animation timer
  //clearTimeout(timer); //to stop timer
  
  //  Changed place in A5
  //  Listening the singal from other players
  let btn = document.getElementById("JoinAsHomeButton")
  btn.disabled = false //enable button
  //btn.style.backgroundColor = HOME_PROMPT_COLOUR
  //btn = document.getElementById("JoinAsVisitorButton")
  //btn.disabled = false //enable button
  //btn.style.backgroundColor= VISITOR_PROMPT_COLOUR
  btn = document.getElementById("JoinAsSpectatorButton")
  btn.disabled = false //enable button
  btn.style.backgroundColor= SPECTATOR_PROMPT_COLOUR

  socket.on('updatePlayerStatus', function(players) {
    const homeBtn = document.getElementById('JoinAsHomeButton');
    const visitorBtn = document.getElementById('JoinAsVisitorButton');
  
    if(players.home) {
      homeBtn.disabled = true;
      homeBtn.style.backgroundColor = "lightgray";
    } else {
      homeBtn.disabled = false;
      homeBtn.style.backgroundColor = HOME_PROMPT_COLOUR; 
    }
  
    if(players.visitor) {
      visitorBtn.disabled = true;
      visitorBtn.style.backgroundColor = "lightgray";
    } else {
      visitorBtn.disabled = false;
      visitorBtn.style.backgroundColor = VISITOR_PROMPT_COLOUR; 
    }
  });

  socket.on('updateGameStatus', function(currentGameStatus){
    //console.log(currentGameStatus);
    allStones.clear();
    shootingQueue.clear();

    currentGameStatus.stonesData.forEach(stoneData => {
      let stone = new Stone(stoneData.x, stoneData.y, stoneData.radius, stoneData.colour);
      stone.setVelocity({vx: stoneData.velocityX, vy: stoneData.velocityY});
      stone.isMoving = stoneData.isMoving;
      allStones.add(stone);
    });
    console.log(allStones);

    currentGameStatus.queueData.forEach(stoneData => {
      let stone = new Stone(stoneData.x, stoneData.y, stoneData.radius, stoneData.colour);
      stone.setVelocity({vx: stoneData.velocityX, vy: stoneData.velocityY});
      stone.isMoving = stoneData.isMoving;
      shootingQueue.enqueue(stone);
    });
    console.log(shootingQueue);
    stageStones();
  });

  socket.on('playerLeft', function(data) {
    if(data.role === 'home') {
      let btn = document.getElementById('JoinAsHomeButton');
      btn.disabled = false;
      btn.style.backgroundColor = HOME_PROMPT_COLOUR;
    } else if(data.role === 'visitor') {
      let btn = document.getElementById('JoinAsVisitorButton');
      btn.disabled = false;
      btn.style.backgroundColor = VISITOR_PROMPT_COLOUR;
    }
  });

  socket.on('playerAimingStart', function(mouseLocation) {
    stoneBeingShot = shootingQueue.front();
    stoneBeingShot.setLocation(mouseLocation);
    //console.log(mouseLocation);
  });

  socket.on('playerAimingMove', function(data) {
    if (!shootingCue) {
      shootingCue = new Cue(data.cueTipX, data.cueTipY);
    }
    shootingCue.setCueEnd(data.cueEndX, data.cueEndY);
    //console.log(shootingCue);
  });

  socket.on('disableShooting', function(data) {
    cueVelocity = data;
    //console.log(data);
    if (shootingCue != null) {
      let cueVelocity = shootingCue.getVelocity()
      if (stoneBeingShot != null) stoneBeingShot.addVelocity(cueVelocity)
      shootingCue = null
      shootingQueue.dequeue()
      enableShooting = false;
    }
    console.log('disableShooting')
  });

  socket.on('enableShooting', function() {
    enableShooting = true;
    //console.log('enableShooting')
  });

  socket.on('regroup', function() {
    stageStones();
  });

  drawCanvas()
})
