
var GameWinLayer = cc.LayerColor.extend({
    nivelActual:null,
    ctor:function (nivel) {
        this._super();
        this.init();
        this.nivelActual=nivel;
    },
    init:function () {
        this._super(cc.color(0, 0, 0, 180));

        var winSize = cc.director.getWinSize();
        cc.audioEngine.stopMusic();
        cc.audioEngine.playMusic(res.win_wav, false);
        var botonReiniciar = new cc.MenuItemSprite(
            new cc.Sprite(res.boton_siguiente_png),
            new cc.Sprite(res.boton_siguiente_png),
            this.pulsarReiniciar, this);

        var menu = new cc.Menu(botonReiniciar);
        menu.setPosition(winSize.width / 2, winSize.height / 2);

        this.addChild(menu);
    },
    pulsarReiniciar:function (sender) {
        // Volver a ejecutar la escena Prinicpal
        cc.audioEngine.stopMusic();
        cc.director.runScene(new GameScene(this.nivelActual));
    }
});
