console.log("Début du test");

try {
    const actualiteRoutes = require("./routes/actualiteRoutes");
    console.log("actualiteRoutes chargé avec succès !");
    console.log("Type :", typeof actualiteRoutes);
} catch (error) {
    console.log("ERREUR lors du chargement :");
    console.log(error);
}

console.log("Fin du test");