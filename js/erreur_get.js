const erreur_get = (fn) => {
  return async (req,res,next) => {
    let client;
    try {
      await fn(req,res,next);
    }catch(err){
      if (err?.name === "MongoServerSelectionError") {
        return res.send({message:"Erreur avec la base de données."});
      } else {
        //console.log(err);
        return res.send({message:"Une erreur est survenue."});
      }
    }finally{
      if(req.client){
        try{
          if(req.client.topology?.isConnected()){
            //console.log("Clôture de la connexion bdd");
            await req.client.close();
          }else{
            //console.log("Connexion à la bdd déjà fermée ou invalide.");
          }
        }catch (closeErr) {
          console.log("Erreur lors de la fermeture de la connexion à la bdd");
        }
      }
    }
  };
};
module.exports = erreur_get;