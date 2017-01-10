
var GameModeSelect = cc.LayerColor.extend({
    ctor:function () {
        this._super();
        this.init();
    },
    init:function () {
        this._super(cc.color(0, 0, 0, 180));

        var winSize = cc.director.getWinSize();

        var boton2 = new cc.MenuItemSprite(
            new cc.Sprite(res.boton_infinite_png),
            new cc.Sprite(res.boton_infinite_png),
            this.pulsarBoton2, this);

        var menu = new cc.Menu(boton2);
        menu.setPosition(winSize.width / 2, winSize.height / 2.5);

        this.addChild(menu);
    },pulsarBoton2:function (sender) {
            // Volver a ejecutar la escena Prinicpal
            cc.director.runScene(new GameLevelLayer("Infinite"));
    }
});
