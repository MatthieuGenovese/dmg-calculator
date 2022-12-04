function Unit(id, name, matk, patk, mcrit, pcrit) {       // Accept name and age in the constructor
    this.id = id;
    this.matk = matk;
    this.patk  = patk;
    this.mcrit = mcrit;
    this.pcrit  = pcrit;
    this.name = name;
    /*this.previousMatk = 0;
    this.previousPatk = 0;
    this.previousMcrit = 0;
    this.previousPcrit = 0;*/
    this.rankStatsMap = new Map();
    this.growthMap = new Map();
}
//atk puis matk
Unit.prototype.pushGrowthStats = function(stats) {
    stats.forEach(element => {
        this.growthMap.set(element[0], new Array(element[1],element[2])); 
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



/*Unit.prototype.getPreviousMatk = function() {
    return this.previousMatk;
}

Unit.prototype.setPreviousMatk = function(previousMatk) {
    this.previousMatk = previousMatk;
}

Unit.prototype.getPreviousPatk = function() {
    return this.previousPatk;
}

Unit.prototype.setPreviousPatk = function(previousPatk) {
    this.previousPatk = previousPatk;
}

Unit.prototype.getPreviousPcrit = function() {
    return this.previousPcrit;
}

Unit.prototype.setPreviousPcrit = function(previousPcrit) {
    this.previousPcrit = previousPcrit;
}

Unit.prototype.getPreviousMcrit = function() {
    return this.previousMcrit;
}

Unit.prototype.setPreviousMcrit = function(previousMcrit) {
    this.previousMcrit = previousMcrit;
}*/

Unit.prototype.getName = function() {
    return this.name;
}

Unit.prototype.setName = function(name) {
    this.name = name;
}

Unit.prototype.isMage = function() {
    return this.matk>this.patk;
}

Unit.prototype.calc = function() {
    let dmgValue, critValue;
    if(this.isMage()){
        dmgValue = this.matk;
        critValue = this.mcrit;
    }
    else{
        dmgValue = this.patk;
        critValue = this.pcrit;
    }
    let critChance = (critValue /15 ) * 0.9625
    return ((dmgValue * 2 * critChance) + (dmgValue * (100-critChance)));
}

module.exports = Unit;     // Export the Cat function as it is