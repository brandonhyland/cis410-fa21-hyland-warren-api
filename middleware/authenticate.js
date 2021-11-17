const auth = async(req, res, next)=>{
    console.log("in the middleware", req.header("authorization"));
    next();
}

module.exports = auth;