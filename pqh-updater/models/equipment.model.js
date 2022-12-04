function Equipment(id, name, matk, patk, mcrit, pcrit) {       // Accept name and age in the constructor
    this.id = id;
    this.matk = matk;
    this.patk  = patk;
    this.mcrit = mcrit;
    this.pcrit  = pcrit;
    this.name = name;
    this.enhancematk = 0;
    this.enhancepatk = 0;
    this.enhancemcrit = 0;
    this.enhancepcrit = 0;
}

Equipment.prototype.getPaktCalcByStar = function(star){
    return this.patk + star * this.enhancepatk;
}

Equipment.prototype.getMaktCalcByStar = function(star){
    return this.matk + star * this.enhancematk;
}

Equipment.prototype.getPcritCalcByStar = function(star){
    return this.pcrit + star * this.enhancepcrit;
}

Equipment.prototype.getMcritCalcByStar = function(star){
    return this.mcrit + star * this.enhancemcrit;
}

Equipment.prototype.geEnhanceMatk = function() {
    return this.enhancematk;
}

Equipment.prototype.setEnhanceMatk = function(enhancematk) {
    this.enhancematk = enhancematk;
}

Equipment.prototype.getEnhancePatk = function() {
    return this.enhancepatk;
}

Equipment.prototype.setEnhancePatk = function(enhancepatk) {
    this.enhancepatk = enhancepatk;
}

Equipment.prototype.getEnhancePcrit = function() {
    return this.enhancepcrit;
}

Equipment.prototype.setEnhancePcrit = function(enhancepcrit) {
    this.enhancepcrit = enhancepcrit;
}

Equipment.prototype.getEnhanceMcrit = function() {
    return this.enhancemcrit;
}

Equipment.prototype.setEnhanceMcrit = function(enhancemcrit) {
    this.enhancemcrit = enhancemcrit;
}

Equipment.prototype.getId = function() {
    return this.id;
}

Equipment.prototype.setId = function(id) {
    this.id = id;
}

Equipment.prototype.getMatk = function() {
    return this.matk;
}

Equipment.prototype.setMatk = function(matk) {
    this.matk = matk;
}

Equipment.prototype.getPatk = function() {
    return this.patk;
}

Equipment.prototype.setPatk = function(patk) {
    this.patk = patk;
}

Equipment.prototype.getPcrit = function() {
    return this.pcrit;
}

Equipment.prototype.setPcrit = function(pcrit) {
    this.pcrit = pcrit;
}

Equipment.prototype.getMcrit = function() {
    return this.mcrit;
}

Equipment.prototype.setMcrit = function(mcrit) {
    this.mcrit = mcrit;
}

Equipment.prototype.getName = function() {
    return this.name;
}

Equipment.prototype.setName = function(name) {
    this.name = name;
}

module.exports = Equipment;     // Export the Cat function as it is