'use strict';
const express = require('express'); 
const path = require('path');// add path module,
const cors = require('cors');
const bodyParser = require('body-parser');
const engine = require('consolidate');
const port = process.env.port || 5000;
const app = express();
var data = require('./service/database-extract');
var router = express.Router();


app.set('views', __dirname+ '/views');
// make server object that contain port property and the value for our server.
//app.engine('html', engine.mustache);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.listen(port, () => {
    console.log(`Server listen on port ${port}`);
});


router.get('/', function (req, res) {
    res.render('index.ejs', {dropdownVals: data.fullUnitMap});
});
app.use('/index', router);
app.get('*', function(req, res){
    res.render('index.html');
  });
/*app.get('/', (req,res) =>{
    //console.log(data.unitNameArray);
    res.sendFile(path.resolve(__dirname,'public') + '/index.html');
});*/