const sqlite3 = require('sqlite3').verbose();
var Unit = require('./models/unit.model.js');
var Equipment = require('./models/equipment.model.js');
var unitArrayIds = new Array();
var unitArrayNames = new Array();
var mapUnitGear = new Map();
var gearMap = new Map();
var fullUnitMap = new Map();
var equipmentArray = new Array();
var growthMap = new Map();
var unitBondMap = new Map();



run();
function run() {
    var db  = open_database();
    calc_values(db).then(() => {
        console.log(fullUnitMap);
    })
}


function calc_values(db){
    return new Promise((resolve, reject) => {
        build_arrays_and_map(db).then(() =>{
            for(let i =0; i< unitArrayIds.length; i++){
                let name = unitArrayNames[i];
                let id = unitArrayIds[i];
                let currentUnit = new Unit(id,name,0,0,0,0);
                currentUnit.pushGrowthStats(growthMap.get(id));
                if(mapUnitGear.get(id) !== undefined){
                    let rank = 1;
                    mapUnitGear.get(id).forEach(promoteLevel =>{
                        let gearArray = new Array();
                        promoteLevel.forEach(gear =>{
                            if(gearMap.get(gear) !== undefined){
                                gearArray.push(gearMap.get(gear))                            
                            }
                        })
                        currentUnit.pushRankStats(rank, gearArray);
                        rank++;
                        gearArray = new Array();
                    });
                }
                unitBondMap.get(currentUnit.getId()).forEach(element =>{
                    currentUnit.setPatk(currentUnit.getPatk() + element[0]);
                    currentUnit.setMatk(currentUnit.getMatk() + element[1]);
                    currentUnit.setPcrit(currentUnit.getPcrit() + element[2]);
                    currentUnit.setMcrit(currentUnit.getMcrit() + element[3]);
                })
                fullUnitMap.set(currentUnit.getId(),currentUnit); 
            }
            resolve();
        });
    });
}

function build_arrays_and_map(db){
    return new Promise((resolve, reject) => {
        extract_character(db).then((results) => {
            results.forEach(element => {
                unitArrayIds.push(element.id);
                unitArrayNames.push(element.name);
            });
        }).then(() => {
            build_unit_gear_map(db).then((results) => {
                let tmpUnitArray = new Array();
                results.forEach(element => {
                    let tmpGearArray = new Array();                    
                    tmpGearArray.push(element.slot1);
                    tmpGearArray.push(element.slot2);
                    tmpGearArray.push(element.slot3);
                    tmpGearArray.push(element.slot4);
                    tmpGearArray.push(element.slot5);
                    tmpGearArray.push(element.slot6);
                    tmpUnitArray.push(tmpGearArray);
                    if(tmpUnitArray.length == 15){
                        mapUnitGear.set(element.id, tmpUnitArray);
                        tmpUnitArray = new Array();
                    }                   
                });
            });  
        }).then(() =>{
            extract_gear_value(db).then((results) => {
                results.forEach(element => {
                    let currentEquipment = new Equipment(element.id, element.name, element.matk, element.patk, element.mcrit, element.pcrit);
                    currentEquipment.setEnhanceMcrit(element.enhancemcrit);
                    currentEquipment.setEnhancePcrit(element.enhancepcrit);
                    currentEquipment.setEnhancePatk(element.enhancepatk);
                    currentEquipment.setEnhanceMatk(element.enhancematk);
                    equipmentArray.push(currentEquipment);
                    gearMap.set(element.id, currentEquipment);
                });
            });
        }).then(() => {
            extract_growth_value(db).then((results) =>{
                let tmpArray = new Array();
                for(let i =0; i < results.length; i++){
                    let tmpArray2 = new Array();
                    tmpArray2.push(results[i].rarity);
                    tmpArray2.push(results[i].patkgrowth);
                    tmpArray2.push(results[i].matkgrowth);
                    tmpArray.push(tmpArray2);
                    if(results[i].rarity === 5 && i<=results.length-2 && results[i+1].rarity !== 6){
                        growthMap.set(results[i].id,tmpArray);
                        tmpArray = new Array();
                    }
                    else if(results[i].rarity === 6 ){
                        growthMap.set(results[i].id,tmpArray);
                        tmpArray = new Array();
                    }
                    else if (i == results.length -1){
                        growthMap.set(results[i].id,tmpArray);
                        tmpArray = new Array();
                    }
                }
            })
        }).then(()=>{
            extract_bond_value(db).then((results) =>{
                let tmpArray2 = new Array();
                let currentId = 0;
                for(let i =0; i < results.length; i++){
                    let tmpArray = new Array();
                    if(currentId !== 0 && currentId !== results[i].id){                       
                        unitBondMap.set(currentId,tmpArray2);
                        tmpArray2 = new Array();
                    }
                    if(results[i].st1 === 2){
                        tmpArray.push(results[i].sr1);
                        tmpArray.push(0);
                    }
                    else if(results[i].st1 === 4){
                        tmpArray.push(0);
                        tmpArray.push(results[i].sr1);
                    }
                    else{
                        tmpArray.push(0);
                        tmpArray.push(0);
                    }
                    if(results[i].st2 === 6){
                        tmpArray.push(results[i].sr2);
                        tmpArray.push(0);
                    }
                    else if(results[i].st2 === 7){
                        tmpArray.push(0);
                        tmpArray.push(results[i].sr2);
                    }
                    else{
                        tmpArray.push(0);
                        tmpArray.push(0);
                    }
                    if(results[i].st3 === 6){
                        tmpArray[2] = results[i].sr3;
                    }
                    if(results[i].st3 === 7){
                        tmpArray[3] = results[i].sr3;
                    }
                    tmpArray2.push(tmpArray);
                    if(i === results.length-1){
                        unitBondMap.set(currentId,tmpArray2);
                        tmpArray2 = new Array();
                    }
                    currentId = results[i].id;
                }
                resolve();
            })
        })
    });
}

