const express = require('express');

const app = express(); 


//arg 1 = port number, arg 2 is function we want to run
app.listen(5000, ()=> {console.log(`app is running on port 5000`)});

// arg 1 = route/endpoint arg 2 = function we want to run
app.get("/hi",(req, res)=>{res.send("Hello World")});

app.get("/", (req, res)=>{res.send("Api is Running")});

// app.post();
// app.put();
