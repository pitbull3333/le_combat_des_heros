const {
  express,
  session,
  svgCaptcha,
  bcrypt,
  mongodb,
  bodyParser
} = require('./dependence');
const {
  option_captcha,
  url_mongodb,
  connection_bdd_mongodb_login
} = require("./config");
const erreur_post = require("./erreur_post");
module.exports = (io) => {
  const router = express.Router();
  router.post("/",erreur_post(async (req,res) => {
    //console.log("post_fin_du_tour.js ok");
    let client;
    client = await mongodb.connect(url_mongodb, { serverSelectionTimeoutMS: 5000 });
    req.client = client;// Attachez le client à req.client pour la gestion de finally dans erreur.js
    const db = client.db(connection_bdd_mongodb_login);
    const documents = await db.collection("collection_partie").find({nom_partie:req.body.nom_partie}).toArray();
    let numero_joueur;
    if(documents[0].j1.nom_joueur === req.session.user){
      numero_joueur = 1;
    }else{
      numero_joueur = 2;
    }
    req.session.nom_partie = req.body.nom_partie;
    let valeur_jeton = documents[0].jeton;
    if(numero_joueur == documents[0].jeton){
      valeur_jeton = 3 - valeur_jeton;
      await db.collection("collection_partie").updateOne({nom_partie:req.body.nom_partie},{$set:{jeton:valeur_jeton}});
      const documents_bis = await db.collection("collection_partie").find({nom_partie:req.body.nom_partie}).toArray();
      console.log("socket ok");
      socket.emit("mise_a_jour_partie",{code_html:contenu_fichier_html_tableau_plateau_de_jeu,data:documents_bis,erreur:""});
      //return res.send({data:documents});
    }
  }));
  return router;
};