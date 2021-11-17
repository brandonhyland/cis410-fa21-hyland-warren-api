const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./dbConnectExec.js');
const cors = require("cors");

const rockwellConfig = require("./config.js");

const auth = require("./middleware/authenticate")

const app = express(); 
app.use(express.json());
//azurewebsites.net, colostate.edu

app.use(cors());

const PORT = process.env.PORT || 5000;

//arg 1 = port number, arg 2 is function we want to run
app.listen(PORT, ()=> {console.log(`app is running on port ${PORT}`)});

// arg 1 = route/endpoint arg 2 = function we want to run
app.get("/hi",(req, res)=>{res.send("Hello World")});

app.get("/", (req, res)=>{res.send("Api is Running")});

// app.post();
// app.put();



app.post("/booking", auth,async (req, res)=>{
    try{
        
        let tripFK = req.body.tripFK;
        let guideFK = req.body.guideFK;
        let customerFK = req.body.customerFK;
        let actualPersons = req.body.actualPersons; 


        // not adding Number.isInteger(rating)) as extra field
        if(!customerFK || !tripFK || !actualPersons || !guideFK)
        {return res.status(400).send("this is a bad request")};

        //getting rid of single qoutes in summary - instead we get rid of $ in actual price
        // actualPrice = actualPrice.replace("$", "$ ");
    
        // console.log("here is the guide", req.guide);

        let insertQuery = `insert into Booking(TripFK,GuideFK, CustomerFK, ActualPersons)
        output inserted.BookingPK, inserted.GuideFK, inserted.CustomerFK, inserted.ActualPersons
        values('${tripFK}', '${guideFK}', '${customerFK}', '${actualPersons}');`;

        let insertedBooking = await db.executeQuery(insertQuery);

        // console.log("inserted booking", insertedBooking);

        // res.send("Here is the response");

        res.status(201).send(insertedBooking[0]);
    }
    catch(error){
        console.log("error in post/reviews", error);
        res.status(500).send();
    }
})

app.get("/contacts/me", auth,(req, res)=>{
    res.send(req.guide);
})

app.post("/contacts/login", async (req, res)=>{
    // console.log("/contacts/login called ", req.body)

    //1. Data validation

    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password){
        return res.status(400).send("Bad request")
    }

    //2. Check that user exists in dataabase

    let query = `SELECT * FROM Guide WHERE email = '${email}'`;

    let result;
    try {
    result = await db.executeQuery(query);
    } catch(myError){
      console.log("error in /contacts/login", myError)
      return res.status(500).send();
    }
    // console.log("result", result);
    if(!result[0]){return res.status(401).send("Invalid user credentials");
    }

    //3. Check password

    let user = result[0];

    if (!bcrypt.compareSync(password, user.Password)) {
        return res.status(401).send("Invalid user credentials");
    }

    //4. Generate Token

    let token = jwt.sign({pk: user.GuidePK}, rockwellConfig.JWT, {expiresIn: "60 minutes"});
    console.log("token", token)

    //5 save token in DB and send response

    let setTokenQuery = `UPDATE Guide
    SET token = '${token}'
    WHERE GuidePK = ${user.GuidePK}`;

    try{
        await db.executeQuery(setTokenQuery);

        res.status(200).send({
            token: token,
            user:{
                FirstName: user.FirstName,
                LastName: user.LastName,
                Email: user.Email,
                GuidePK: user.GuidePK
            }
        })
    }  
    catch(myError){
        console.log("Error in setting user token", myError)
        res.send(500).send();
    }    
})             

app.post("/contacts", async (req, res)=>{
    // res.send("/contacts called");
// console.log("request.body", req.body);

    let shopFK = req.body.shopFK;
    let nameFirst = req.body.nameFirst;
    let nameLast = req.body.nameLast;
    let email = req.body.email;
    let password = req.body.password;

    let emailCheckQuery = `SELECT email FROM Guide WHERE email = '${email}'`

    let existingUser = await db.executeQuery(emailCheckQuery);

    // console.log("existing user", existingUser);

    if (existingUser[0]){return res.status(409).send("duplicate email")};

    let hashedPassword = bcrypt.hashSync(password);

    // we need to delete all users with nonhashed password from database!!!!!!!!!!!

    let insertQuery = `insert into Guide(ShopFK, FirstName, LastName, Email, Password)
    values('${shopFK}', '${nameFirst}', '${nameLast}', '${email}', '${hashedPassword}')`;

    db.executeQuery(insertQuery)
    .then(()=>{
        res.status(201).send()})
    .catch((err)=>{
        console.log('error in post /contacts', err);
        res.status(500).send();
    })

})

//if having trouble change /guides to /movies
app.get("/guides",(req, res)=>{
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

app.get("/movies/:pk", (req, res) => {

    let pk = req.params.pk
    console.log(pk);

    let myQuery = `SELECT * FROM Guide
    LEFT JOIN Shop
    ON Shop.ShopPK = Guide.ShopFK
    where GuidePK = ${pk}`

    db.executeQuery(myQuery)
    .then((result)=>{
        console.log("result", result);
        if (result[0]){
            res.send(result[0])
        }
        else{
            res.status(404).send("bad request");
        }
    })
    .catch((err)=>{
        console.log("error in /moives/:pk", err);
        res.status(500).send();
    });
});