"use strict";
const express = require('express');
const config = require('./config');
const DB = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyparser = require('body-parser');

const db = new DB("sqlitedb");
const app = express();
const router = express.Router();

router.use(bodyparser.urlencoded({ extended:false }));
router.use(bodyparser.json());


const allowCrossDomain = function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}

app.use(allowCrossDomain);

router.post('/register', (req, res) => {
    db.insert([
        req.body.name,
        req.body.email,
        bcrypt.hashSync(req.body.password, 8)
    ],
    function (err) {
        if(err){
            return res.status(500).send("There was a problem getting user")
        }
        db.selectByEmail(req.body.email, (err, user) => {
            if (err) {
                return res.status(500).send("Error getting user")
            };
            let token = jwt.sign({ id: user.id }, config.secret, {expiresIn: 86400 // expires in 24 hours 
            });
            res.status(200).send({ auth: true, token: token, user: user});
        });
    });
});

router.post('/register-admin', (req, res) => {
    db.insertAdmin([
        req.body.name,
        req.body.email,
        bcrypt.hashSync(req.body.password, 8),
        1
    ], function(err) {
        if (err) {
            return res.status(500).send("There was a problem registering the user.")
        }
        db.selectByEmail(req.body.email, (err, user) => {
            if (err) {
                return res.status(500).send("There was a problem registering the user.")
            }
            let token = jwt.sign( { id:user.id }, config.secret, { expiresIn: 86400 //expires in 24 h
            });
            res.status(200).send({ auth: true, token: token, user: user });
        });
    });
});


router.post('/login', (req, res) => {
    db.selectByEmail(req.body.email, (err, user) => {
        if (err) {
            return res.status(500).send('Error');
        }
        if (!user) {
            return res.status(404).send('User not found');
        }
        let passwordIsValid = bcrypt.compareSync(req.body.password, user.user_pass);
        if (!passwordIsValid) {
            return res.status(404).send({ auth: false, token: null});
        }
        let token = jwt.sign({ id: user.id}, config.secret, { expiresIn: 86400 //expires in 24
        });
        res.status(200).send({ auth: true, token: token, user: user});
    });
});

app.use(router)
let port = process.env.PORT || 3000;

let server = app.listen(port, function(){
    console.log('Server started on port' + port)
});