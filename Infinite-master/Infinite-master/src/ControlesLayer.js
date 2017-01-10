var ControlesLayer = cc.Layer.extend({
    spriteBotonSaltar: null,
    spriteBotonTurbo: null,
    spriteBotonDisparo: null,
    etiquetaMonedas: null,
    etiquetaVidas: null,
    teclaIzquierda: true,
    teclaDerecha: true,
    teclaArriba: true,
    teclaBarra: true,
    teclaAbajo: true,
    monedas: 0,
    tiempoDisparar: 0,
    ctor: function () {
        this._super();
        var size = cc.winSize;

        // Contador Monedas
        this.etiquetaMonedas = new cc.LabelTTF("Monedas: 0", "Helvetica", 20);
        this.etiquetaMonedas.setPosition(cc.p(size.width - 90, size.height - 20));
        this.etiquetaMonedas.fillStyle = new cc.Color(0, 0, 0, 0);
        this.addChild(this.etiquetaMonedas);

        // Contador Vidas
        this.etiquetaVidas = new cc.LabelTTF("Vidas: 2", "Helvetica", 20);
        this.etiquetaVidas.setPosition(cc.p(size.width - size.width + 90, size.height - 20));
        this.etiquetaVidas.fillStyle = new cc.Color(0, 0, 0, 0);
        this.addChild(this.etiquetaVidas);

        // BotonSaltar
        this.spriteBotonSaltar = cc.Sprite.create(res.boton_saltar_png);
        this.spriteBotonSaltar.setPosition(
            cc.p(size.width * 0.8, size.height * 0.5));

        this.addChild(this.spriteBotonSaltar);

        // BotonTurbo
        this.spriteBotonTurbo = cc.Sprite.create(res.boton_turbo_png);
        this.spriteBotonTurbo.setPosition(
            cc.p(size.width * 0.8, size.height * 0.8));

        this.addChild(this.spriteBotonTurbo);

        // BotonDisparo
        this.spriteBotonDisparo = cc.Sprite.create(res.boton_disparar_png);
        this.spriteBotonDisparo.setPosition(
            cc.p(size.width * 0.8, size.height * 0.2));

        this.addChild(this.spriteBotonDisparo);

        // Registrar Mouse Down
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown
        }, this)

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: this.teclaPulsada,
            onKeyReleased: this.teclaLevantada
        }, this);

        this.scheduleUpdate();
        return true;
    }, update: function (dt) {

    }, teclaPulsada: function (keyCode, event) {
        var instancia = event.getCurrentTarget();

        // Flecha izquierda
        if (keyCode == 37 && instancia.teclaIzquierda == true) {
            var gameLayer = instancia.getParent().getChildByTag(idCapaJuego);
            gameLayer.jugador.moverIzquierda();
        }
        // Flecha derecha
        if (keyCode == 39 && instancia.teclaDerecha == true) {
            var gameLayer = instancia.getParent().getChildByTag(idCapaJuego);
            gameLayer.jugador.moverDerecha();
        }
        // Flecha arriba
        if (keyCode == 38 && instancia.teclaArriba == true) {
            // Accedemos al padre (Scene), pedimos la capa con la idCapaJuego
            // tenemos el objeto GameLayer
            var gameLayer = instancia.getParent().getChildByTag(idCapaJuego);
            instancia.teclaArriba = false;
            /*if (gameLayer.jugador.tipoJugador=="JugadorPlataformas") {
                gameLayer.jugador.moverArriba();

            } else {*/
                gameLayer.jugador.saltar();
            //}

        }
        //Flecha abajo
        if (keyCode == 40 &&  instancia.teclaAbajo == true) {
            var gameLayer = instancia.getParent().getChildByTag(idCapaJuego);
            gameLayer.jugador.tuboTransport = true;
            instancia.teclaAbajo = false;
        }
        // Barra espaciadora
        if (keyCode == 32 && instancia.teclaBarra == true) {
            instancia.teclaBarra = false;
            var gameLayer = instancia.getParent().getChildByTag(idCapaJuego);
            if (gameLayer.jugador.tipoJugador == "Jugador") {
                if (gameLayer.jugador.vidas == formaFuego) {
                    var disparo = new Disparo(gameLayer.space,
                        cc.p(gameLayer.jugador.body.p.x + 10, gameLayer.jugador.body.p.y + 10),
                        gameLayer, false, "Infinite");
                    disparo.body.vx = 400;
                    disparo.body.vy = 50;
                    gameLayer.disparos.push(disparo);
                }
            }
        }
    }, teclaLevantada: function (keyCode, event) {
        var instancia = event.getCurrentTarget();
        // Flecha izquierda
        if (keyCode == 37) {
            instancia.teclaIzquierda = true;
        }
        // Flecha derecha
        if (keyCode == 39) {
            instancia.teclaDerecha = true;
        }
        // Flecha arriba
        if (keyCode == 38) {
            instancia.teclaArriba = true;
        }
        //Flecha abajo
        if (keyCode == 40) {
            instancia.teclaAbajo = true;
            var gameLayer = instancia.getParent().getChildByTag(idCapaJuego);
            gameLayer.jugador.tuboTransport = false;
        }
        // Barra espaciadora
        if (keyCode == 32) {
            instancia.teclaBarra = true;
        }
    }, procesarMouseDown: function (event) {
        var instancia = event.getCurrentTarget();
        var areaBoton = instancia.spriteBotonSaltar.getBoundingBox();
        var areaTurbo = instancia.spriteBotonTurbo.getBoundingBox();
        var areaDisparo = instancia.spriteBotonDisparo.getBoundingBox();

        // La pulsación cae dentro del botón
        if (cc.rectContainsPoint(areaBoton,
                cc.p(event.getLocationX(), event.getLocationY()))) {

            // Accedemos al padre (Scene), pedimos la capa con la idCapaJuego
            var gameLayer = instancia.getParent().getChildByTag(idCapaJuego);
            // tenemos el objeto GameLayer
            gameLayer.jugador.saltar();
        }
        if (cc.rectContainsPoint(areaTurbo,
                cc.p(event.getLocationX(), event.getLocationY()))) {
            var gameLayer = instancia.getParent().getChildByTag(idCapaJuego);
            gameLayer.jugador.tuboTransport = true;
        }
        if (cc.rectContainsPoint(areaDisparo,
                cc.p(event.getLocationX(), event.getLocationY()))
        //&& new Date().getTime() - instancia.tiempoDisparar > 1000
        ) {
            var gameLayer = instancia.getParent().getChildByTag(idCapaJuego);
            if (gameLayer.jugador.tipoJugador=="Jugador") {
                if (gameLayer.jugador.vidas == formaFuego) {
                    instancia.tiempoDisparar = new Date().getTime();
                    var disparo = new Disparo(gameLayer.space,
                        cc.p(gameLayer.jugador.body.p.x, gameLayer.jugador.body.p.y),
                        gameLayer, false, "Infinite");
                    disparo.body.vx = 600;
                    gameLayer.disparos.push(disparo);
                }
            }
        }
    }, agregarMoneda: function () {
        this.monedas++;
        this.etiquetaMonedas.setString("Monedas: " + this.monedas);

    }, actualizarVidas: function (vidas) {
        this.etiquetaVidas.setString("Vidas: " + vidas);
    }
});

