var tipoSuelo = 1;
var tipoJugador = 2;
var tipoMoneda = 3;
var tipoMuro = 4;
var tipoEnemigo = 5;
var tipoMeta = 6;
var tipoDisparo = 7;
var tipoDisparoEnemigo = 8;
var tipoPincho = 9;
var tipoPowerUp = 10;
var tipoNuevoEnemigo = 11;
var tipoBoss = 12;
var tipoTubo = 12;
var nivelActual = 1;

var GameLayer = cc.Layer.extend({
    _emitter: null,
    tiempoEfecto: 0,
    monedas: [],
    space: null,
    mapa: null,
    mapaAncho: null,
    jugador: null,
    formasEliminar: [],
    disparos: [],
    enemigos: [],
    powerUps: [],
    entradasTubo: [],
    salidasTubo: [],
    bosses: [],
    nuevosEnemigos: [],
    enemigosPinchos: [],
    ctor: function () {
        this._super();
        this.tiempoColision = new Date().getTime();
        var size = cc.winSize;
        cc.spriteFrameCache.addSpriteFrames(res.moneda_plist);
        cc.spriteFrameCache.addSpriteFrames(res.jugador_subiendo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.jugador_avanzando_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacion_cuervo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.disparo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacion_planta_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mario_grande_caminar_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mario_grande_saltar_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mario_fuego_caminar_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mario_fuego_saltar_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mario_mini_caminando_plist);
        cc.spriteFrameCache.addSpriteFrames(res.mario_mini_saltando_plist);
        cc.spriteFrameCache.addSpriteFrames(res.champiñon_plist);
        cc.spriteFrameCache.addSpriteFrames(res.tortuga_plist);
        cc.spriteFrameCache.addSpriteFrames(res.powerup_plist);
        cc.spriteFrameCache.addSpriteFrames(res.boss_plist);

        // Inicializar Space
        this.space = new cp.Space();
        this.space.gravity = cp.v(0, -650);
        // Depuración
        this.depuracion = new cc.PhysicsDebugNode(this.space);
        this.addChild(this.depuracion, 10);

        if (nivelActual % 2 == 0) {
            this.jugador = new JugadorPlataformas(this.space, cc.p(50, 150), this);
        }
        else {
            this.jugador = new Jugador(this, cc.p(50, 150));
        }


        this.cargarMapa();
        this.scheduleUpdate();


        // suelo y jugador
        this.space.addCollisionHandler(tipoSuelo, tipoJugador,
            null, null, this.collisionSueloConJugador.bind(this), null);
        // jugador y moneda
        // IMPORTANTE: Invocamos el método antes de resolver la colisión (realmente no habrá colisión por la propiedad SENSOR de la Moneda).
        this.space.addCollisionHandler(tipoJugador, tipoMoneda,
            null, this.collisionJugadorConMoneda.bind(this), null, null);
        this.space.addCollisionHandler(tipoJugador, tipoPowerUp,
            null, this.collisionJugadorConPowerUP.bind(this), null, null);
        this.space.addCollisionHandler(tipoJugador, tipoEnemigo,
            null, this.collisionJugadorConEnemigo.bind(this), null, null);
        this.space.addCollisionHandler(tipoJugador, tipoBoss,
            null, this.collisionJugadorConBoss.bind(this), null, null);
        this.space.addCollisionHandler(tipoJugador, tipoNuevoEnemigo,
            null, this.collisionJugadorConNuevoEnemigo.bind(this), null, null);
        this.space.addCollisionHandler(tipoJugador, tipoMeta,
            null, this.collisionJugadorConMeta.bind(this), null, null);
        this.space.addCollisionHandler(tipoEnemigo, tipoMuro,
            null, this.collisionEnemigoConMuro.bind(this), null, null);
        this.space.addCollisionHandler(tipoDisparo, tipoEnemigo,
            null, this.colisionDisparoConEnemigo.bind(this), null, null);
        this.space.addCollisionHandler(tipoDisparoEnemigo, tipoJugador,
            null, this.colisionDisparoConJugador.bind(this), null, null);
        this.space.addCollisionHandler(tipoDisparo, tipoSuelo,
            null, this.colisionDisparoConSuelo.bind(this), null, null);
        this.space.addCollisionHandler(tipoDisparoEnemigo, tipoSuelo,
            null, this.colisionDisparoConSuelo.bind(this), null, null);
        this.space.addCollisionHandler(tipoEnemigo, tipoMuro,
            null, this.colisionEnemigoConContencion.bind(this), null, null);
        this.space.addCollisionHandler(tipoJugador, tipoPincho,
            null, this.collisionJugadorConEnemigoPinchos.bind(this), null, null);
        // Declarar emisor de particulas (parado)
        this._emitter = new cc.ParticleGalaxy.create();
        this._emitter.setEmissionRate(0);
        //this._emitter.texture = cc.textureCache.addImage(res.fire_png);
        this._emitter.shapeType = cc.ParticleSystem.STAR_SHAPE;
        this.addChild(this._emitter, 10);


        return true;

    }, update: function (dt) {
        //this.jugador.estado = estadoDobleSalto;
        this.space.step(dt);

        for (var i = 0; i < this.enemigos.length; i++) {
            this.enemigos[i].update(dt, this.jugador.body.p.x);
        }
        // Mover enemigos:
        for (var i = 0; i < this.nuevosEnemigos.length; i++) {
            var enemigo = this.nuevosEnemigos[i];
            enemigo.moverAutomaticamente();
            enemigo.disparar();
        }


        // Control de emisor de partículas
        if (this.tiempoEfecto > 0) {
            this.tiempoEfecto = this.tiempoEfecto - dt;
            this._emitter.x = this.jugador.body.p.x;
            this._emitter.y = this.jugador.body.p.y;

        }
        if (this.tiempoEfecto < 0) {
            this._emitter.setEmissionRate(0);
            this.tiempoEfecto = 0;
        }


        // Controlar el angulo (son radianes) max y min.
        if (this.jugador.body.a > 0.15) {
            this.jugador.body.a = 0.15;
        }
        if (this.jugador.body.a < -0.15) {
            this.jugador.body.a = -0.15;
        }
        var capaControles =
            this.getParent().getChildByTag(idCapaControles);
        // controlar la velocidad X , max y min
        if (nivelActual % 2 == 0) {
            if (this.bosses.length == 0){
                cc.director.pause();
                cc.director.runScene(new GameWinLayer(nivelActual));
            }

        }
        else {
            capaControles.teclaDerecha = false;
            capaControles.teclaIzquierda = false;
            capaControles.teclaAbajo = false;
            if (this.jugador.body.vx < 150) {
                this.jugador.body.applyImpulse(cp.v(200, 0), cp.v(0, 0));
                this.jugador.body.setAngle(0);
            }
        }
        if (this.jugador.body.vx > 250) {
            this.jugador.body.vx = 250;
        }
        // controlar la velocidad Y , max
        if (this.jugador.body.vy > 400) {
            this.jugador.body.vy = 400;
        }

        // Ampliacion Scroll eje Y
        var posicionXCamara = this.jugador.body.p.x - this.getContentSize().width / 2;
        var posicionYCamara = this.jugador.body.p.y - this.getContentSize().height / 2;

        if (posicionXCamara < 0) {
            posicionXCamara = 0;
        }
        if (posicionXCamara > this.mapaAncho - this.getContentSize().width) {
            posicionXCamara = this.mapaAncho - this.getContentSize().width;
        }

        if (posicionYCamara < 0) {
            posicionYCamara = 0;
        }
        if (posicionYCamara > this.mapaAlto - this.getContentSize().height) {
            posicionYCamara = this.mapaAlto - this.getContentSize().height;
        }

        this.setPosition(cc.p(-posicionXCamara, -posicionYCamara));


        // Caída, sí cae vuelve a la posición inicial
        if (this.jugador.body.p.y < -100) {
            cc.director.pause();
            cc.audioEngine.stopMusic();
            cc.audioEngine.playMusic(res.lost_wav, false);
            cc.director.runScene(new GameOverLayer(nivelActual));
        }
        // Eliminar formas:
        for (var i = 0; i < this.formasEliminar.length; i++) {
            var shape = this.formasEliminar[i];

            for (var j = 0; j < this.monedas.length; j++) {
                if (this.monedas[j].shape == shape) {
                    this.monedas[j].eliminar();
                    this.monedas.splice(j, 1);
                }
            }
            for (var j = 0; j < this.bosses.length; j++) {
                if (this.bosses[j].shape == shape) {
                    this.bosses[j].eliminar();
                    this.bosses.splice(j, 1);
                }
            }
            for (var j = 0; j < this.powerUps.length; j++) {
                if (this.powerUps[j].shape == shape) {
                    this.powerUps[j].eliminar();
                    this.powerUps.splice(j, 1);
                }
            }
            for (var j = 0; j < this.enemigos.length; j++) {
                if (this.enemigos[j].shape == shape) {
                    this.enemigos[j].eliminar();
                    this.enemigos.splice(j, 1);
                }
            }
            for (var j = 0; j < this.disparos.length; j++) {
                if (this.disparos[j].shape == shape) {
                    this.disparos[j].eliminar();
                    this.disparos.splice(j, 1);
                }
            }
            for (var j = 0; j < this.nuevosEnemigos.length; j++) {
                if (this.nuevosEnemigos[j].shape == shape) {
                    this.nuevosEnemigos[j].eliminar();
                    this.nuevosEnemigos.splice(j, 1);
                }
            }
        }
        this.formasEliminar = [];

    }, cargarMapa: function () {
        enemigos = [];
        monedas = [];
        powerUps = [];
        var nombreMapa = "res/mapaNSM" + nivelActual + ".tmx";
        //var nombreMapa = "res/mapaNSM1.tmx";
        this.mapa = new cc.TMXTiledMap(nombreMapa);
        // Añadirlo a la Layer
        this.addChild(this.mapa);
        // Ancho del mapa
        this.mapaAncho = this.mapa.getContentSize().width;

        // Solicitar los objeto dentro de la capa Suelos
        var grupoSuelos = this.mapa.getObjectGroup("Suelos");
        var suelosArray = grupoSuelos.getObjects();

        // Los objetos de la capa suelos se transforman a
        // formas estáticas de Chipmunk ( SegmentShape ).
        for (var i = 0; i < suelosArray.length; i++) {
            var suelo = suelosArray[i];
            var puntos = suelo.polylinePoints;
            for (var j = 0; j < puntos.length - 1; j++) {
                var bodySuelo = new cp.StaticBody();

                var shapeSuelo = new cp.SegmentShape(bodySuelo,
                    cp.v(parseInt(suelo.x) + parseInt(puntos[j].x),
                        parseInt(suelo.y) - parseInt(puntos[j].y)),
                    cp.v(parseInt(suelo.x) + parseInt(puntos[j + 1].x),
                        parseInt(suelo.y) - parseInt(puntos[j + 1].y)),
                    10);

                shapeSuelo.setCollisionType(tipoSuelo);
                shapeSuelo.setFriction(0.3);
                this.space.addStaticShape(shapeSuelo);
            }
        }

        var grupoMuros = this.mapa.getObjectGroup("Muros");
        var murosArray = grupoMuros.getObjects();

        // Los objetos de la capa muros se transforman a
        // formas estáticas de Chipmunk ( SegmentShape ).
        for (var i = 0; i < murosArray.length; i++) {
            var muro = murosArray[i];
            var puntos = muro.polylinePoints;
            for (var j = 0; j < puntos.length - 1; j++) {
                var bodyMuro = new cp.StaticBody();

                var shapeMuro = new cp.SegmentShape(bodyMuro,
                    cp.v(parseInt(muro.x) + parseInt(puntos[j].x),
                        parseInt(muro.y) - parseInt(puntos[j].y)),
                    cp.v(parseInt(muro.x) + parseInt(puntos[j + 1].x),
                        parseInt(muro.y) - parseInt(puntos[j + 1].y)),
                    10);

                shapeMuro.setCollisionType(tipoMuro);
                shapeMuro.setSensor(true);
                this.space.addStaticShape(shapeMuro);
            }
        }

        var grupoMeta = this.mapa.getObjectGroup("Meta");
        var metaArray = grupoMeta.getObjects();

        // Los objetos de la capa muros se transforman a
        // formas estáticas de Chipmunk ( SegmentShape ).
        for (var i = 0; i < metaArray.length; i++) {
            var meta = metaArray[i];
            var puntos = meta.polylinePoints;
            for (var j = 0; j < puntos.length - 1; j++) {
                var bodyMeta = new cp.StaticBody();

                var shapeMeta = new cp.SegmentShape(bodyMeta,
                    cp.v(parseInt(meta.x) + parseInt(puntos[j].x),
                        parseInt(meta.y) - parseInt(puntos[j].y)),
                    cp.v(parseInt(meta.x) + parseInt(puntos[j + 1].x),
                        parseInt(meta.y) - parseInt(puntos[j + 1].y)),
                    10);

                shapeMeta.setCollisionType(tipoMeta);
                shapeMeta.setSensor(true);
                this.space.addStaticShape(shapeMeta);
            }
        }

        var grupoMonedas = this.mapa.getObjectGroup("Monedas");
        var monedasArray = grupoMonedas.getObjects();
        for (var i = 0; i < monedasArray.length; i++) {
            var moneda = new Moneda(this,
                cc.p(monedasArray[i]["x"], monedasArray[i]["y"]), "Infinite");
            this.monedas.push(moneda);
        }
        var grupoPowerUps = this.mapa.getObjectGroup("PowerUps");
        var powerUpsArray = grupoPowerUps.getObjects();
        for (var i = 0; i < powerUpsArray.length; i++) {
            var pUp = new PowerUp(this,
                cc.p(powerUpsArray[i]["x"], powerUpsArray[i]["y"]));
            this.powerUps.push(pUp);
        }
        var grupoEnemigos = this.mapa.getObjectGroup("Champiñones");
        var enemigosArray = grupoEnemigos.getObjects();
        for (var i = 0; i < enemigosArray.length; i++) {
            var enemigo = new Enemigo(this,
                cc.p(enemigosArray[i]["x"], enemigosArray[i]["y"]));

            this.enemigos.push(enemigo);
        }

        var bosses = this.mapa.getObjectGroup("Boss");
        var bossArray = bosses.getObjects();
        for (var i = 0; i < bossArray.length; i++) {
            var boss = new Boss(this,
                cc.p(bossArray[i]["x"], bossArray[i]["y"]));

            this.bosses.push(boss);
        }
        var entradasTubo = this.mapa.getObjectGroup("EntradaTubo");
        var entradaTuboArray = entradasTubo.getObjects();
        for (var i = 0; i < entradaTuboArray.length; i++) {
            var tubo = new SalidaTubo(this,
                cc.p(entradaTuboArray[i]["x"], entradaTuboArray[i]["y"]));

            this.entradasTubo.push(tubo);
        }

        var salidasTubo = this.mapa.getObjectGroup("SalidaTubo");
        var salidaTuboArray = salidasTubo.getObjects();
        for (var i = 0; i < salidaTuboArray.length; i++) {
            var tubo = new SalidaTubo(this,
                cc.p(salidaTuboArray[i]["x"], salidaTuboArray[i]["y"]));

            this.salidasTubo.push(tubo);
        }

        var grupoNuevosEnemigos = this.mapa.getObjectGroup("Tortugas");
        var enemigosNuevosArray = grupoNuevosEnemigos.getObjects();
        for (var i = 0; i < enemigosNuevosArray.length; i++) {
            var nuevoEnemigo = new NuevoEnemigo(this.space,
                cc.p(enemigosNuevosArray[i]["x"], enemigosNuevosArray[i]["y"]), this, "Infinite");

            this.nuevosEnemigos.push(nuevoEnemigo);
        }
        var grupoPinchos = this.mapa.getObjectGroup("Plantas");
        var enemigosPinchosArray = grupoPinchos.getObjects();
        for (var i = 0; i < enemigosPinchosArray.length; i++) {
            var enemigoPinchos = new EnemigoPinchos(this,
                cc.p(enemigosPinchosArray[i]["x"], enemigosPinchosArray[i]["y"]));

            this.enemigosPinchos.push(enemigoPinchos);
        }

    }, collisionSueloConJugador: function (arbiter, space) {
        this.jugador.tocaSuelo();
    }, collisionJugadorConMoneda: function (arbiter, space) {
        // Emisión de partículas
        //this._emitter.setEmissionRate(5);
        //this.tiempoEfecto = 3;

        // Impulso extra
        this.jugador.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));

        // Marcar la moneda para eliminarla
        var shapes = arbiter.getShapes();
        // shapes[0] es el jugador
        this.formasEliminar.push(shapes[1]);

        var capaControles =
            this.getParent().getChildByTag(idCapaControles);
        capaControles.agregarMoneda();
    }, collisionJugadorConPowerUP: function (arbiter, space) {
        //Crear colision jugador con powerUp
        var shapes = arbiter.getShapes();

        this.formasEliminar.push(shapes[1]);
        this.jugador.sumaVida();
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        capaControles.actualizarVidas(this.jugador.vidas);

    }, collisionJugadorConTuboTransport: function (arbiter, space) {
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        var shapes = arbiter.getShapes();
        var tuboPos = shapes[1].getBody();
        var jugadorBody = shapes[0].getBody();
        var tuboPos = tuboPos.getPos();
        var jugadorPos = jugadorBody.getPos();
        var index = 0;
        for (var j = 0; j < this.entradasTubo.length; j++) {
            if (this.entradasTubo[j].shape == shapes[1]) {
                index = j;
            }
        }
        var salidaTubo = this.salidasTubo[index];
        if (this.jugador.tuboTransport) {
            this.jugador.body.p = cc.p(salidaTubo.getBody().x, salidaTubo.getBody().y);
        }

    }, collisionJugadorConEnemigo: function (arbiter, space) {
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        var shapes = arbiter.getShapes();
        var enemigoBody = shapes[1].getBody();
        var jugadorBody = shapes[0].getBody();
        var enemigoPos = enemigoBody.getPos();
        var jugadorPos = jugadorBody.getPos();
        if (jugadorPos.y < enemigoPos.y) { //&& arbiter.isFirstContact()
            this.jugador.restaVida();
        }
        this.formasEliminar.push(shapes[1]);
        if (this.jugador.vidas <= 0) {
            cc.director.pause();
            cc.audioEngine.stopMusic();
            cc.audioEngine.playMusic(res.lost_wav, false);
            cc.director.runScene(new GameOverLayer(nivelActual));
        }
        capaControles.actualizarVidas(this.jugador.vidas);
    }, collisionJugadorConBoss: function (arbiter, space) {
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        var shapes = arbiter.getShapes();
        var enemigoBody = shapes[1].getBody();
        var jugadorBody = shapes[0].getBody();
        var enemigoPos = enemigoBody.getPos();
        var jugadorPos = jugadorBody.getPos();
        if (jugadorPos.y < enemigoPos.y) { //&& arbiter.isFirstContact()
            this.jugador.restaVida();
        }
        this.formasEliminar.push(shapes[1]);
        if (this.jugador.vidas <= 0) {
            cc.director.pause();
            cc.audioEngine.stopMusic();
            cc.audioEngine.playMusic(res.lost_wav, false);
            cc.director.runScene(new GameOverLayer(nivelActual));
        }
    }, collisionJugadorConNuevoEnemigo: function (arbiter, space) {
        var time = new Date().getTime();
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        var shapes = arbiter.getShapes();
        var enemigoBody = shapes[1].getBody();
        var jugadorBody = shapes[0].getBody();
        var enemigoPos = enemigoBody.getPos();
        var jugadorPos = jugadorBody.getPos();
        if (jugadorPos.y < enemigoPos.y) { //&& arbiter.isFirstContact()
            this.jugador.restaVida();
        }
        if (time - this.tiempoColision < 1000) {
            //vx enemigo = 0
        }
        if (this.jugador.vidas <= 0) {
            cc.director.pause();
            cc.audioEngine.stopMusic();
            cc.audioEngine.playMusic(res.lost_wav, false);
            cc.director.runScene(new GameOverLayer(nivelActual));
        }
        capaControles.actualizarVidas(this.jugador.vidas);
        this.tiempoColision = time;
    }, collisionJugadorConMeta: function (arbiter, space) {
        cc.director.pause();
        cc.director.runScene(new GameWinLayer(nivelActual));
    }, collisionEnemigoConMuro: function (arbiter, space) {

    }, colisionDisparoConEnemigo: function (arbiter, space) {
        var shapes = arbiter.getShapes();

        this.formasEliminar.push(shapes[1]);
        this.formasEliminar.push(shapes[0]);
    }, colisionDisparoConSuelo: function (arbiter, space) {
        var shapes = arbiter.getShapes();

        this.formasEliminar.push(shapes[0]);
    }, colisionEnemigoConContencion: function (arbiter, space) {
        var shapes = arbiter.getShapes();
        // shapes[0] es el enemigo
        var formaEnemigo = shapes[0];
        formaEnemigo.body.vx = 0; // Parar enemigo
    }, colisionDisparoConJugador: function (arbiter, space) {
        var capaControles = this.getParent().getChildByTag(idCapaControles);
        this.jugador.restaVida();
        var shapes = arbiter.getShapes();
        this.formasEliminar.push(shapes[0]);
        if (this.jugador.vidas <= 0) {
            cc.director.pause();
            cc.audioEngine.stopMusic();
            cc.audioEngine.playMusic(res.lost_wav, false);
            cc.director.runScene(new GameOverLayer(nivelActual));
        }
        capaControles.actualizarVidas(this.jugador.vidas);
    }, collisionJugadorConEnemigoPinchos: function (arbiter, space) {
        cc.director.pause();
        cc.audioEngine.stopMusic();
        cc.audioEngine.playMusic(res.lost_wav, false);
        cc.director.runScene(new GameOverLayer(nivelActual));
    }
});

var idCapaJuego = 1;
var idCapaControles = 2;

var GameScene = cc.Scene.extend({
    ctor: function (nivel) {
        this._super();
        nivelActual = nivel;
    },
    onEnter: function () {
        this._super();
        cc.director.resume();
        var layer = new GameLayer();
        if (nivelActual % 2 == 0) {
            cc.audioEngine.playMusic(res.boss_music_bucle_wav, true);
        }
        else {
            cc.audioEngine.playMusic(res.mario_music_bucle_wav, true);
        }
        this.addChild(layer, 0, idCapaJuego);
        var controlesLayer = new ControlesLayer();
        this.addChild(controlesLayer, 0, idCapaControles);

    }
});
