
var tipoJugadorPlataformas = 1;
var tipoMonedaPlataformas = 2;
var tipoEnemigoPlataformas = 3;
var tipoMuroPlataformas = 4;
var tipoDisparoPlataformas = 5;
var tipoSueloPlataformas = 6;
var nivelActualPlataformas = 0;
var nivelMaximoPlataformas = 2;

var GameLayerPlataformas = cc.Layer.extend({
    monedas:0,
    tiempoDisparar:0,
    disparos:[],
    disparosEliminar:[],
    enemigos:[],
    enemigosEliminar:[],
    formasEliminar:[],
    teclaIzquierda:false,
    teclaDerecha:false,
    teclaArriba:false,
    teclaBarra:false,
    monedas:[],
    powerUps:[],
    nuevosEnemigos:[],
    enemigosPinchos:[],
    jugador: null,
    space:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;

        cc.spriteFrameCache.addSpriteFrames(res.playershootright_plist);
        cc.spriteFrameCache.addSpriteFrames(res.disparo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacion_cuervo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.moneda_plist);
        cc.spriteFrameCache.addSpriteFrames(res.playerrunright_plist);
        cc.spriteFrameCache.addSpriteFrames(res.playerjumpright_plist);
        cc.spriteFrameCache.addSpriteFrames(res.playeridleright_plist);
        cc.spriteFrameCache.addSpriteFrames(res.playerdieright_plist);
        cc.spriteFrameCache.addSpriteFrames(res.disparo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.playershootright_plist);
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


        this.space = new cp.Space();
        this.space.gravity = cp.v(0, -350);

        this.space.addCollisionHandler(tipoJugadorPlataformas, tipoMonedaPlataformas,
              null, this.colisionJugadorConMoneda.bind(this), null, null);


        this.jugador = new JugadorPlataformas(this.space,
               cc.p(50,150), this);

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: this.teclaPulsada,
            onKeyReleased: this.teclaLevantada
        }, this);

        this.cargarMapa();
        this.scheduleUpdate();


      //Colisiones
      this.space.addCollisionHandler(tipoJugadorPlataformas, tipoMonedaPlataformas,
              null, this.colisionJugadorConMoneda.bind(this), null, null);
      this.space.addCollisionHandler(tipoEnemigoPlataformas, tipoMuroPlataformas,
            null, this.colisionEnemigoConMuro.bind(this), null, null);
      this.space.addCollisionHandler(tipoDisparoPlataformas, tipoEnemigoPlataformas,
            null, this.colisionDisparoConEnemigo.bind(this), null, null);
      this.space.addCollisionHandler(tipoDisparoPlataformas, tipoSueloPlataformas,
           null, this.colisionDisparoConSuelo.bind(this), null, null);


       return true;
},update:function (dt) {
     this.space.step(dt);

     var capaControles =
               this.getParent().getChildByTag(idCapaControles);

     if ( capaControles.monedas >= 40){
        nivelActualPlataformas = nivelActualPlataformas + 1;
        if(nivelMaximoPlataformas<nivelActualPlataformas)
            nivelActualPlataformas=1;
        cc.director.runScene(new GameScenePlataformas(nivelActualPlataformas));
     }

      // Mover enemigos:
        for(var i = 0; i < this.nuevosEnemigos.length; i++) {
            var enemigo = this.nuevosEnemigos[i];
            enemigo.moverAutomaticamente();
        }

     // Eliminar formas:
     for(var i = 0; i < this.formasEliminar.length; i++) {
         var shape = this.formasEliminar[i];

         for (var r = 0; r < this.monedas.length; r++) {
           if (this.monedas[r].shape == shape) {
               this.monedas[r].eliminar();
               this.monedas.splice(r, 1);
           }
         }

         for (var r = 0; r < this.enemigos.length; r++) {
            if (this.enemigos[r].shape == shape) {
                this.enemigos[r].eliminar();
                this.enemigos.splice(r, 1);
            }
         }

         for (var r = 0; r < this.disparos.length; r++) {
             if (this.disparos[r].shape == shape) {
                 this.disparos[r].eliminar();
                 this.disparos.splice(r, 1);
             }
         }
     }

     this.formasEliminar = [];

     // Caída, sí cae vuelve a la posición inicial
     if( this.jugador.body.p.y < -100){
         cc.director.pause();
         cc.director.runScene(new GameScenePlataformas(this.nivelActual));
        //this.jugador.body.p = cc.p(50,150);
     }

    if ( this.teclaBarra && new Date().getTime() - this.tiempoDisparar > 1000 ){
        this.tiempoDisparar = new Date().getTime();
        var disparo = new Disparo(this.space,
          cc.p(this.jugador.body.p.x, this.jugador.body.p.y),
          this,false,"Plataformas");

          if ( this.jugador.sprite.scaleX > 0){
               disparo.body.vx = 400;
          } else {
               disparo.body.vx = -400;
          }

        this.disparos.push(disparo);
        this.jugador.disparar();
    }

     if ( this.teclaArriba ){
        this.jugador.moverArriba();
     }
     if (this.teclaIzquierda){
        this.jugador.moverIzquierda();
     }
     if( this.teclaDerecha ){
        this.jugador.moverDerecha();
     }
     if ( !this.teclaIzquierda && !this.teclaIzquierda
        && !this.teclaDerecha ){
        this.jugador.body.vx = 0;
     }

     this.jugador.actualizarAnimacion();

     // actualizar camara (posición de la capa).
        var posicionX = this.jugador.body.p.x -200;
        var posicionY = this.jugador.body.p.y -200;

    if(posicionX < 0){
        posicionX = 0;
    }
    if(posicionY < 0){
        posicionY = 0;
    }

    this.setPosition(cc.p( -posicionX, -posicionY ));


     if (this.jugador.body.vx < -200){
          this.jugador.body.vx = -200;
     }

     if (this.jugador.body.vx > 200){
         this.jugador.body.vx = 200;
     }

}, cargarMapa:function () {
      //var nombreMapa = "res/mapa"+nivelActual+".tmx";
      var nombreMapa = "res/mapaNSM.tmx";
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
           for(var j = 0; j < puntos.length - 1; j++){
               var bodySuelo = new cp.StaticBody();

               var shapeSuelo = new cp.SegmentShape(bodySuelo,
                   cp.v(parseInt(suelo.x) + parseInt(puntos[j].x),
                       parseInt(suelo.y) - parseInt(puntos[j].y)),
                   cp.v(parseInt(suelo.x) + parseInt(puntos[j + 1].x),
                       parseInt(suelo.y) - parseInt(puntos[j + 1].y)),
                   10);
               shapeSuelo.setFriction(0);
               shapeSuelo.setCollisionType(tipoSueloPlataformas);
               //shapeSuelo.setElasticity(0);
               this.space.addStaticShape(shapeSuelo);
           }
       }

        var grupoMonedas = this.mapa.getObjectGroup("Monedas");
        var monedasArray = grupoMonedas.getObjects();
        for (var i = 0; i < monedasArray.length; i++) {
            var moneda = new Moneda(this,
                cc.p(monedasArray[i]["x"],monedasArray[i]["y"]),"Plataformas");
            this.monedas.push(moneda);
        }
        var grupoPowerUps = this.mapa.getObjectGroup("PowerUps");
        var powerUpsArray = grupoPowerUps.getObjects();
        for (var i = 0; i < powerUpsArray.length; i++) {
            var pUp = new PowerUp(this,
                cc.p(powerUpsArray[i]["x"],powerUpsArray[i]["y"]));
            this.powerUps.push(pUp);
        }
        var grupoEnemigos = this.mapa.getObjectGroup("Champiñones");
        var enemigosArray = grupoEnemigos.getObjects();
        for (var i = 0; i < enemigosArray.length; i++) {
            var enemigo = new Enemigo(this,
                cc.p(enemigosArray[i]["x"],enemigosArray[i]["y"]));

            this.enemigos.push(enemigo);
        }
        var grupoNuevosEnemigos = this.mapa.getObjectGroup("Tortugas");
        var enemigosNuevosArray = grupoNuevosEnemigos.getObjects();
        for (var i = 0; i < enemigosNuevosArray.length; i++) {
            var nuevoEnemigo = new NuevoEnemigo(this.space,
                cc.p(enemigosNuevosArray[i]["x"],enemigosNuevosArray[i]["y"]),this,"Plataformas");

            this.nuevosEnemigos.push(nuevoEnemigo);
        }
        var grupoPinchos = this.mapa.getObjectGroup("Plantas");
        var enemigosPinchosArray = grupoPinchos.getObjects();
        for (var i = 0; i < enemigosPinchosArray.length; i++) {
            var enemigoPinchos = new EnemigoPinchos(this,
                cc.p(enemigosPinchosArray[i]["x"],enemigosPinchosArray[i]["y"]));

            this.enemigosPinchos.push(enemigoPinchos);
        }



       var grupoMuros = this.mapa.getObjectGroup("Muros");
       var murosArray = grupoMuros.getObjects();
       for (var i = 0; i < murosArray.length; i++) {
           var muro = murosArray[i];
           var puntos = muro.polylinePoints;

           for(var j = 0; j < puntos.length - 1; j++){
               var bodyMuro = new cp.StaticBody();

               var shapeMuro = new cp.SegmentShape(bodyMuro,
                   cp.v(parseInt(muro.x) + parseInt(puntos[j].x),
                       parseInt(muro.y) - parseInt(puntos[j].y)),
                   cp.v(parseInt(muro.x) + parseInt(puntos[j + 1].x),
                       parseInt(muro.y) - parseInt(puntos[j + 1].y)),
                   5);

               shapeMuro.setSensor(true);
               shapeMuro.setCollisionType(tipoMuroPlataformas);
               shapeMuro.setFriction(1);

               this.space.addStaticShape(shapeMuro);
           }
       }
    },teclaPulsada: function(keyCode, event){
        var instancia = event.getCurrentTarget();

        // Flecha izquierda
        if( keyCode == 37){
            instancia.teclaIzquierda = true;
        }
        // Flecha derecha
        if( keyCode == 39){
            instancia.teclaDerecha = true;
        }
        // Flecha arriba
        if( keyCode == 38){
            instancia.teclaArriba = true;
        }
        // Barra espaciadora
        if( keyCode == 32){
            instancia.teclaBarra = true;
        }
    },teclaLevantada: function(keyCode, event){
        var instancia = event.getCurrentTarget();
        // Flecha izquierda
        if( keyCode == 37){
            instancia.teclaIzquierda = false;
        }
        // Flecha derecha
        if( keyCode == 39){
            instancia.teclaDerecha = false;
        }
        // Flecha arriba
        if( keyCode == 38){
            instancia.teclaArriba = false;
        }
        // Barra espaciadora
        if( keyCode == 32){
            instancia.teclaBarra = false;
        }
     },colisionJugadorConMoneda:function (arbiter, space) {

        // Marcar la moneda para eliminarla
        var shapes = arbiter.getShapes();
        // shapes[0] es el jugador
        this.formasEliminar.push(shapes[1]);

        this.tiempoEfecto = 100;

        var capaControles =
           this.getParent().getChildByTag(idCapaControles);
        capaControles.agregarMoneda();
     },colisionEnemigoConMuro:function (arbiter, space) {
          var shapes = arbiter.getShapes();
          // shapes[0] es el enemigo
          var formaEnemigo = shapes[0];
          formaEnemigo.body.vx = 0; // Parar enemigo
     }, colisionDisparoConEnemigo:function (arbiter, space) {
          var shapes = arbiter.getShapes();

          this.formasEliminar.push(shapes[0]);
          this.formasEliminar.push(shapes[1]);
     }, colisionDisparoConSuelo:function (arbiter, space) {
          var shapes = arbiter.getShapes();

          this.formasEliminar.push(shapes[0]);
     }
});

var idCapaJuego = 1;
var idCapaControles = 2;

var GameScenePlataformas = cc.Scene.extend({
    ctor:function(nivel){
        this._super();
        nivelActual = nivel;
    },
    onEnter:function () {
        this._super();
        var layer = new GameLayerPlataformas();
        this.addChild(layer, 0, idCapaJuego);

        var controlesLayer = new ControlesLayerPlataformas();
        this.addChild(controlesLayer, 0, idCapaControles);

    }
});
