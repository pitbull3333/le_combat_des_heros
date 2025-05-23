const erreur_socket = require("./erreur_socket");
module.exports = (mongodb,url_mongodb,connection_bdd_mongodb_login,contenu_fichier_html_tableau_plateau_de_jeu,socket) => {
  socket.on("mise_a_jour_partie",erreur_socket(async (data,callback) => {
      //console.log("socket_mise_a_jour_partie.js ok");
      const client = await mongodb.connect(url_mongodb,{serverSelectionTimeoutMS:5000});
      const db = client.db(connection_bdd_mongodb_login);
      //console.log("nom partie : " + data.partie);
      const documents = await db.collection("collection_partie").find({nom_partie:data.partie}).toArray();
      socket.emit("mise_a_jour_partie",{code_html:contenu_fichier_html_tableau_plateau_de_jeu,data:documents,erreur:""});
    return client;
  },socket));
};