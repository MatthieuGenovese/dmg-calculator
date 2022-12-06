//'use strict';
const express = require('express'); 
const path = require('path');// add path module,
const cors = require('cors');
const bodyParser = require('body-parser');
const engine = require('consolidate');
const port = process.env.port || 5000;
const app = express();
var bootstrapService = require("express-bootstrap-service");
var data = require('./service/database-extract');
const { fullUnitMap } = require('./service/database-extract');
var router = express.Router();
var maxRank = 0;
app.set('views', __dirname+ '/views');
// make server object that contain port property and the value for our server.
//app.engine('html', engine.mustache);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bootstrapService.serve);

data.run().then(() => {
    maxRank = data.fullUnitMap.get(100801).rankStatsMap.size;
    //console.log(data.fullUnitMap);
});

app.listen(port, () => {
    console.log(`Server listen on port ${port}`);

});
router.post('/api', (req, res) => {
    console.log(req.body);
    //res.send(req.body.unitId);
    res.render('calculate.ejs',{value: req.body.unitId});
  });

router.post('/unit_id', (req, res) => {
    //console.log(req.body);
    console.log(req.body);
    //let obj = req.body;
    //console.log(req.body.id);
    let id = req.body.id;
    console.log(id);
    console.log(data.fullUnitMap.get(id.valueOf()));
    console.log(data.fullUnitMap.get(100101));
    //console.log(data.fullUnitMap);
    //console.log(data.fullUnitMap.size);
    res.send(req.body);
    //res.render('calculate.ejs',{value: req.body.unitId});
});

router.get('/', function (req, res) {
    res.render('index.ejs', {
        dropdownVals: data.fullUnitMap,
        rank: maxRank
    });
});
app.use('/', router);
/*app.get('*', function(req, res){
    res.render('index.ejs');
  });*/
/*app.get('/', (req,res) =>{
    //console.log(data.unitNameArray);
    res.sendFile(path.resolve(__dirname,'public') + '/index.html');
});*/