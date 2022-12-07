function Unit(id, name, matk, patk, mcrit, pcrit) {       // Accept name and age in the constructor
    this.id = id;
    this.matk = matk;
    this.patk  = patk;
    this.mcrit = mcrit;
    this.pcrit  = pcrit;
    this.name = name;
    this.rankStatsMap = new Map();
    this.growthMap = new Map();
}
//atk puis matk
Unit.prototype.pushGrowthStats = function(stats) {
    stats.forEach(element => {
        this.growthMap.set(''+element[0], new Array(element[1],element[2])); 
    });
}

Unit.prototype.getGrowthStats = function(star) {
    return this.growthMap.get(star);
}

Unit.prototype.pushRankStats = function(rank, stats) {
    this.rankStatsMap.set(rank, stats);
}

Unit.prototype.getRankStats = function(rank) {
    return this.rankStatsMap.get(rank);
}


Unit.prototype.getId = function() {
    return this.id;
}

Unit.prototype.setId = function(id) {
    this.id = id;
}

Unit.prototype.getMatk = function() {
    return this.matk;
}

Unit.prototype.setMatk = function(matk) {
    this.matk = matk;
}

Unit.prototype.getPatk = function() {
    return this.patk;
}

Unit.prototype.setPatk = function(patk) {
    this.patk = patk;
}

Unit.prototype.getPcrit = function() {
    return this.pcrit;
}

Unit.prototype.setPcrit = function(pcrit) {
    this.pcrit = pcrit;
}

Unit.prototype.getMcrit = function() {
    return this.mcrit;
}

Unit.prototype.setMcrit = function(mcrit) {
    this.mcrit = mcrit;
}


Unit.prototype.getName = function() {
    return this.name;
}

Unit.prototype.setName = function(name) {
    this.name = name;
}

Unit.prototype.isMage = function() {
    return this.matk>this.patk;
}

Unit.prototype.calc = function(level, star, rank, gear1, gear2, gear3, gear4, gear5, gear6) {
    let dmgValue, critValue;
    this.patk = this.patk + level * this.getGrowthStats(star)[0];
    this.matk = this.matk + level * this.getGrowthStats(star)[1];
    for(var i=1; i<=rank; i++){
        let tmpGearArray = this.getRankStats(i);
        for(var j =0; j<tmpGearArray.length; j++){
            this.patk = this.patk + tmpGearArray[j].patk;
            this.matk = this.matk + tmpGearArray[j].matk;
            this.mcrit = this.mcrit + tmpGearArray[j].mcrit;
            this.pcrit = this.pcrit + tmpGearArray[j].pcrit;
        }
    }
    if(this.isMage()){
        dmgValue = this.matk;
        critValue = this.mcrit;
    }
    else{
        dmgValue = this.patk;
        critValue = this.pcrit;
    }
    let critChance = (critValue /15 ) * 0.9625;
    //console.log(this.rankStatsMap);
    console.log("mcrit " + this.mcrit);
    console.log("pcrit " +this.pcrit);
    console.log("matk " + this.matk);
    console.log("patk " + this.patk);
    console.log("dmg value " + dmgValue);
    console.log("crit value " + critValue);
    console.log("crit chance " + critChance);
    return ((dmgValue * 2 * critChance) + (dmgValue * (100-critChance)));
}

module.exports = Unit;     // Export the Cat function as it is