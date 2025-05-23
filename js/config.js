require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
//const port=process.env.PORT || 800;
//if(port==800){
  //connection_bdd_mongodb_login="bdd_le_combat_des_heros_dev";
//}else{
  //if(process.env.environnement=="dev"){
     //connection_bdd_mongodb_login="bdd_le_combat_des_heros_dev";
  //}else{
     //connection_bdd_mongodb_login="bdd_le_combat_des_heros_prod";
  //}
//}
port = process.env.PORT || 8080;
const url_mongodb = process.env.DB_URL;
connection_bdd_mongodb_login = process.env.DATABASE_URL;
const option_captcha={
 size:6,// nombre de caractères dans le captcha
 ignoreChars:"0oOiIlL1",// caractères à ignorer
 noise:5,// niveau de bruit
 color:true,// utilisation de la couleur
 background:"#F6FD8D", // couleur par défault de fond #c96 maron
};
module.exports = {
  option_captcha,
  url_mongodb,
  connection_bdd_mongodb_login,
  port
};