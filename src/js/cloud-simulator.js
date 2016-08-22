(function(global) {
    'use strict';

    /**
     * 重なり判定
     * @param {PIXI.Rectangle} rc1
     * @param {PIXI.Rectangle} rc2
     * @returns {boolean}
     */
    function intersect(rc1, rc2) {
        if (rc1.x + rc1.width < rc2.x
            || rc1.y + rc1.height < rc2.y
            || rc2.x + rc2.width < rc1.x
            || rc2.y + rc2.height < rc2.y) {
            return false;
        } else {
            return true;
        }
    }


    /**
     * 定数定義
     */
    var Const = {
        /**
         * Nodeの半径
         */
        NodeRadius: 20,
        /**
         * キャンバス幅
         */
        CanvasWidth: 800,
        /**
         * キャンバス高さ
         */
        CanvasHeight: 600,
        /**
         * キャンバス矩形
         */
        CanvasRect: new PIXI.Rectangle(0, 0, 800, 600)
    };

    /**
     * シミュレータ本体
     */
    var Simulator = {
        /**
         * @var [Node]
         */
        nodes: [],
        /**
         * @var [Generator]
         */
        generators: [],
        /**
         *
         */
        container: new PIXI.Container(),
        /**
         * シミュレータを開始する
         */
        start: function() {
            var renderer = PIXI.autoDetectRenderer(Const.CanvasWidth, Const.CanvasHeight, {
                antialias: true,
                transparent: true
            });
            $('#stage').append(renderer.view);

            function animate() {
                Simulator.updateNodes();
                renderer.render(Simulator.container);
                requestAnimationFrame( animate );
            }
            animate();
        },

        /**
         * 登録されているすべてのノードを更新する
         */
        updateNodes: function() {
            for (var i = this.nodes.length - 1; i >= 0; i--) {
                var n = this.nodes[i];
                var nrc = n.shape.getBounds();
                if (intersect(nrc, Const.CanvasRect)) {
                    n.next();
                } else {
                    // 画面外に出たNodeは削除する
                    this.nodes.splice(i, 1);
                    this.container.removeChild(n.shape);
                    n.shape.destroy();
                }
            }
            // 新しく生成する
            for (var i = this.generators.length - 1; i >= 0; i--) {
                var gen = this.generators[i].generate();
                Array.prototype.push.apply(this.nodes, gen);
            }
        },
        addGenerator: function(params) {
            this.generators.push(new Generator(params));
        }


    } ;


    /**
     * Simulatorのpublicメソッド
     */
    var SimulatorExport = {
        start: function() {
            Simulator.start();
        },
        addGenerator: function(params) {
            Simulator.addGenerator(params);
        }
    };

    /**
     * Nodeを自動生成するオブジェクト
     */
    function Generator(params) {
        // 設定値を上書き
        var g = this;
        $.each(['interval', 'entrance', 'speedX', 'speedY'], function(i, key) {
            if (typeof(params[key]) != 'undefined') {
                g[key] = params[key];
            }
        });
        this.counter = 99999999;

    };
    Generator.prototype = {
        /**
         * 発生させる時間間隔
         */
        interval: 10,
        /**
         * 発生源の位置と幅
         */
        entrance: {
            left: 0,
            space: Const.NodeRadius * 2,
            width: Const.CanvasWidth
        },
        /**
         * X方向スピード初期値
         */
        speedX: 0,
        /**
         * Y方向スピード初期値
         */
        speedY: 0,
        /**
         * interval計測用カウンタ
         */
        counter: 0,
        /**
         * Nodeを発生させる
         */
        generate: function() {
            this.counter++;
            var ret = [];
            if (this.counter >= this.interval) {
                this.counter = 0;
                var stage = Simulator.container;
                var x = this.entrance.left;
                var endX = this.entrance.left + this.entrance.width;
                var y = Const.CanvasHeight;
                while (x < endX) {
                    var n = new Node();
                    n.pos(x, y);
                    n.speedX = this.speedX;
                    n.speedY = this.speedY;
                    ret.push(n);
                    stage.addChild(n.shape);
                    x += this.entrance.space;
                }
            }
            return ret;
        }
    }

    /**
     * 群衆の一人
     * @constructor
     */
    function Node() {
        var s = new PIXI.Sprite.fromImage('img/circle.png');
        s.height = s.width = Const.NodeRadius * 2;
        this.shape = s;
        this.id = Node.idCounter++;
    }
    Node.idCounter = 1;

    Node.prototype = {
        id: 0,
        /**
         * @type {PIXI.Sprite}
         */
        shape: null,
        /**
         * X方向の速度
         */
        speedX: 0,
        /**
         * Y方向の速度
         */
        speedY: 0,
        /**
         * 位置を設定する
         * @param x
         * @param y
         */
        pos: function(x, y) {
            this.shape.position.x = x;
            this.shape.position.y = y;
        },
        /**
         * X座標を返す
         * @returns {number}
         */
        x: function() {
            return this.shape.position.x;
        },
        /**
         * Y座標を返す
         * @returns {number}
         */
        y: function() {
            return this.shape.position.y;
        },
        /**
         * 位置を更新する
         */
        next: function() {
            this.pos(this.x() + this.speedX, this.y() + this.speedY);
        }
    };

    global.CS = {
        Simulator: SimulatorExport,
        Const: Const
    };

})(window);
