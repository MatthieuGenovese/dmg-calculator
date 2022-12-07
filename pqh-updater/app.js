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
const Unit = require('./models/unit.model');
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
    maxRank = data.fullUnitMap.get('100801').rankStatsMap.size;
});

app.listen(port, () => {
    console.log(`Server listen on port ${port}`);

});
router.post('/api', (req, res) => {
    res.render('calculate.ejs',{value: req.body.unitId});
});

router.post('/unit_change', (req, res) => {
    res.send(""+data.fullUnitMap.get(req.body.id).growthMap.size);
});

router.post('/unit_id', (req, res) => {
    console.log(req.body);
    let id = req.body.id;
    let unit = data.fullUnitMap.get(id);
    let unitCopy = new Unit(0,"",0,0,0,0);
    unitCopy = Object.assign(unitCopy, unit);
    let resultat = unitCopy.calc(req.body.level, 
        req.body.star, 
        req.body.rank,
        req.body.gear1,
        req.body.gear2,
        req.body.gear3,
        req.body.gear4,
        req.body.gear5,
        req.body.gear6,
    );
    console.log(unitCopy.rankStatsMap);
    /*Supreme Lightwyrm's Sword 1-1
    Noble Soul Rose 1-5
    Wharfblade Aqua Ruler 1-2
    Scarletwyrm's Flame Ring 1-4
    Peony Flamepin 1-3
    1-6
    1-1
    1-5
    1-2
    1-4
    1-3*/
    res.send(resultat+"");
});

router.get('/', function (req, res) {
    res.render('index.ejs', {
        dropdownVals: data.fullUnitMap,
        rank: maxRank
    });
});
app.use('/', router);