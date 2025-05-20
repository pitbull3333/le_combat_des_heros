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
  //console.log("post_connecte.js ok");
  let tableau_verification=[
    {id:"#input_text_captcha",message:"Le captcha est périmé et il a été renouvelé veuillez le resaisir.",check:false},
    {id:"#input_text_captcha",message:"Le captcha saisi n'est pas valide il à été renouvelé veuillez le resaisir.",check:false}
  ];
  if(req.session && req.session.captcha){
    tableau_verification[0].check=true;
    if(req.session.captcha.text.toLowerCase()==req.body.captcha.toLowerCase()){
      tableau_verification[1].check=true;
    }
  }
  // Génération d'un nouveau captcha
  captcha=svgCaptcha.create(option_captcha);
  req.session.captcha=captcha;
  const obj_verification_connexion=tableau_verification.find((element)=>{
    return element.check==false;
  });
  if(obj_verification_connexion!==undefined){
    return res.send({id:obj_verification_connexion.id,message:obj_verification_connexion.message,captcha:req.session.captcha.data});
  }else{
    let client;
    client = await mongodb.connect(url_mongodb,{serverSelectionTimeoutMS:5000});
    req.client = client;// Attachez le client à req.client pour la gestion de finally dans erreur.js
    const db=client.db(connection_bdd_mongodb_login);
    const documents = await db.collection("collection_login").find({login:req.body.user.toLowerCase()}).toArray();
    if(documents.length === 0){
       return res.send({ id:"#input_text_login_connecter",message:"Login invalide.",captcha:req.session.captcha.data});
    }
    const passwordMatches = await bcrypt.compare(req.body.password, documents[0].password);
    if (passwordMatches) {
      req.session.user = req.body.user;
      return res.send({message:"ok"});
    }else{
       return res.send({id:"#input_text_password_connecter",message:"Mot de passe invalide.",captcha:req.session.captcha.data});
    }
  }
}));
module.exports = router;