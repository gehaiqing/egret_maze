//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView: LoadingUI;
    private step: number;
    private playing: boolean;
    private _lastTime: number;
    private _lastCreateTime: number;
    private _sky;
    private _circle: egret.Shape;
    private _xspeed = 0;
    private _yspeed = 0;
    private _lines: Array<Array<number>> = [];
    private _range;
    private radius = 50;
    private _cols = 10;
    private _lineWidth = 3;
    public constructor() {
        super();
        this.step = 4;
        this.playing = false;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    public getStep(): number {
        return this.step;
    }

    public getPlaying(): boolean {
        return this.playing;
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {
                // console.log('hello,world2')
            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }


        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event: RES.ResourceEvent) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event: RES.ResourceEvent) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield: egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        this.stage.scaleMode = egret.StageScaleMode.FIXED_WIDTH;
        let sky = mm.Util.createBitmapByName("bg_jpg");
        // this.addChild(sky);
        let stageW = this.stage.stageWidth;
        let stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;

        // this._sky = sky;

        var bgShape: egret.Shape = new egret.Shape();
        bgShape.width = stageW;
        bgShape.height = stageH;
        bgShape.graphics.beginFill(0x000000, 1);
        bgShape.graphics.drawRect(0, 0, stageW, stageH);
        bgShape.graphics.endFill();
        this.addChild(bgShape);

        var circle: egret.Shape = new egret.Shape();
        circle.graphics.beginFill(0xff0000, 1);
        this.radius = (this.stage.stageWidth / this._cols) / 4;
        circle.graphics.drawCircle(0, 0, this.radius);
        circle.graphics.endFill();
        circle.x = this.radius;
        circle.y = this.radius;
        this.addChild(circle);
        this._circle = circle;
        let offsetX: number;
        let offsetY: number;
        // circle.touchEnabled = true;
        circle.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function (e: egret.TouchEvent) {
            console.log('start');
            offsetX = e.stageX - circle.x;
            offsetY = e.stageY - circle.y;
            this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this)
        }, this);
        function onMove(e: egret.TouchEvent) {
            circle.x = e.stageX - offsetX;
            circle.y = e.stageY - offsetY;
        }
        circle.addEventListener(egret.TouchEvent.TOUCH_END, function () {
            console.log('end');
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this);
        }, this);
        this._addCircleEvent();
        this.genGrid();
        this.startGame();
    }

    private _addCircleEvent() {
        var maxSpeed = 20,
            minCor = 10;
        var self = this;
        window.addEventListener('deviceorientation', function (e) {
            //beta是上下，gamma是左右
            if (Math.abs(e.beta) > minCor) { //下
                self._yspeed = e.beta / 90 * maxSpeed;
            } else {
                self._yspeed = 0;
            }

            if (Math.abs(e.gamma) > minCor) {
                self._xspeed = e.gamma / 90 * maxSpeed;
            } else {
                self._xspeed = 0;
            }
        })

        // this.drawLines();
    }
    private drawLines() {
        // this._lines = [[0, 500, 500, 505], [60, 400, 539, 405], [560, 60, 565, 860]];
        this._lines.forEach(line => {
            var bgShape: egret.Shape = new egret.Shape();
            bgShape.graphics.lineStyle(this._lineWidth, 0xFF0000);
            bgShape.graphics.moveTo(line[0], line[1]);
            bgShape.graphics.lineTo(line[2], line[3]);
            this.addChild(bgShape);
        })
    }
    private genGrid() {//生成网格
        var cols = this._cols, rows;
        rows = Math.floor(this.stage.stageHeight / (this.stage.stageWidth / cols));
        var grids = [];
        for (let i = 0; i < rows; i++) {
            grids[i] = [];
            for (let j = 0; j < cols; j++) {
                grids[i].push({
                    x: j,
                    y: i,
                    top: false,
                    bottom: false,
                    left: false,
                    right: false,
                    visited: false
                })
            }
        }

        var routeGrids = [];
        grids[0][0].visited = true;
        grids[0][0].top = true;
        grids[rows - 1][cols - 1].bottom = true;
        routeGrids.push(grids[0][0]);
        this.genRoute(grids, grids[0][0], routeGrids);
        this.drawGrid(grids);
        this.genBoundLines(grids);
    }
    /**
     * 生成迷宫
     */
    private genRoute(grids, cur, routes) {
        var nears = [];
        let x = cur.x, y = cur.y;
        if (x > 0 && !grids[y][x - 1].visited) {//左边
            nears.push(grids[y][x - 1]);
        }
        if (y > 0 && !grids[y - 1][x].visited) {//上边
            nears.push(grids[y - 1][x]);
        }
        if (x < (this._cols - 1) && !grids[y][x + 1].visited) {//右边
            nears.push(grids[y][x + 1]);
        }

        if (y < (grids.length - 1) && !grids[y + 1][x].visited) {//下边
            nears.push(grids[y + 1][x]);
        }
        if (nears.length) {//如果有未访问到的格子
            let nextIndex = Math.floor(Math.random() * nears.length);
            let next = nears[nextIndex];
            next.visited = true;
            if (cur.x < next.x) {
                next.left = true;
                cur.right = true;
            }
            if (cur.x > next.x) {
                next.right = true;
                cur.left = true;
            }
            if (cur.y < next.y) {
                next.top = true;
                cur.bottom = true;
            }
            if (cur.y > next.y) {
                next.bottom = true;
                cur.top = true;
            }

            routes.push(next);
            this.genRoute(grids, next, routes);
        } else {//没有就回归
            let next = routes.pop();
            if (next) {
                this.genRoute(grids, next, routes);
            }
        }
    }
    /**
     * 生成边界线条
     */
    private genBoundLines(grids) {
        let lines = [];
        let linesMap = {};
        let tmp;
        let gridWidth = this.stage.stageWidth / this._cols;
        for (let i = 0; i < grids.length; i++) {
            for (let j = 0; j < grids[0].length; j++) {
                tmp = grids[i][j];
                if (!tmp.top) {
                    linesMap[tmp.x + '_' + tmp.y + '_h'] = {
                        x1: tmp.x * gridWidth,
                        y1: tmp.y * gridWidth,
                        x2: (tmp.x + 1) * gridWidth,
                        y2: tmp.y * gridWidth + this._lineWidth
                    };
                }
                if (!tmp.bottom) {
                    linesMap[tmp.x + '_' + (tmp.y + 1) + '_h'] = {
                        x1: tmp.x * gridWidth,
                        y1: (tmp.y + 1) * gridWidth,
                        x2: (tmp.x + 1) * gridWidth,
                        y2: (tmp.y + 1) * gridWidth + this._lineWidth
                    };
                }
                if (!tmp.left) {
                    linesMap[tmp.x + '_' + tmp.y + '_v'] = {
                        x1: tmp.x * gridWidth,
                        y1: tmp.y * gridWidth,
                        x2: tmp.x * gridWidth + this._lineWidth,
                        y2: (tmp.y + 1) * gridWidth
                    };
                }
                if (!tmp.right) {
                    linesMap[(tmp.x + 1) + '_' + tmp.y + '_v'] = {
                        x1: (tmp.x + 1) * gridWidth,
                        y1: tmp.y * gridWidth,
                        x2: (tmp.x + 1) * gridWidth + this._lineWidth,
                        y2: (tmp.y + 1) * gridWidth
                    };
                }
            }
        }

        for (let k in linesMap) {
            tmp = linesMap[k];
            lines.push([
                tmp.x1, tmp.y1, tmp.x2, tmp.y2
            ])
        }
        this._lines = lines;
        // this.drawLines();
    }
    /**
     * 画出格子
     */
    private drawGrid(grids: Array<Array<any>>) {
        var w = this.stage.stageWidth / this._cols;
        var g: egret.Shape = new egret.Shape();
        g.graphics.lineStyle(this._lineWidth, 0xFFFFFF);
        for (let ii in grids) {
            var grid = grids[ii];
            let i = Number(ii);
            for (let jj in grid) {
                let j = Number(jj);
                if (!grid[j].top) {
                    g.graphics.moveTo((j) * w, (i) * w);
                    g.graphics.lineTo((j + 1) * w, (i) * w)
                }
                if (!grid[j].bottom) {
                    g.graphics.moveTo((j) * w, (i + 1) * w);
                    g.graphics.lineTo((j + 1) * w, (i + 1) * w)
                }
                if (!grid[j].left) {
                    g.graphics.moveTo((j) * w, (i) * w);
                    g.graphics.lineTo((j) * w, (i + 1) * w)
                }
                if (!grid[j].right) {
                    g.graphics.moveTo((j + 1) * w, (i) * w);
                    g.graphics.lineTo((j + 1) * w, (i + 1) * w)
                }
            }
        }
        this.addChild(g);
    }
    /**
     * 获取边界
     */
    private getRange() {
        var range = {
            minX: this.radius + this._lineWidth,
            maxX: this.stage.stageWidth - this.radius,
            minY: this.radius + this._lineWidth,
            maxY: this.stage.stageHeight - this.radius
        }
        var x = this._circle.x, y = this._circle.y, r = this.radius;
        // x += r;
        // y += r;
        var x1, x2, y1, y2;
        this._lines.forEach(line => {
            //根据中心点坐标x，y坐标判断范围

            x1 = line[0];
            y1 = line[1];
            x2 = line[2];
            y2 = line[3];
            //判断左右边界。如果在墙的上下范围内
            if ((y1 > (y - r) && y1 < (y + r))
                || (y2 > (y - r) && y2 < (y + r))
                || ((y - r) > y1 && (y + r) < y2 && (y2 - y1) > (2 * r))) {
                if ((x + r) <= x1) {//物体在左边
                    if (range.maxX > (x1 - r - this._lineWidth)) {
                        range.maxX = x1 - r - this._lineWidth;
                    }
                } else if (x >= x2) {//物体在右边
                    if (range.minX < (x2 + r)) {
                        range.minX = x2 + r;
                    }
                }
            }

            //判断上下边界。如果在墙的左右范围
            if ((x1 > (x - r) && x1 < (x + r))
                || (x2 > (x - r) && x2 < (x + r))
                || ((x - r) > x1 && (x + r) < x2 && (x2 - x1) > (2 * r))) {
                if ((y + r) <= y1) {//物体在上边
                    if (range.maxY > (y1 - r - this._lineWidth / 2)) {
                        range.maxY = y1 - r - this._lineWidth / 2;
                    }
                } else if ((y - r) >= y2) {//物体在下边
                    if (range.minY < (y2 + r)) {
                        range.minY = y2 + r;
                    }
                }
            }
        })
        // console.log(y, range.maxY);
        return range;
    }
    private _updateCircle() {
        var range = this.getRange();
        var x = this._circle.x + this._xspeed,
            y = this._circle.y + this._yspeed;

        if (x > range.maxX) {
            this._circle.x = range.maxX;
        } else if (x < range.minX) {
            this._circle.x = range.minX;
        } else {
            this._circle.x = x;
        }

        if (y > range.maxY) {
            this._circle.y = range.maxY;
        } else if (y < range.minY) {
            this._circle.y = range.minY;
        } else {
            this._circle.y = y;
        }

    }

    private goStartScene() {

    }

    private startGame() {
        // this.playing = true;
        // let icon: mm.Flower = new mm.Flower();
        // this.addChild(icon);
        // this.flower = icon;
        // let m1: mm.material = new mm.material(this.flower.getObj());
        // this.addChild(m1);
        // this.materialList.push(m1);
        // this._lastTime = egret.getTimer();
        // this._lastCreateTime = this._lastTime;
        this.addEventListener(egret.Event.ENTER_FRAME, this.update, this);

        // let p1 = new egret.Sprite();
        // p1.graphics.beginFill(0xffffff);
        // p1.graphics.lineStyle(2,0xeeeeee);
        // p1.graphics.drawRoundRect(50,50,100,20,25,25);
        // p1.graphics.beginFill(0x0090ff);
        // p1.graphics.drawRoundRect(50,50,30,20,25,25);
        // this.addChild(p1);
    }

    private update() {
        let tmpList = [];
        this.processStep();
        // this._sky.x = this._sky.x-1;
        this._updateCircle();
    }


    private processStep() {
        let curTime = egret.getTimer();
        this.step = 4 + (curTime - this._lastTime) / 30000 * 4;
    }

    private stopGame() {

    }
}


