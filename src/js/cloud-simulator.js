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
            || rc2.y + rc2.height < rc1.y) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 線分が矩形と交わるかどうか判定
     * @param line
     * @param rect
     */
    function lineCrossRect(line, rect) {
        // 正確じゃないけど大体で
        var lineRect = {
            x: Math.min(line[0].x, line[1].x),
            y: Math.min(line[0].y, line[1].y),
            width: Math.abs(line[0].x - line[1].x),
            height: Math.abs(line[0].y - line[1].y)
        };
        return intersect(lineRect, rect);
    }

    /**
     * ２点間の距離
     * @param p1
     * @param p2
     */
    function distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    /**
     * シミュレータ本体
     */
    var Simulator = {
        /**
         * @member {Map}
         */
        map: null,
        /**
         * @member {[Generator]}
         */
        generators: [],
        /**
         * 実行中
         * @member {boolean}
         */
        running: true,
        /**
         * レンダラ
         */
        renderer: null,
        /**
         * シミュレータのサイズを設定する
         * @param w
         * @param h
         */
        setSize: function(w, h) {
            this.map = new Map(w, h);
        },
        /**
         * シミュレータを開始する
         */
        start: function() {
            if (this.map == null) {
                this.map = new Map(800, 600);
            }
            if (this.renderer == null) {
                this.renderer = PIXI.autoDetectRenderer(this.map.width, this.map.height, {
                    antialias: true,
                    transparent: true
                });
                $('#stage').append(this.renderer.view);
                this.map.strategy = new Strategy(this.map);
            }

            var self = this;
            var map = this.map;
            function animate() {
                map.updateNodes();
                Simulator.generateNodes();
                self.renderer.render(map.container);
                if (self.running) {
                    requestAnimationFrame(animate);
                }
            }
            animate();
        },
        stop: function() {
            this.running = false;
        },
        /**
         * 自動生成の定義を追加する
         * @param params
         */
        addGenerator: function(params) {
            this.generators.push(new Generator(params, this.map));
        },
        /**
         * 登録されているGeneratorをすべて評価する
         */
        generateNodes: function() {
            for (var i = this.generators.length - 1; i >= 0; i--) {
                this.generators[i].estimateGenerate();
            }
        }
    };

    /**
     * 各ノードの戦略を司る
     * @param map
     * @constructor
     */
    function Strategy(map) {
        this.map = map;
    }
    Strategy.prototype = {
        /**
         * @member {Map}
         */
        map: null,
        /**
         * 次のフレームでのspeedとaccelerationを決定する
         * @param {Node} n
         */
        decide: function(n) {
            var info = this.map.crushingNode(n, 20);
            if (info) {
                if (info.distance < NODE_RADIUS * 3) {
                    n.acceleration = 0;
                    n.setColor(0xFF0000);
                } else if (info.distance < NODE_RADIUS * 6) {
                    n.acceleration *= 0.8;
                    n.setColor(0xFFFF00);
                } else {
                    n.acceleration *= 0.9;
                    n.setColor(0xFFDDDD);
                }
            } else {
                if (n.acceleration < 0.05) {
                    n.acceleration = 0.05;
                } else if (n.acceleration < 1) {
                    n.acceleration /= 0.95;
                    if (n.acceleration > 1) {
                        n.setColor(0xFFFFFF);
                        n.acceleration = 1;
                    }
                }
            }
        }
    };

    var MAP_DIVISION = 20;

    /**
     * マップ
     * @param width
     * @param height
     * @constructor
     */
    function Map(width, height) {
        var nl = [];
        for (var i = 0; i < MAP_DIVISION; i++) {
            nl.push([]);
        }
        this.nodeLists = nl;
        this.width = width;
        this.height = height;
        this.container = new PIXI.Container();
    }
    Map.prototype = {
        width: 0,
        height: 0,
        container: null,
        nodeLists: null,
        /**
         * @member {Strategy} ノードの行動を決定するオブジェクト
         */
        strategy: null,
        /**
         * ノードを追加する
         * @param n
         */
        addNode: function(n) {
            this.nodeLists[this._areaIndexOf(n)].push(n);
            this.container.addChild(n.shape);
            this.strategy.decide(n);
        },
        /**
         * ノードを追加できる状態かどうかを判定する
         * @param x
         * @param y
         */
        canAddNode: function(x, y) {
            var nodes = this.nodeLists[this._areaIndexOfPos(x, y)];
            var rect = {
                x: x - NODE_RADIUS,
                y: y - NODE_RADIUS,
                width: NODE_RADIUS * 2,
                height: NODE_RADIUS * 2
            };
            for (var i = nodes.length - 1; i >= 0; i--) {
                var n2 = nodes[i];
                if (intersect(n2.shape.getBounds(), rect)) {
                    return false;
                }
            }
            return true;
        },
        /**
         * ノードを削除する
         * @param a エリア番号
         * @param i エリア内インデックス
         */
        removeNodeAt: function(a, i) {
            var n = this.nodeLists[a][i];
            this.nodeLists[a].splice(i, 1);
            this.container.removeChild(n.shape);
            n.shape.destroy();
            // console.log([n.id, 'is destroyed']);
        },
        /**
         * エリア番号を返す
         * @param n
         * @returns {number}
         * @private
         */
        _areaIndexOf: function(n) {
            return this._areaIndexOfPos(0, n.pos().y);
        },
        /**
         * エリア番号を返す
         * @param x
         * @param y
         * @returns {number}
         * @private
         */
        _areaIndexOfPos: function(x, y) {
            return Math.max(0, Math.min(MAP_DIVISION - 1, Math.floor(MAP_DIVISION * y / this.height)));
        },
        /**
         * エリアを表す矩形を返す
         * @param a
         * @private
         */
        _areaRect: function(a) {
            var h = this.height / MAP_DIVISION;
            return {
                x: 0,
                y: h * a,
                width: this.width,
                height: h
            };
        },
        /**
         * ノードを更新する
         */
        updateNodes: function() {
            // nextを評価したノードを記録しておく
            var doneIds = {};
            for (var a = this.nodeLists.length - 1; a >= 0; a--) {
                var nodes = this.nodeLists[a];
                for (var i = nodes.length - 1; i >= 0; i--) {
                    var n = nodes[i];
                    if (doneIds[n.id]) {
                        continue;
                    }
                    doneIds[n.id] = true;
                    this.strategy.decide(n);
                    n.next();
                    var nrc = n.shape.getBounds();
                    if (intersect(nrc, {x:0, y:0, width:this.width, height:this.height})) {
                        var ta = this._areaIndexOf(n);
                        if (a != ta) {
                            // console.log(['move to', a, 'to', ta]);
                            nodes.splice(i, 1);
                            this.nodeLists[ta].push(n);
                        }
                    } else {
                        // 画面外に出たNodeは削除する
                        this.removeNodeAt(a, i);
                    }
                }
            }
        },
        /**
         * このまま行ったらぶつかるノードのうち一番近いもの
         * @param {Node} n ノード
         * @param {Number} frames フレーム数分未来を計算する
         */
        crushingNode: function(n, frames) {
            var currPos = n.pos();
            var futureLine = [currPos, n.futurePos(frames)];
            var found = null;
            for (var a = this._areaIndexOf(n); a >= 0; a--) {
                if (!lineCrossRect(futureLine, this._areaRect(a))) {
                    break;
                }
                var nodes = this.nodeLists[a];
                var minD = Number.MAX_VALUE;
                for (var i = nodes.length - 1; i>= 0; i--) {
                    var n2 = nodes[i];
                    if (n.id != n2.id) {
                        if (lineCrossRect(futureLine, n2.shape.getBounds())) {
                            var d = distance(currPos, n2.pos());
                            if (d < minD) {
                                minD = d;
                                found = n2;
                            }
                        }
                    }
                }
                if (found != null) {
                    // console.log(['crushing', n, found]);
                    return {
                        node: found,
                        distance: minD
                    };
                }
            }
            return null;
        }
    };


    /**
     * Nodeを自動生成するオブジェクト
     */
    function Generator(def, map) {
        this.def = def;
        this.map = map;
    };
    Generator.prototype = {
        /**
         * @member {
         *   generate:{function}
         *   onAdded:{function}
         * }
         */
        def: null,
        /**
         * @member {Map}
         */
        map: null,
        /**
         * Nodeを発生させる
         */
        estimateGenerate: function() {
            var p = this.def.generate();
            if (p) {
                if (this.map.canAddNode(p.x, p.y)) {
                    var n = new Node();
                    n.setPos(p.x, p.y);
                    n.speed.x = p.speedX;
                    n.speed.y = p.speedY;
                    this.map.addNode(n);
                    this.def.onAdded();
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
        this.speed = {
            x: 0,
            y: 0
        };
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
         * 速度
         */
        speed: {
            x: 0,
            y: 0
        },
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
         * 未来位置を返す
         * @param {Number} frames フレーム数
         */
        futurePos: function(frames) {
            var p = this.pos();
            return {
                x: p.x + this.speed.x * this.acceleration * frames,
                y: p.y + this.speed.y * this.acceleration * frames
            };
        },
        /**
         * 更新する
         */
        next: function() {
            var fp = this.futurePos(1);
            this.setPos(fp.x, fp.y);
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
