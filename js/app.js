(function(){
    var settings = new MolDrawSettings();
    var toolbar  = new ToolBar({
        model:settings
    });
    var moldraw = new MolDraw({
        settings : settings
    });
    window.moldraw = moldraw;
})();