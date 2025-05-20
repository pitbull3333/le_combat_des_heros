const {
  express,
  session,
  svgCaptcha,
  bcrypt,
  mongodb,
  MongoNetworkError,
  MongoServerSelectionError,
  fs,
  bodyParser,
  Server,
  sharedSession
} = require('./js/dependence');
const {
  option_captcha,
  url_mongodb,
  connection_bdd_mongodb_login,
  port
} = require("./js/config");
var app=express();
app.use(bodyParser.urlencoded({extended:false}));// extended:true pour prendre en charge les sous-objet
app.set("views", __dirname+"/html");
app.use(express.static("css"));
app.use(express.static("images"));
app.use(express.static("plugins"));
app.engine("html",require("ejs").renderFile);
app.engine("css",require("ejs").renderFile);
app.engine("ico",require("ejs").renderFile);
app.engine("js",require("ejs").renderFile);
app.use(express.json()); // Pour analyser les requêtes avec du JSON
app.use(express.urlencoded({ extended: true }));// Pour analyser les requêtes de type formulaire
const sessionMiddleware = session({
    secret: "mon_secret",
    resave: false,
    saveUninitialized:false,
    cookie: {secure:false}// ATTENTTION !!! mettre `secure: true` si le site est en https
});
app.use(sessionMiddleware);
// Ecoute du serveur
const serveur = app.listen(port,(err)=>{
  if(err){
    console.log("Le serveur n'a pas pu démarrer");
  } else{
    console.log("Le serveur est en écoute sur le port " + port);
  }
});
const io = new Server(serveur);
io.use(sharedSession(sessionMiddleware,{autoSave:false}));
// Configure les routes.
const route_get_selection_hero = require("./js/get_selection_hero");
const route_get_plateau_de_jeu = require("./js/get_plateau_de_jeu");
const route_post_connecte = require("./js/post_connecte");
const route_post_creer_compte = require("./js/post_creer_compte");
const route_post_creer_partie = require("./js/post_creer_partie")(io);
const route_post_rejoindre_partie = require("./js/post_rejoindre_partie")(io);
const route_post_heros_selectionne = require("./js/post_heros_selectionne");
const route_post_fin_du_tour = require("./js/post_fin_du_tour")(io);
app.use("/selection_hero",route_get_selection_hero);
app.use("/plateau_de_jeu",route_get_plateau_de_jeu);
app.use("/connecte",route_post_connecte);
app.use("/creer_compte",route_post_creer_compte);
app.use("/creer_partie",route_post_creer_partie);
app.use("/rejoindre_partie",route_post_rejoindre_partie);
app.use("/heros_selectionne",route_post_heros_selectionne);
app.use("/fin_du_tour",route_post_fin_du_tour);
// Lecture des fichiers de données
const chemin_fichier_html_liste_partie = "./data/html_liste_partie.html";
const chemin_fichier_json_bdd = "./data/bdd.json";
const chemin_fichier_json_heros = "./data/heros.json";
const chemin_fichier_html_tableau_plateau_de_jeu = "./data/html_tableau_plateau_de_jeu.html";
try {
  contenu_fichier_html_liste_partie = fs.readFileSync(chemin_fichier_html_liste_partie,"utf8");
  contenu_fichier_json_bdd = fs.readFileSync(chemin_fichier_json_bdd,"utf8");
  contenu_fichier_json_heros = fs.readFileSync(chemin_fichier_json_heros,"utf8");
  contenu_fichier_html_tableau_plateau_de_jeu = fs.readFileSync(chemin_fichier_html_tableau_plateau_de_jeu,"utf8");
  //console.log("Tout les fichier on été chargé avec succès.");
}catch(err){
  console.error("Erreur lors de la lecture du fichier :");
}
// Créer les différente réponce au action demmander par les client
app.get("/",(req,res)=>{
  captcha=svgCaptcha.create(option_captcha);
  req.session.captcha=captcha;
  res.render("index.html");
})
app.get("/page_accueil",(req,res)=>{
  if(req.session.user){
    const utilisateur=req.session.user.toUpperCase();
    res.render("page_accueil.html",{utilisateur});
  } else {
    res.redirect("/");
  }
})
app.post("/captcha",(req,res)=>{
  captcha=svgCaptcha.create(option_captcha);
  req.session.captcha=captcha;
  res.send(req.session.captcha.data);
})
app.post("/log_out",(req,res)=>{
  req.session.destroy(()=>{
    res.send();
  })
})
app.post("/retour_accueil",(req,res)=>{
  const utilisateur=req.session.user.toUpperCase();
  res.render("page_accueil.html",{utilisateur});
})
io.on("connection",(socket) => {
  //console.log("Un utilisateur est connecté via socket.io");
  if(socket.handshake.session.user){
    require("./js/socket_liste_partie")(mongodb,url_mongodb,connection_bdd_mongodb_login,contenu_fichier_html_liste_partie,socket);
    require("./js/socket_mise_a_jour_partie")(mongodb,url_mongodb,connection_bdd_mongodb_login,contenu_fichier_html_tableau_plateau_de_jeu,socket);
  }
})