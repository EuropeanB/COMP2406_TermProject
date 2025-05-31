//  Changed place in A5
//  Code deleted

function handleJoinAsHomeButton(){
  console.log(`handleJoinAsHomeButton()`)
  let btn = document.getElementById("JoinAsHomeButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"
  if(!isHomePlayerAssigned){
    isHomePlayerAssigned = true
    isHomeClient = true
  }
  //  Changed place in A5
  socket.emit('playerJoin', { role: 'home' });

}
function handleJoinAsVisitorButton(){
  console.log(`handleJoinAsVisitorButton()`)
  let btn = document.getElementById("JoinAsVisitorButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"

  if(!isVisitorPlayerAssigned) {
    isVisitorPlayerAssigned = true
    isVisitorClient = true
  }
  //  Changed place in A5
  socket.emit('playerJoin', { role: 'visitor' });
}

function handleJoinAsSpectatorButton(){
  console.log(`handleJoinAsSpectatorButton()`)
  let btn = document.getElementById("JoinAsSpectatorButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"

  if(!isSpectatorClient) isSpectatorClient = true
  //  Changed place in A5
  socket.emit('playerJoin', { role: 'spectator' });
}
