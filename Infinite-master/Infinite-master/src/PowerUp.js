var PowerUp = cc.Class.extend({
    gameLayer: null,
    sprite: null,
    shape: null,
    ctor: function (gameLayer, posicion, tipo) {
        this.gameLayer = gameLayer;

        // Crear animación
        var framesAnimacion = [];
        for (var i = 1; i <= 9; i++) {
            var str = "PowerUp_0" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacion.push(frame);
        }
        var animacion = new cc.Animation(framesAnimacion, 0.2);
        var actionAnimacionBucle =
            new cc.RepeatForever(new cc.Animate(animacion));

        // Crear Sprite - Cuerpo y forma
        this.sprite = new cc.PhysicsSprite("#PowerUp_01.png");
        // Cuerpo estática, no le afectan las fuerzas
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

        // forma
        this.shape.setCollisionType(tipoPowerUp);
        // Nunca genera colisiones reales, es como un “fantasma”
        //this.shape.setSensor(true);
        // ejecutar la animación
        this.sprite.runAction(actionAnimacionBucle);
    }, eliminar: function () {
        // quita la forma
        this.gameLayer.space.removeShape(this.shape);

        // quita el cuerpo *opcional, funciona igual
        // NO: es un cuerpo estático, no lo añadimos, no se puede quitar.
        // this.gameLayer.space.removeBody(shape.getBody());

        // quita el sprite
        this.gameLayer.removeChild(this.sprite);
    }
});