const erreur_socket = require("./erreur_socket");
module.exports = (mongodb,url_mongodb,connection_bdd_mongodb_login,contenu_fichier_html_liste_partie,socket) => {
  socket.on("liste_partie",erreur_socket(async (data,callback) => {
      //console.log("socket_liste_partie.js ok");
      const client = await mongodb.connect(url_mongodb, { serverSelectionTimeoutMS: 5000 });
      const db = client.db(connection_bdd_mongodb_login);
      const documents = await db.collection("collection_partie").find({$or:[{"j1.nom_joueur":socket.handshake.session.user},{"j2.nom_joueur":socket.handshake.session.user},{"j2.nom_joueur":""}]}).toArray();
      socket.emit("liste_partie",{code_html:contenu_fichier_html_liste_partie,liste_partie:documents,erreur:""});
    return client;
  },socket));
};