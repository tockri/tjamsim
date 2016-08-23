(function(global, $) {
    'use strict';
    /**
     * ノードのサイズ
     * @type {number}
     */
    const NODE_RADIUS = 20;


    /**
     * 重なり判定
     * @param rc1
     * @param rc2
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
        container: new PIXI.Container(),
        width: 800,
        height: 600,
        frame: 0,
        /**
         * シミュレータのサイズを設定する
         * @param w
         * @param h
         */
        setSize: function(w, h) {
            this.width = w;
            this.height = h;
        },
        /**
         * シミュレータを開始する
         */
        start: function() {
            var renderer = PIXI.autoDetectRenderer(this.width, this.height, {
                antialias: true,
                transparent: true
            });
            $('#stage').append(renderer.view);

            var self = this;
            function animate() {
                self.frame++;
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
                if (intersect(nrc, {x:0, y:0, width:this.width, height:this.height})) {
                    n.next();
                } else {
                    // 画面外に出たNodeは削除する
                    this.removeNodeAt(i);
                }
            }
            // 新しく生成する
            for (var i = this.generators.length - 1; i >= 0; i--) {
                this.generators[i].estimateGenerate(this.frame);
            }
        },
        /**
         * 自動生成の定義を追加する
         * @param params
         */
        addGenerator: function(params) {
            this.generators.push(new Generator(params));
        },
        /**
         * ノードを削除する
         * @param idx
         */
        removeNodeAt: function(idx) {
            var n = this.nodes[idx];
            this.nodes.splice(idx, 1);
            this.container.removeChild(n.shape);
            n.shape.destroy();
        },
        /**
         * ノードを追加する
         * @param param
         */
        addNode: function(param) {
            var n = new Node();
            n.setPos(param.x, param.y);
            n.speedX = param.speedX;
            n.speedY = param.speedY;
            this.nodes.push(n);
            this.container.addChild(n.shape);
        },
        /**
         * あるノードに一番近いノード
         * @param n
         */
        nearestNode: function(n) {

        }
    } ;



    /**
     * Nodeを自動生成するオブジェクト
     */
    function Generator(params) {
        // 設定値を上書き
        var g = this;
        $.each(['interval', 'entrance', 'speedX', 'speedY', 'generate'], function(i, key) {
            if (typeof(params[key]) != 'undefined') {
                g[key] = params[key];
            }
        });
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
            space: 10,
            right: 0
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
         * generate関数
         */
        generate: null,
        /**
         * Nodeを発生させる
         */
        estimateGenerate: function(frame) {
            if (typeof(this.generate) == 'function') {
                var p = this.generate(frame);
                if (p) {
                    Simulator.addNode(p);
                }
            }
        }
    };

    /**
     * 群衆の一人
     * @constructor
     */
    function Node() {
        this.id = Node.idCounter++;
        this.shape = new PIXI.Graphics();
        this._draw();
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
         * アクセル
         */
        acceleration: 1,
        /**
         * 色
         * @private
         */
        _color: 0xFFFFFF,
        /**
         * 位置を設定する
         * @param x
         * @param y
         */
        setPos: function(x, y) {
            var p = this.shape.position;
            p.x = x;
            p.y = y;
        },
        /**
         * 位置を返す
         * @returns {PIXI.Point}
         */
        pos: function() {
            var p = this.shape.position;
            return {
                x: p.x,
                y: p.y
            };
        },
        /**
         * 更新する
         */
        next: function() {
            var p = this.pos();
            this.setPos(p.x + this.speedX * this.acceleration,
                p.y + this.speedY * this.acceleration);
        },
        /**
         * 色を変更する
         * @param c
         */
        setColor: function(c) {
            this._color = c;
            this._draw();
        },
        /**
         * 描画する
         * @private
         */
        _draw: function() {
            var g = this.shape;
            g.beginFill(this._color, 1);
            g.lineStyle(2, 0, 1);
            g.drawCircle(0, 0, NODE_RADIUS);
            g.endFill();
        }
    };

    global.CS = {
        Simulator: Simulator
    };

})(window, jQuery);