function extract_gear_value(db){
    return new Promise((resolve, reject) => {
        db.all(`SELECT equipment_data.equipment_id as id,
            equipment_data.equipment_name as name,
            equipment_data.atk as patk,
            equipment_data.magic_str as matk,
            equipment_data.physical_critical as pcrit,
            equipment_data.magic_critical as mcrit,
            equipment_enhance_rate.magic_str as enhancematk,
            equipment_enhance_rate.atk as enhancepatk,
            equipment_enhance_rate.magic_critical as enhancemcrit,
            equipment_enhance_rate.physical_critical as enhancepcrit
            FROM equipment_data
            inner join equipment_enhance_rate on equipment_enhance_rate.equipment_id = equipment_data.equipment_id`, (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            resolve(row);
        });
    });
}

function extract_bond_value(db){
    return new Promise((resolve, reject) => {
        db.all(`select chara_to_unit.unit_id_1 as id,
        chara_story_status.status_type_1 as st1,
        chara_story_status.status_rate_1 as sr1,
        chara_story_status.status_type_2 as st2,
        chara_story_status.status_rate_2 as sr2,
        chara_story_status.status_type_3 as st3,
        chara_story_status.status_rate_3 as sr3,
        chara_story_status.status_type_4 as st4,
        chara_story_status.status_rate_4 as sr4,
        chara_story_status.status_type_5 as st5,
        chara_story_status.status_rate_5 as sr5
        from chara_to_unit,chara_story_status
        where chara_story_status.chara_id_1 == chara_to_unit.chara_id 
        OR chara_story_status.chara_id_2 == chara_to_unit.chara_id 
        OR chara_story_status.chara_id_3 == chara_to_unit.chara_id
        OR chara_story_status.chara_id_4 == chara_to_unit.chara_id
        OR chara_story_status.chara_id_5 == chara_to_unit.chara_id
        OR chara_story_status.chara_id_6 == chara_to_unit.chara_id
        OR chara_story_status.chara_id_7 == chara_to_unit.chara_id
        OR chara_story_status.chara_id_8 == chara_to_unit.chara_id
        OR chara_story_status.chara_id_9 == chara_to_unit.chara_id
        OR chara_story_status.chara_id_10 == chara_to_unit.chara_id;`, (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            resolve(row);
        });
    });
}

function extract_growth_value(db){
    return new Promise((resolve, reject) => {
        db.all(`select distinct unit_rarity.unit_id as id,
		unit_rarity.atk_growth as patkgrowth,
        unit_rarity.magic_str_growth as matkgrowth,
        unit_rarity.rarity as rarity
        from unit_rarity
        inner JOIN unit_profile ON unit_profile.unit_id = unit_rarity.unit_id
		INNER JOIN unit_promotion on unit_promotion.unit_id = unit_rarity.unit_id`, (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            resolve(row);
        });
    });
}

function extract_character(db){
    return new Promise((resolve, reject) => {
        db.serialize(function () {
            db.all(`SELECT distinct unit_data.unit_id as id, unit_data.unit_name as name
            FROM unit_data
            INNER JOIN unit_profile ON unit_profile.unit_id = unit_data.unit_id
            INNER JOIN unit_promotion on unit_promotion.unit_id = unit_data.unit_id`, (err, rows) => {
                if (err) {
                    console.error(err.message);
                }
                resolve(rows);
            });
        });
    });
}

function build_unit_gear_map(db){
    return new Promise((resolve, reject) => {
        db.all(`SELECT unit_promotion.unit_id as id,
            unit_promotion.equip_slot_1 as slot1,
            unit_promotion.equip_slot_2 as slot2,
            unit_promotion.equip_slot_3 as slot3,
            unit_promotion.equip_slot_4 as slot4,
            unit_promotion.equip_slot_5 as slot5,
            unit_promotion.equip_slot_6 as slot6
            FROM unit_promotion
            INNER JOIN unit_profile ON unit_profile.unit_id = unit_promotion.unit_id`, (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            resolve(row);
        });
    });
}
function open_database(){
    var db = new sqlite3.Database('./database/master_en.db', (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Connected to the chinook database.');
    });
    return db;
}





