var Boss = cc.Class.extend({
    direccion: "derecha",
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function (gameLayer, posicion) {
        this.gameLayer = gameLayer;


        // Crear animación
        var framesAnimacion = [];
        for (var i = 1; i <= 8; i++) {
            var str = "champiñon_0" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacion.push(frame);
        }
        var animacion = new cc.Animation(framesAnimacion, 0.2);
        var actionAnimacionBucle =
            new cc.RepeatForever(new cc.Animate(animacion));

        // Crear Sprite - Cuerpo y forma
        this.sprite = new cc.PhysicsSprite("#champiñon_01.png");
        // Cuerpo estática , no le afectan las fuerzas
        // Cuerpo dinámico, SI le afectan las fuerzas
        this.body = new cp.Body(5, cp.momentForBox(1,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height));

        this.body.setPos(posicion);
        this.body.setAngle(0);
        this.sprite.setBody(this.body);
        // Se añade el cuerpo al espacio
        gameLayer.space.addBody(this.body);

        // forma
        this.shape = new cp.BoxShape(this.body,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height);
        this.shape.setCollisionType(tipoEnemigo);
        // agregar forma dinamica
        gameLayer.space.addShape(this.shape);
        // añadir sprite a la capa

        // ejecutar la animación
        this.sprite.runAction(actionAnimacionBucle);

        gameLayer.addChild(this.sprite,10);
    }, update:function (dt, jugadorX) {

        if (this.direccion = "derecha") {
            if (this.body.vx == 0) {
                this.direccion = "izquierda";
            }
            if (this.body.vx > 400){
                this.body.vx = 400;
            }
            if (this.body.vx < 150) {
                this.body.applyImpulse(cp.v(400, 0), cp.v(0, 0));
                this.body.setAngle(0);
            }
        }

        if (this.direccion = "izquierda") {
            if (this.body.vx == 0) {
                this.direccion = "derecha";
            }
            if (this.body.vx < -400){
                this.body.vx = -400;
            }
            if (this.body.vx > -150) {
                this.body.applyImpulse(cp.v(-400, 0), cp.v(0, 0));
                this.body.setAngle(0);
            }
        }
        // Invertir o no sprite en funcion de la velocidad / orientación
        if(this.body.getVel().x > 0){
            this.sprite.flippedX = true;
        } else {
            this.sprite.flippedX = false;
        }
    }, girar:function(){
        var impulsoX = 200 - Math.floor(Math.random() * 400);
        // - 600 a 600.
        //var impulsoY = 800 + Math.floor(Math.random() * 1200);
        // 800 a 2000.
        var impulsoY = 0;
        this.body.applyImpulse(cp.v(-impulsoX, impulsoY), cp.v(0, 0));
    }, eliminar: function (){
        // quita la forma
        this.gameLayer.space.removeShape(this.shape);

        this.gameLayer.removeChild(this.sprite);
    }
});

