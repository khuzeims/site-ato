require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

// ROUTES API
const evenementRoutes = require("./routes/evenementRoutes");
app.use("/api/evenements", evenementRoutes);

const actualiteRoutes = require("./routes/actualiteRoutes");
app.use("/api/actualites", actualiteRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connecté"))
    .catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("API ATO opérationnelle");
});

app.listen(process.env.PORT, () => {
    console.log("Serveur démarré sur le port 5000");
});