require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
//require('dotenv').config();
const port = process.env.PORT;
const url_mongodb = process.env.DB_URL;
const connection_bdd_mongodb_login = process.env.DATABASE_URL;
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