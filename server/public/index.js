const box1 = document.getElementById("message_box");

const btnsend = document.getElementById("btnsend");
const sendtxt = document.getElementById("sendtxt");
const btnsendfile = document.getElementById("btnsendfile");

const sendtextfile = document.getElementById("sendtxtfile");
const socket = io("http://localhost:5000");
const btnid = document.getElementById("btnid");
console.log(btnid);
const userid = btnid.innerText.toString();
console.log(userid);

var gooffline = document.getElementById("gooffline");
console.log(gooffline);
gooffline.addEventListener("click", (e) => {
  socket.disconnect();
});

socket.on("message", (data) => {
  console.log("received message");
  console.log(data);
  const senderid = data.senderid;
  const message = data.message;
  console.log(senderid);
  console.log(message);
  messagereceived(message);
});

socket.on("connect", function () {
  socket.emit("storeuser", { userid });
});

console.log("hello");

var messagesend = (msg) => {
  const node = document.createElement("p");
  node.classList.add("msgreceived");
  const textnode = document.createTextNode(msg);
  node.appendChild(textnode);
  box1.appendChild(node);
};

var messagereceived = (msg) => {
  const node = document.createElement("p");
  node.classList.add("msgsend");
  const textnode = document.createTextNode(msg);
  node.appendChild(textnode);
  box1.appendChild(node);
};
btnsend.addEventListener("click", (e) => {
  messagesend(sendtxt.value);
  const rid = document.getElementById("btnridid").innerText.toString();
  console.log("rid->");
  console.log(rid);
  const data = {
    receiverid: rid,
    message: sendtxt.value,
  };
  socket.emit("get_message", data);
});

btnsendfile.addEventListener("click", (e) => {
  socket.emit("file_message", data);
});

btnsendfile.addEventListener("click", (e) => {
  const rid = document.getElementById("btnridid").innerText.toString();
  var file = document.getElementById("myfile").file[0];
  const data = {
    receiverid: rid,
    file: file,
  };
  socket.emit("media_upload", data);
});
socket.on("media_received", (data) => {});
