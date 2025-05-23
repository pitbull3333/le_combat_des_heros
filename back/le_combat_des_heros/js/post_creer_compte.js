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
  //console.log("post_creer_compte.js ok");
  let tableau_verification = [
    { id: "#input_text_login_creer_compte", message: "Le login ne respecte pas les critères demandés.", check: false },
    { id: "#input_text_password_creer_compte", message: "Le mot de passe ne respecte pas les critères demandés.", check: false },
    { id: "#input_text_confirme_password_creer_compte", message: "Le mot de passe confirmé n'est pas égal au mot de passe.", check: false },
    { id: "#input_text_email_creer_compte", message: "Le format de l'adresse mail n'est pas valide.", check: false },
    { id: "#input_text_captcha", message: "Le captcha est périmé et il a été renouvelé veuillez le resaisir.", check: false },
    { id: "#input_text_captcha", message: "Le captcha saisi n'est pas valide, il a été renouvelé veuillez le resaisir.", check: false }
  ];
  // Vérification des données envoyées par l'utilisateur
  const pattern_login = /^[a-zA-Z0-9]{5,20}$/;
  if (pattern_login.test(req.body.user)) tableau_verification[0].check = true;
  const pattern_password = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&._-]{10,}$/;
  if (pattern_password.test(req.body.password)) tableau_verification[1].check = true;
  if (req.body.password === req.body.confirme_password) tableau_verification[2].check = true;
  const pattern_email = /^[a-zA-Z0-9._-]+@.+\..+$/;
  if (pattern_email.test(req.body.email)) tableau_verification[3].check = true;
  if (req.session && req.session.captcha) {
    tableau_verification[4].check = true;
    if (req.session.captcha.text.toLowerCase() === req.body.captcha.toLowerCase()) tableau_verification[5].check = true;
  }
  // Génération d'un nouveau captcha
  captcha = svgCaptcha.create(option_captcha);
  req.session.captcha = captcha;
  // Vérification des erreurs
  const obj_verification_creation_compte = tableau_verification.find((element) => !element.check);
  if (obj_verification_creation_compte !== undefined) {
    return res.send({
      id: obj_verification_creation_compte.id,
      message: obj_verification_creation_compte.message,
      captcha: req.session.captcha.data,
      css: "red"
    });
  }
  // Connexion à la base de données
  let client;
  client = await mongodb.connect(url_mongodb, { serverSelectionTimeoutMS: 5000 });
  const db = client.db(connection_bdd_mongodb_login);
  // Vérifier si le login ou l'email existe déjà
  const documents = await db.collection("collection_login").find({$or:[{login:req.body.user.toLowerCase()},{email:req.body.email.toLowerCase()}]}).toArray();
  if(documents.length > 0){
    if (documents[0].email === req.body.email.toLowerCase()) {
      return res.send({
        id: "#input_text_email_creer_compte",
        message: "Cet email existe déjà",
        captcha: req.session.captcha.data,
        css: "red"
      });
    } else {
      return res.send({
        id: "#input_text_login_creer_compte",
        message: "Ce login existe déjà",
        captcha: req.session.captcha.data,
        css: "red"
      });
    }
  }
  // Hachage du mot de passe
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  // Insertion du nouveau compte dans la base de données
  await db.collection("collection_login").insertOne({
    login: req.body.user.toLowerCase(),
    password: hashedPassword,
    email: req.body.email
  });
  return res.send({
    message: "Le compte a été créé",
    captcha: req.session.captcha.data,
    css: "green"
  });
}));
module.exports = router;