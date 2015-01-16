var ClientModel = function(socket, acc) {
  this.socket = socket;
  this.account = acc;
};

var Socket = function singleton(){
  var clientList = [];
  var color = require('colors');

  var isClientExist = function(idClient, newClient) {
    if (clientList.length === 0) {
      clientList.push(newClient);
      return ;
    }

    clientList.forEach(function(currentElement, index, array) {
      if (currentElement.account.id.toString() == idClient.toString()) {
        currentElement.socket = newClient.socket;
        return;
      }
      if (index == array.length - 1) {
        clientList.push(newClient);
        return;
      }
    });
  };

  this.isClientConnected = function(idClient, callbackFunction) {
    clientList.forEach(function(currentElement, index, array) {
      if (currentElement.account.id == idClient) {
        console.log("[FIND SOCKET]".yellow + currentElement.socket);
        callbackFunction(currentElement.socket);
        return ;
      }
    });
  };

  this.addNewClient = function(socket, acc) {
    var newClient = new ClientModel(socket, acc);

    this.getListClient();
    console.log("[SOCKET]:".rainbow + " add new client : ".green + socket.id .red + "  " + acc.id);
    isClientExist(acc.id, newClient);
  };

  this.getListClient = function() {
    console.log("[SOCKET]: ".rainbow + " Display the list of the connected clients:".green);
    clientList.forEach(function(currenElement, index, array) {
      console.log("  | current element : ".green + currenElement.socket.id + " pseudo :".blue + currenElement.account.name);
    });
    return clientList;
  };

  this.removeClientWithClient = function(idClient) {
    console.log("Remove client after deconnection".red);
    clientList.forEach(function(currenElement, index, array) {
      if (currenElement.account.id == idClient) {
        clientList.splice(index, 1);
        return ;
      }
    });
  };
};

Socket.instance = null;

Socket.sharedInstance = function(){
  if (this.instance === null){
    this.instance = new Socket();
  }
  return this.instance;
};

module.exports = Socket.sharedInstance();
