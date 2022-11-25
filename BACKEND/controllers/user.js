//const bcrypt = require("bcrypt")
const database = require("../config/db-config");
const jwt = require("jsonwebtoken");
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
//const generateAccessToken = require("../auth/generateAccessToken")

const Pool = require('pg').Pool;

const saltRounds = 12;
const db = new Pool({
    user: 'admin',  //Database username
    host: 'localhost',  //Database host
    database: 'Donation', //Database database
    password: 'admin12345', //Database password
    port: 5432//Database port
  });

exports.register = async (req, res)=>{ 

    const { email , password ,name ,surname ,account ,username} = req.body;

    console.log(req.body)

    const sql = 'SELECT * FROM users WHERE email = $1 OR username = $2';
    db.query(sql,[email,username],(err, results)=>{
        //console.log(results)
        if(results.rowCount == 0)
        {
                db.query(
                    'INSERT INTO users (name,surname,email,username,password,account) VALUES ($1,$2,$3,$4,$5,$6) RETURNING user_id',[name,surname,email,username,password,account],
                    (db_err,results) => {
                        if(db_err)
                        {
                            res.status(400).json({message:'Query failed'});
                        }else
                        {
                            res.status(200).json({message: name+' has been registered, Please login'});
                        }
            })
        }else
        {
            res.status(400).json({message:'User already exists, Please login!'});
        }
    });
}

exports.login =  (req, res)=>{
    
    const {username,password} = req.body;
    const sql = 'SELECT * FROM users WHERE email = $1 OR username = $1';
    db.query(sql,[username],(err, results)=>{
        if(err) 
        {res.status(400).json({message: "Error communicating with database"})}
        else{
            if(results.rowCount == 0)
            {
                res.status(400).json({message: "User does not exist, Please register"})
            }else{
                    if(password != results.rows[0].password)
                    {
                        res.status(400).json({message: "Invalid Credentials, Please try again"});

                    }else
                    {
                        const token = jwt.sign({
                                user_id: results.rows[0].user_id,
                                email: results.rows[0].email,
                                username: results.rows[0].username,
                                name: results.rows[0].name,
                                surname: results.rows[0].surname,
                                account: results.rows[0].account,
                                password: results.rows[0].password,
                            },
                            "process.env.SECRET_KEY",{
                                algorithm: 'HS256',
                                expiresIn: 120
                            });
                            res.status(200).json({message: "Welcome! "+results.rows[0].name,token: token,}); 
                   }
                 
                    
                }

            

        }

    })  
}

exports.getOneUser = (req, res) => {

    const user_id = req.params.user_id;

    const sql = 'SELECT * FROM users WHERE user_id = $1';
    db.query(sql,[user_id],(err, results)=>{
        if(err) { res.status(400).json({message:'Query failed'}) }else{
            res.status(200).json(results.rows[0]);
        }
    })
}


exports.updateUser = async (req, res)=>{
   
    const user_id = req.params.user_id;
    const { password ,name ,surname, username} = req.body;
  
    db.query(
      'UPDATE users SET password = $1 ,name = $2, surname = $3, username = $4 WHERE user_id = $5',
        [password ,name ,surname ,username , user_id],
       (error,results) => {
        if (error) {
            res.status(400).json({message:'Query failed'});
        }else {res.status(200).json({message:'Your profile was updated successfully'});}
    
      })
}
