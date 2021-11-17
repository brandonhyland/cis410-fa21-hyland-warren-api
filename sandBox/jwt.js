const jwt = require("jsonwebtoken");

// arg 1 info you want to sign it with , arg 2 is password you will sign it with, arg 3 is paramaters we will specify 
let myToken = jwt.sign({pk: 289234},"secretPassword", {expiresIn: "60 minutes",});
console.log("my token", myToken);

let verificationTest = jwt.verify(myToken, "secretPassword");

console.log("verification Test", verificationTest);