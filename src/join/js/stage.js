/**
 * join
 * 合流のシミュレーション
 */
(function($) {
    var H = 600;
    var LEFT = 1;
    var RIGHT = 2;
    var JOINING = 3;
    CS.Simulator.setSize(100, H);
    function randomJoining() {
        return $('#random-join').prop('checked');
    }

    /**
     * 左車線
     */
    var counter = 0;
    CS.Simulator.addGenerator({
        generate: function() {
            if (++counter > 65) {
                return {
                    x: 25,
                    y: H,
                    speedX: 0,
                    speedY: -2,
                    context: {
                        point: 200 + (randomJoining() ? Math.random() * 300 : 0),
                        state: LEFT
                    },
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
    var counter2 = 35;
    CS.Simulator.addGenerator({
        generate: function() {
            if (++counter2 > 65) {
                counter2 = 0;
                return {
                    x: 75,
                    y: H,
                    speedX: 0,
                    speedY: -2.4,
                    context: {
                        state: RIGHT
                    }
                }
            } else {
                return null;
            }
        },
        onAdded: function() {
            counter2 = 0;
        }
    });

    CS.Simulator.addStrategy({
        /**
         * 次のフレームでの方向とアクセルを決定する
         * @param {Map} map
         * @param {Node} n ノード
         */
        decide: function(map, n) {
            var pos = n.pos();
            var ctx = n.context;
            if (ctx.state == LEFT) {
                if (pos.y < ctx.point) {
                    ctx.state = JOINING;
                }
            } else if (ctx.state == JOINING) {
                if (73 < pos.x) {
                    ctx.state = RIGHT;
                } else {
                    n.speed.y = -2.4;
                    n.speed.x = 2;
                }
            } else if (ctx.state == RIGHT) {
                n.speed.x = 0;
                n.setPos(75, pos.y);
            }
        }
    });
    CS.Simulator.addShape([0,0, 50,0, 50, 50, 0, 180], 0x999999);

    $(function() {
        CS.Simulator.start();
    });
})(jQuery);
