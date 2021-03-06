let Render = function(){

    this.SetupStats();
    this.artGenerator.EnableSlowMode(true);

    // Set up the background
    if(this.renderMode !== 'subject')
        this.artGenerator.DrawAtmosphere("#000000");

    // 256px layers
    this.artGenerator.ScaleContext(2);
    this.DrawStarfield();
    this.DrawCelestialBodies();
    
    // 128px layers
    this.artGenerator.ScaleContext(2);
    this.DrawLandscape();
    this.DrawGround();
    
    if(this.renderMode !== 'subject')
        this.artGenerator.DrawAtmosphere(this.colorPalette.atmosphere);
    
    // 64px layers

    // Wings
    this.ProbabilitySelect(
        30,
        .35,
        31,
        [
            ()=>this.DrawBodyPart('batwing', 5, -18, null, true),
            ()=>this.DrawBodyPart('flywing', 0, -15, this.GetTranslucentColor(this.colorPalette.bodSecondary), true),
            ()=>this.DrawBodyPart('butterflywing', 0, -10, this.colorPalette.bodSecondary, true)
        ]
    );

    // Body
    this.DrawBody(this.bodPos.x, this.bodPos.y);

    // Headgear
    this.ProbabilitySelect(
        28,
        .25,
        29,
        [
            ()=>this.DrawBodyPart('antannae', 2, -19, null, true),
            ()=>this.DrawBodyPart('fin', 'y-13', '3|-2', this.colorPalette.bodPrimary, true),
        ]
    );

    // Hair
    this.ProbabilitySelect(
        44,
        .5,
        45,
        [
            ()=>this.DrawBodyPart('hair', -20, -15, this.artGenerator.GetGreyColor(0)),
            ()=>this.DrawBodyPart('hair', -20, -15, this.colorPalette.hair),
            ()=>this.DrawBodyPart('horns', -13, -10, this.colorPalette.hair),
            ()=>this.DrawBodyPart('feathers', -17, -22, this.colorPalette.hair),
        ]
    );

    // Eyes
    this.ProbabilitySelect(
        26,
        1,
        27,
        [
            ()=>this.DrawBodyPart('eyes', -8, 1, null),
            ()=>this.DrawBodyPart('sleepyeyes', -8, 1, this.colorPalette.bodPrimary),
            ()=>this.DrawBodyPart('happyeyes', -10, 3, this.colorPalette.bodPrimary),
            ()=>this.DrawBodyPart('eyes2', -8, 1, null),
            ()=>this.DrawBodyPart('zetaeyes', -11, 3, null),
            ()=>this.DrawBodyPart('eyes3', -8, 1, null),
            ()=>this.DrawBodyPart('angryeyes', -11, 1, null),
            ()=>this.DrawBodyPart('eyes4', -8, 1, null),
            ()=>this.DrawBodyPart('crazyeyes', -8, 0, null),
        ]
    );

    //Legs
    this.ProbabilitySelect(
        22,
        .75,
        23,
        [
            ()=>this.DrawBodyPart('leganthro', 'y', 28, this.colorPalette.bodPrimary, true),
            ()=>this.DrawBodyPart('tentacle', 'y-7', '29|-20', this.colorPalette.bodPrimary, true),
            ()=>this.DrawBodyPart('leginsect', 'y-10', 31, this.colorPalette.bodPrimary, true)
        ]
    );

    //Arms
    this.ProbabilitySelect(
        24,
        .75,
        25,
        [
            ()=>this.DrawBodyPart('flipper', 'y', '12|-0', this.colorPalette.bodPrimary, true),
            ()=>this.DrawBodyPart('armanthro', 'y-20', 17, this.colorPalette.bodPrimary, true),
            ()=>this.DrawBodyPart('pincer', 'y', '10|-13', this.colorPalette.bodPrimary, true),
            ()=>this.DrawBodyPart('armleaf', 'y-18', 16, this.colorPalette.bodPrimary, true),
        ]
    );

    //Telekinesis
    this.ProbabilitySelect(
        32,
        .15,
        33,
        [
            ()=>this.DrawBodyPart('telekinesis', -47, -35, this.colorPalette.tk),
            ()=>this.DrawBodyPart('telepathy', -42, -30, this.colorPalette.tk),
            ()=>this.DrawBodyPart('magic', -60, -40, this.GetTranslucentColor(this.colorPalette.tk))
        ]
    );
}

export default Render;