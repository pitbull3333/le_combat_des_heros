const {
  express,
  session,
  svgCaptcha,
  bcrypt,
  mongodb,
  bodyParser,
  Server,
} = require('./dependence');
const {
  option_captcha,
  url_mongodb,
  connection_bdd_mongodb_login
} = require("./config");
const erreur_post = require("./erreur_post");
module.exports = (io) => {
  const router = express.Router();
  router.post("/",erreur_post(async(req,res) => {
    //console.log("post_rejoindre_partie.js ok");
    let client;
    client = await mongodb.connect(url_mongodb, { serverSelectionTimeoutMS: 5000 });
    req.client = client;// Attachez le client à req.client pour la gestion de finally dans erreur.js
    const db = client.db(connection_bdd_mongodb_login);
    // Vérifi si le joueur peut rejoindre la partie
    const documents = await db.collection("collection_partie").find({
      $and: [{
        $or:[
          {"j1.nom_joueur":req.session.user},
          {"j2.nom_joueur":req.session.user},
          {"j2.nom_joueur":""}
        ]
      },
        {nom_partie:req.body.nom_partie}
      ]
    }).toArray();
    if(!documents.length){// Si nombre de ligne = 0
      return res.send({message:"Impossible de rejoindre la partie.",css:"red"});
    }
    // Si vérification ok insertion du joueur dans la partie et redirection
    req.session.nom_partie = req.body.nom_partie;
    if(documents[0].j1.nom_joueur === req.session.user || documents[0].j2.nom_joueur === req.session.user){
      const documents_bis = await db.collection("collection_partie").find({nom_partie:req.body.nom_partie}).toArray();
      let numero_joueur;
      if(documents_bis[0].j1.nom_joueur === req.session.user){
        numero_joueur = 1;
      }else{
        numero_joueur = 2;
      }
      if(documents_bis[0][`j${numero_joueur}`].h1.nom_heros !== ""){
        return res.send({message:"plateau_de_jeu"});
      }else{
        return res.send({message:"selection_heros"});
      }
    }else{
      await db.collection("collection_partie").updateOne({nom_partie:documents[0].nom_partie.toLowerCase()},{$set:{"j2.nom_joueur":req.session.user}});
      io.emit("update_liste_partie");
      return res.send({message:"selection_heros"});
    }
  }));
  return router;
};