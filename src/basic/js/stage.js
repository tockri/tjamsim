/**
 * base
 * 基本のシミュレーション
 */
(function($) {
    CS.Simulator.addGenerator({
        interval: 40,
        entrance: {
            left: 350,
            space: CS.Const.NodeRadius * 2.5,
            width: 100
        },
        speedX: 0,
        speedY: -2
    });

    $(function() {
        CS.Simulator.start();
    });
})(jQuery);