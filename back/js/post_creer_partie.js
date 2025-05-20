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
    //console.log("post_creer_partie.js ok");
    let tableau_verification = [
      { id: "#nom_partie_saissi", message: "Le nom de la partie ne respecte pas les critères demandés.", check: false }
    ];
    // Vérification des données envoyées par l'utilisateur
    const pattern_nom_partie = /^[a-zA-Z0-9]{5,20}$/;
    if (pattern_nom_partie.test(req.body.nom_partie)) tableau_verification[0].check = true;
    // Vérification des erreurs
    const obj_verification_creation_partie = tableau_verification.find((element) => !element.check);
    if (obj_verification_creation_partie !== undefined) {
      return res.send({
        id: obj_verification_creation_partie.id,
        message: obj_verification_creation_partie.message,
        css: "red"
      });
    }
    // Connexion à la base de données
    let client;
    client = await mongodb.connect(url_mongodb, { serverSelectionTimeoutMS: 5000 });
    req.client = client;// Attachez le client à req.client pour la gestion de finally dans erreur.js
    const db = client.db(connection_bdd_mongodb_login);
    // Vérifier si le nom de la partie existe déjà
    const document = await db.collection("collection_partie").findOne({nom_partie:req.body.nom_partie.toLowerCase()});
    if(document){
      return res.send({
        id:"#nom_partie_saissi",
        message:"Ce nom de partie existe déjà",
        css:"red"
      });
    }
    // Insertion d'une nouvelle partie dans la base de données
    const gameData = JSON.parse(contenu_fichier_json_bdd);
    gameData.nom_partie = req.body.nom_partie.toLowerCase();
    gameData.jeton = 0;
    gameData.j1.nom_joueur = req.session.user;
    await db.collection("collection_partie").insertOne(gameData);
    io.emit("update_liste_partie");
    return res.send({message:"La partie est créé",css:"green"});
  }));
  return router;
};