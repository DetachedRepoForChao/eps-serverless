const jwt = require('jsonwebtoken');

module.exports.verifyJwtToken = (req, res, next) => {
    console.log('verifyJwtToken');
    console.log('req.headers: ' + req.headers);
    var token;
    if ('authorization' in req.headers)
        token = req.headers['authorization'].split(' ')[1];
        console.log('jwtHelper token: ' + token);
    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    else {
        //console.log('test12345');
        jwt.verify(token, process.env.JWT_SECRET,
            (err, decoded) => {
                if (err) {
                    console.log('Token authentication failed.');
                    return res.status(500).send({auth: false, message: 'Token authentication failed.'});
                }
                else {
                    console.log('Success');
                    //console.log('decoded: ' + decoded);
                    //console.log(('decoded.id: ' + decoded.id));
                    //console.log('req.id: ' + req.id);
                    //req._id = decoded._id;
                    console.log(decoded);

                    // Here we're adding fields to req which we're going to PASS THROUGH using the next() function!!!
                    req.id = decoded.id;
                    req.username = decoded.username;
                    req.firstName = decoded.firstName;
                    req.lastName = decoded.lastName;
                    req.position = decoded.position;
                    req.points = decoded.points;
                    req.email = decoded.email;
                    req.departmentId = decoded.departmentId;
                    req.securityRoleId = decoded.securityRoleId;

                    console.log('req.id: ' + req.id);
                    //req.id = decoded.id;
                    next(); // passing the original req (with the added fields) along to the next function in the chain!
                }
            }
        )
    }
}
