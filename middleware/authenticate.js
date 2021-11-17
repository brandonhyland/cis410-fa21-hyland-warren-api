const jwt = require("jsonwebtoken");

const rockwellConfig = require("../config.js")

const db = require("../dbConnectExec.js")

const auth = async(req, res, next)=>{
    // console.log("in the middleware", req.header("authorization"));
    // next();

    try{
        //1. Decode Token

        let myToken = req.header("Authorization").replace("Bearer ","");
        console.log("token", myToken)

        let decoded = jwt.verify(myToken, rockwellConfig.JWT);
        console.log(decoded);

        let guidePK = decoded.pk;

        //2. Compare token w/ whats in the database

        let query = `SELECT GuidePK, FirstName, LastName, Email 
        FROM Guide WHERE GuidePK = ${guidePK} and Token = '${myToken}'`;

        let returnedUser = await db.executeQuery(query);
        console.log("returned user", returnedUser);

        //3. Save user information in request

        if(returnedUser[0]){
          req.guide = returnedUser[0];
          next();
        }else{
            return res.status(401).send("invalid credentials")
        }


    }
    catch(err){
        console.log(err);
        res.status(401).send("Invalid Credenatials")
    }
}

module.exports = auth;  