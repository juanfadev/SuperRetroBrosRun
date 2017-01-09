
var GameLevelLayer = cc.LayerColor.extend({
    modo:null,
    ctor:function (tipo) {
        this._super();
        this.init();
        this.modo = tipo;
    },
    init:function () {
        this._super(cc.color(0, 0, 0, 180));

        var winSize = cc.director.getWinSize();

        var boton1 = new cc.MenuItemSprite(
            new cc.Sprite(res.boton_nivel1_png),
            new cc.Sprite(res.boton_nivel1_png),
            this.pulsarBoton1, this);

        var menu = new cc.Menu(boton1);
        menu.setPosition(winSize.width / 2, winSize.height / 2);

        this.addChild(menu);

        var boton2 = new cc.MenuItemSprite(
            new cc.Sprite(res.boton_nivel2_png),
            new cc.Sprite(res.boton_nivel2_png),
            this.pulsarBoton2, this);

        var menu = new cc.Menu(boton2);
        menu.setPosition(winSize.width / 2, winSize.height / 2.5);

        this.addChild(menu);
    },
    pulsarBoton1:function (sender) {
        // Volver a ejecutar la escena Prinicpal
        if(this.modo == "Plataformas")
            cc.director.runScene(new GameScenePlataformas(1));
        else
            cc.director.runScene(new GameScene(1));
    },pulsarBoton2:function (sender) {
           if(this.modo == "Plataformas")
               cc.director.runScene(new GameScenePlataformas(2));
           else
               cc.director.runScene(new GameScene(2));
    }
});
