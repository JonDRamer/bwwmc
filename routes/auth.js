"use strict";


const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const bcrypt = require('bcryptjs');


router.route('/register')
    .get((req, res) => {
        res.render('auth/register');
    })
    .post((req, res, next) => {
        //Check to see if both email and password were provided
        if (req.body.user.email.trim() && req.body.user.password.trim()) {
            //hash the password the user supplied
            const hash = bcrypt.hashSync(req.body.user.password, 10);
            //Select everything from the users table
            knex('users')
                //Insert the email and the hashed password from the user
                .insert({
                    email: req.body.user.email,
                    password: hash,
                    full_name: req.body.user.full_name,
                    phone: req.body.user.phone,
                    email: req.body.user.email,
                    address: req.body.user.address,
                    city: req.body.user.city,
                    state: req.body.user.state,
                    zip: req.body.user.zip
                })
                //Grab the id from the user that was just added
                .returning('id')
                //Passing the id from the new user to the .then callback function
                .then((id) => {
                    //Select everything from the users table
                    return knex('users')
                        //Limit your selection to the user that was just added
                        .where('id', id[0])
                        //The where clause returns an array so this grabs the first item in the array
                        .first();
                })
                //Passing the user that met the where clause into a callback function
                .then((user) => {
                    //Creating a session for the newly created user
                    req.session.userId = user.id;
                    console.log(req.session.userId);
                    //Redirecting the logged in user to the home page for now
                    res.redirect('/');
                })
                //Error handling
                .catch((err) => {
                    //If there's an error throw the error and then call the next middleware
                    next(new Error(err));
                })
            //If the user doesn't supply an email and a password
        } else {
            //Render the registration page
            res.render('auth/register', {
                //Error to throw if this is the case
                errors: ['Email and password are required']
            });
        }
    });




module.exports = router;
