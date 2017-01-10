var estadoCaminando = 1;
var estadoSaltando = 2;
var estadoDobleSalto = 3;
var formaMini = 1;
var formaGrande = 2;
var formaFuego = 3;

var Jugador;
Jugador = cc.Class.extend({
    tipoJugador: "Jugador",
    estado: estadoCaminando,
    aaSaltar: null,
    aaCaminar: null,
    mSaltar: null,
    mCaminar: null,
    gSaltar: null,
    gCaminar: null,
    fSaltar: null,
    fCaminar: null,
    gameLayer: null,
    sprite: null,
    shape: null,
    body: null,
    vidas: 2,
    usosTurbo: 3,
    tuboTransport: false,
    ctor: function (gameLayer, posicion) {
        this.gameLayer = gameLayer;


        // Crear animación

        //Sprites mario mini
        var framesAnimacion = [];
        for (var i = 1; i <= 3; i++) {
            var str = "mario_mini_caminando" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacion.push(frame);
        }
        var animacion = new cc.Animation(framesAnimacion, 0.2);
        var actionAnimacionBucle =
            new cc.RepeatForever(new cc.Animate(animacion));

        this.mCaminar = actionAnimacionBucle;
        this.mCaminar.retain();


        var framesAnimacionSaltar = [];
        for (var i = 1; i <= 3; i++) {
            var str = "mario_mini_saltando" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacionSaltar.push(frame);
        }
        var animacionSaltar = new cc.Animation(framesAnimacionSaltar, 0.2);
        this.mSaltar = new cc.RepeatForever(new cc.Animate(animacionSaltar));
        this.mSaltar.retain();



        //////////////////////////////////////////
        //Sprites mario grande
        var framesGrande = [];
        for (var i = 1; i <= 3; i++) {
            var str = "mario_grande_caminar" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesGrande.push(frame);
        }
        var animacionGrande = new cc.Animation(framesGrande, 0.2);
        var actionAnimacionGrandeBucle =
            new cc.RepeatForever(new cc.Animate(animacionGrande));

        this.gCaminar = actionAnimacionGrandeBucle;
        this.gCaminar.retain();

        var framesGrandeSaltar = [];
        for (var i = 1; i <= 3; i++) {
            var str = "mario_grande_saltar" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesGrandeSaltar.push(frame);
        }
        var animacionGrandeSaltar = new cc.Animation(framesGrandeSaltar, 0.2);
        this.gSaltar = new cc.RepeatForever(new cc.Animate(animacionGrandeSaltar));
        this.gSaltar.retain();

        ////////////////////////////////////////////
        //Sprites mario fuego
        var framesFuego = [];
        for (var i = 1; i <= 3; i++) {
            var str = "mario_fuego_caminar" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesFuego.push(frame);
        }
        var animacionFuego = new cc.Animation(framesFuego, 0.2);
        var actionAnimacionFuegoBucle =
            new cc.RepeatForever(new cc.Animate(animacionFuego));

        this.fCaminar = actionAnimacionFuegoBucle;
        this.fCaminar.retain();

        var framesFuegoSaltar = [];
        for (var i = 1; i <= 3; i++) {
            var str = "mario_fuego_saltar" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesFuegoSaltar.push(frame);
        }
        var animacionFuegoSaltar = new cc.Animation(framesFuegoSaltar, 0.2);

        this.fSaltar = new cc.RepeatForever(new cc.Animate(animacionFuegoSaltar));
        this.fSaltar.retain();

        ///////////////////////////////////////////////////////////////////////////

        this.aaCaminar = this.gCaminar;
        this.aaCaminar.retain();

        this.aaSaltar = this.gSaltar;
        this.aaSaltar.retain();

        // Crear Sprite - Cuerpo y forma
        this.sprite = new cc.PhysicsSprite("#mario_mini_caminando1.png");
        // Cuerpo dinámico, SI le afectan las fuerzas
        this.body = new cp.Body(5, cp.momentForBox(1,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height));

        this.body.setPos(posicion);
        //body.w_limit = 0.02;
        this.body.setAngle(0);
        this.sprite.setBody(this.body);

        // Se añade el cuerpo al espacio
        gameLayer.space.addBody(this.body);

        // forma 1px más pequeña que la imagen original
        this.shape = new cp.BoxShape(this.body,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height);
        this.shape.setCollisionType(tipoJugador);
        this.shape.setFriction(0.3);
        // forma dinamica
        gameLayer.space.addShape(this.shape);
        // ejecutar la animación
        this.sprite.runAction(actionAnimacionBucle);
        // añadir sprite a la capa
        gameLayer.addChild(this.sprite, 10);
        // Impulso inicial
        this.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));

        this.estado = estadoSaltando;

    }, setAnim: function(){
        if (this.vidas == formaMini){
            this.aaSaltar = this.mSaltar;
            this.aaCaminar = this.mCaminar;
        }
        else if (this.vidas == formaGrande){
            this.aaSaltar = this.gSaltar;
            this.aaCaminar = this.gCaminar;
        }
        else if (this.vidas == formaFuego){
            this.aaSaltar = this.fSaltar;
            this.aaCaminar = this.fCaminar;
        }
        this.sprite.stopAllActions();
        this.sprite.runAction(this.aaCaminar);
    }, saltar: function () {
        // solo salta si está caminando
        if (this.estado == estadoCaminando ||this.estado == estadoSaltando) {
            if (this.estado == estadoSaltando){
                this.estado = estadoDobleSalto;
            }
            else {
                this.estado = estadoSaltando;
            }
            this.body.applyImpulse(cp.v(0, 1800), cp.v(0, 0));
            this.sprite.stopAllActions();
            this.sprite.runAction(this.aaSaltar);
        }
    }, tocaSuelo: function () {
        if (this.estado != estadoCaminando) {
            this.estado = estadoCaminando;
            this.sprite.stopAllActions();
            this.sprite.runAction(this.aaCaminar);
        }
    }, restaVida: function () {
        this.vidas--;
        this.setAnim();
    }, sumaVida: function () {
        if (this.vidas<3) {
            this.vidas++;
            this.setAnim();
        }
    }, turbo: function () {
        //if (this.usosTurbo > 0) {
            this.body.applyImpulse(cp.v(500, 0), cp.v(0, 0));
           // this.usosTurbo--;
        //}
    }
});