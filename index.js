const { deserialize } = require('v8');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
var uuids = {};
//envoie le fichier index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

function resetList(){
  //clear uuids json, demande aux clients si ils sont toujours là
  uuids = {};
  io.emit('reset list');
}

io.on('connection', (socket) => {
  resetList();
  socket.on('new name', name_uuid => {
    var name = name_uuid["name"];
    uuids[`${name_uuid["uuid"]}`] = name;
    io.emit('new name', name);
    console.log("uuid update: " + JSON.stringify(uuids));
  });
  socket.on('message', msg => {
//cette condition permet de vérifier si l'utilisateur à bien choisi un nom (si son uuid figure dans la liste serveur)
    if(typeof uuids[msg["uuid"]] != 'undefined') {
//permet de passer de uuid à nom (reçoit un message sous forme uuid,msg et le transforme en nom,msg en le faisant correspondre avec le json 'uuids'
	var msg2 = {"name": uuids[String(msg["uuid"])], "msg": msg["msg"], "class": "namespan"};
	io.emit('message', msg2);
  //renvoie un nouveau json
	console.log("new message: " + JSON.stringify(msg2));
    };
  });
  socket.on('disconnect', (socket) => {
    resetList();
  });
});

http.listen(port, () => {
  console.log(`Site up at port ${port}`);
});
