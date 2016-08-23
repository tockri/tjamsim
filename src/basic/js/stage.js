/**
 * base
 * 基本のシミュレーション
 */
(function($) {
    var H = 800;
    CS.Simulator.setSize(100, H);
    function fastCarExists() {
        return $('#fast-car').prop('checked');
    }

    /**
     * 左車線
     */
    var counter = 0;
    CS.Simulator.addGenerator({
        generate: function() {
            if (++counter > 40) {

                return {
                    x: 25,
                    y: H,
                    speedX: 0,
                    speedY: -2 + (fastCarExists() ? (Math.random() - 0.5) * 0.5 : 0)
                }
            } else {
                return null;
            }
        },
        onAdded: function() {
            counter = 0;
        }
    });
    /**
     * 右車線
     * @type {number}
     */
    var counter2 = 0;
    CS.Simulator.addGenerator({
        generate: function() {
            if (++counter2 > 40) {
                counter2 = 0;
                return {
                    x: 75,
                    y: H,
                    speedX: 0,
                    speedY: -2.8 + (fastCarExists() ? Math.random() : 0)
                }
            } else {
                return null;
            }
        },
        onAdded: function() {
            counter2 = 0;
        }
    });

    $(function() {
        CS.Simulator.start();
    });
})(jQuery);