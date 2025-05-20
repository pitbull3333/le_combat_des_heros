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
const router = express.Router();
router.post("/",erreur_post(async (req,res) => {
  const heros_selectionne = JSON.parse(req.body.nom_heros_selectionne);
  const emplacement_heros_j1 = [];
  emplacement_heros_j1[0] = 63;
  emplacement_heros_j1[1] = 65;
  emplacement_heros_j1[2] = 66;
  emplacement_heros_j1[3] = 68;
  emplacement_heros_j1[4] = 69;
  emplacement_heros_j1[5] = 71;
  const emplacement_heros_j2 = [];
  emplacement_heros_j2[0] = 8;
  emplacement_heros_j2[1] = 6;
  emplacement_heros_j2[2] = 5;
  emplacement_heros_j2[3] = 3;
  emplacement_heros_j2[4] = 2;
  emplacement_heros_j2[5] = 0;
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
  const emplacement_heros_j = numero_joueur === 1 ? emplacement_heros_j1 : emplacement_heros_j2;
  await db.collection("collection_partie").updateOne({nom_partie:req.body.nom_partie},{$set:{
    [`j${numero_joueur}.h1.nom_heros`]:heros_selectionne[0],
    [`j${numero_joueur}.h2.nom_heros`]:heros_selectionne[1],
    [`j${numero_joueur}.h3.nom_heros`]:heros_selectionne[2],
    [`j${numero_joueur}.h4.nom_heros`]:heros_selectionne[3],
    [`j${numero_joueur}.h5.nom_heros`]:heros_selectionne[4],
    [`j${numero_joueur}.h6.nom_heros`]:heros_selectionne[5],
    [`j${numero_joueur}.h1.emplacement`]:emplacement_heros_j[0],
    [`j${numero_joueur}.h2.emplacement`]:emplacement_heros_j[1],
    [`j${numero_joueur}.h3.emplacement`]:emplacement_heros_j[2],
    [`j${numero_joueur}.h4.emplacement`]:emplacement_heros_j[3],
    [`j${numero_joueur}.h5.emplacement`]:emplacement_heros_j[4],
    [`j${numero_joueur}.h6.emplacement`]:emplacement_heros_j[5]
  }});
  req.session.nom_partie = req.body.nom_partie;
  return res.send({message:"ok"});
}));
module.exports = router;