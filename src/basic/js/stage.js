/**
 * base
 * 基本のシミュレーション
 */
(function($) {
    CS.Simulator.setSize(100, 1024);
    var counter = 0;
    CS.Simulator.addGenerator({
        generate: function(frame) {
            var p = counter++ / 50.0;
            if (Math.random() * p > 1) {
                counter = 0;
                return {
                    x: Math.random() > 0.5 ? 25 : 75,
                    y: 1024,
                    speedX: 0,
                    speedY: -2 + (Math.random() - 0.5) * 0.5
                }
            } else {
                return null;
            }
        }
    });

    $(function() {
        CS.Simulator.start();
    });
})(jQuery);