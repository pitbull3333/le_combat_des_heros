const {MongoNetworkError,MongoServerSelectionError} = require("./dependence");
const erreur_socket = (fn,socket) => {
  return async (data,callback) => {
    let client;
    try {
      client = await fn(data,callback);
    }catch (err){
      if(err instanceof MongoNetworkError || err instanceof MongoServerSelectionError){
        console.log("Impossible de se connecter à la base de données.");
        socket.emit("liste_partie",{liste_partie:"",erreur:"Impossible de se connecter à la base de données."});
      }else{
        console.log("Une erreur interne est survenue.");
        socket.emit("liste_partie",{liste_partie:"",erreur:"Une erreur interne est survenue."});
      }
    } finally {
      if(client){
        try{
          if(client.topology?.isConnected()){
            //console.log("Clôture de la connexion bdd");
            await client.close();
          }else{
            //console.log("Connexion à la bdd déjà fermée ou invalide.");
          }
        }catch (closeErr) {
          console.log("Erreur lors de la fermeture de la connexion à la bdd");
        }
      }
    }
  };
};
module.exports = erreur_socket;