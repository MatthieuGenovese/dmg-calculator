function UE(id, matk, patk, mcrit, pcrit) {       // Accept name and age in the constructor
    this.id = id;
    this.matk = matk;
    this.patk  = patk;
    this.mcrit = mcrit;
    this.pcrit  = pcrit;
    this.enhancematk = 0;
    this.enhancepatk = 0;
    this.enhancemcrit = 0;
    this.enhancepcrit = 0;
}

module.exports= UE;