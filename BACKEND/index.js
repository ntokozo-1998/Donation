const express = require('express');
var cors = require('cors');
require("dotenv").config();
const db = require("./config/db-config");
const app = express();

//impot classes
const routes = require("./routes/routes");

var corsOptions = {
    origin: "*"
  };
  //app.use(cors(corsOptions));


//starting the servers
// app.use(cors());
app.use(express.json());
app.use(cors(corsOptions));
app.listen(8080,() => {console.log('Server running on port 8080');});

if(db)
{
    console.log("Database is connected");
}
app.use('/api', routes)


