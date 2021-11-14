const express = require('express');

const db = require('./dbConnectExec.js');

const app = express(); 


//arg 1 = port number, arg 2 is function we want to run
app.listen(5000, ()=> {console.log(`app is running on port 5000`)});

// arg 1 = route/endpoint arg 2 = function we want to run
app.get("/hi",(req, res)=>{res.send("Hello World")});

app.get("/", (req, res)=>{res.send("Api is Running")});

// app.post();
// app.put();

app.get("/movies",(req, res)=>{
    //get movies from database
    db.executeQuery("SELECT * FROM Guide LEFT JOIN Shop ON Shop.ShopPK = Guide.ShopFK")
    .then((theResults)=>{
        res.status(200).send(theResults);
    })
    .catch((myError)=>{
        console.log(myError);
        res.status(500).send();
    })
} )