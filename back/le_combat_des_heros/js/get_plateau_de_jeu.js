const express = require("express");
const mongodb = require("./dependence").mongodb;
const {url_mongodb,connection_bdd_mongodb_login} = require("./config");
const erreur_get = require("./erreur_get");
const router = express.Router();
router.get("/", erreur_get(async(req,res) => {
    if(req.session.user){
        let client;
        client = await mongodb.connect(url_mongodb,{serverSelectionTimeoutMS:5000});
        const db = client.db(connection_bdd_mongodb_login);
        const documents = await db.collection("collection_partie").find({nom_partie:req.session.nom_partie}).toArray();
        if(!documents.length){// Si nombre de ligne = 0
            return res.redirect("/");
        }
        let numero_joueur;
        const utilisateur=req.session.user.toUpperCase();
        if(documents[0].j1.nom_joueur === req.session.user){
            numero_joueur = 1;
        }else{
            numero_joueur = 2;
        }
        if(documents[0][`j${numero_joueur}`].h1.nom_heros !== ""){
            return res.render("plateau_de_jeu.html",{utilisateur});
        }else{
            return res.redirect("/");
        }
    }else{
        return res.redirect("/");
    }
}));
module.exports = router;