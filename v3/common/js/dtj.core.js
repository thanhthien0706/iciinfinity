var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var core;
            (function (core) {
                var EventDispatcher = (function () {
                    function EventDispatcher() {
                        this.listeners = new Array();
                        this.useDeltaTime = false;
                        this.isEnterFrame = false;
                    }
                    EventDispatcher.prototype.addEventListener = function (type, func) {
                        if (!this.listeners) {
                            this.listeners = new Array();
                        }
                        this.listeners.push({ type: type, func: func });
                    };
                    EventDispatcher.prototype.removeEventListener = function (type, func) {
                        var ls = this.listeners;
                        var tmp = new Array();
                        for (var i = 0, ln = ls.length; i < ln; i++) {
                            var ob = ls[i];
                            if (ob.type != type || ob.func != func) {
                                tmp.push(ob);
                            }
                        }
                        this.listeners = tmp;
                    };
                    EventDispatcher.prototype.dispatchEvent = function (evt) {
                        var ls = this.listeners;
                        if (!ls)
                            return;
                        for (var i = 0, ln = ls.length; i < ln; i++) {
                            var ob = ls[i];
                            if (ob.type == evt.type) {
                                ob.func(evt.args);
                            }
                        }
                    };
                    Object.defineProperty(EventDispatcher.prototype, "onEnterFrame", {
                        set: function (func) {
                            this.enterFrameFunc = func;
                            var scope = this;
                            if (this.useDeltaTime) {
                                if (!this.isEnterFrame) {
                                    this.isEnterFrame = true;
                                    var current = new Date().getTime();
                                    (function loop() {
                                        if (!scope.enterFrameFunc) {
                                            scope.isEnterFrame = false;
                                            return;
                                        }
                                        var tmp = new Date().getTime();
                                        var deltaTime = tmp - current;
                                        if (deltaTime < 0) {
                                            deltaTime = 1;
                                        }
                                        scope.enterFrameFunc(deltaTime);
                                        current = tmp;
                                        scope.intervalTimer = requestAnimationFrame(function () { return loop(); });
                                    })();
                                }
                            }
                            else {
                                if (!this.isEnterFrame) {
                                    this.isEnterFrame = true;
                                    (function loop() {
                                        if (!scope.enterFrameFunc) {
                                            scope.isEnterFrame = false;
                                            return;
                                        }
                                        scope.enterFrameFunc();
                                        scope.intervalTimer = requestAnimationFrame(function () { return loop(); });
                                    })();
                                }
                            }
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(EventDispatcher.prototype, "deleteEnterFrame", {
                        get: function () {
                            this.enterFrameFunc = null;
                            cancelAnimationFrame(this.intervalTimer);
                            this.intervalTimer = null;
                            return true;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return EventDispatcher;
                }());
                core.EventDispatcher = EventDispatcher;
            })(core = lib.core || (lib.core = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var debug;
            (function (debug) {
                var EventDispatcher = com.enirva.lib.core.EventDispatcher;
                var Debugger = (function (_super) {
                    __extends(Debugger, _super);
                    function Debugger() {
                        _super.apply(this, arguments);
                    }
                    Debugger.initialize = function () {
                        if (Debugger._instance == null) {
                            Debugger._instance = new Debugger();
                            Debugger._instance.logText = "";
                        }
                        Debugger.isDebug = true;
                        var tag = document.createElement("div");
                        tag.setAttribute("id", "ENIRVA_Debugger");
                        tag.style.position = "fixed";
                        tag.style.right = "0";
                        tag.style.bottom = "0";
                        tag.style.zIndex = "99999";
                        tag.style.margin = "0";
                        tag.style.padding = "5px";
                        tag.style.background = "rgba(30, 30, 30, 0.75)";
                        tag.style.minWidth = "100px";
                        tag.style.fontSize = "1.2em";
                        var fps = document.createElement("p");
                        fps.style.padding = "5px";
                        fps.style.margin = "0";
                        fps.style.fontSize = Debugger.fontSize;
                        fps.style.color = Debugger.fontColor;
                        fps.style.lineHeight = "1.5";
                        fps.innerHTML = "fps:0";
                        var text1 = document.createElement("input");
                        text1.setAttribute("type", "text");
                        var text2 = document.createElement("input");
                        text2.setAttribute("type", "text");
                        text1.style.width = text2.style.width = "50px";
                        Debugger._instance.text1 = text1;
                        Debugger._instance.text2 = text2;
                        var input = document.createElement("input");
                        input.setAttribute("type", "button");
                        input.setAttribute("value", "clear");
                        input.onclick = function () {
                            Debugger.clear();
                        };
                        text1.style.display = text2.style.display = input.style.display = "block";
                        var log = document.createElement("p");
                        log.style.padding = "5px";
                        log.style.margin = "0";
                        log.style.fontSize = Debugger.fontSize;
                        log.style.color = Debugger.fontColor;
                        log.style.lineHeight = "1.5";
                        tag.appendChild(fps);
                        tag.appendChild(text1);
                        tag.appendChild(text2);
                        tag.appendChild(input);
                        tag.appendChild(log);
                        Debugger._instance.logTag = log;
                        Debugger._instance.fpsTag = fps;
                        Debugger._instance.recFps();
                        document.body.appendChild(tag);
                    };
                    Debugger.log = function (msg) {
                        if (Debugger.isDebug) {
                            console.log(msg);
                            Debugger._instance.logText += msg + "<br>";
                            Debugger._instance.update();
                        }
                    };
                    Debugger.text = function (index, text) {
                        if (Debugger.isDebug) {
                            if (index == 0) {
                                Debugger._instance.text1.setAttribute("value", text);
                            }
                            else {
                                Debugger._instance.text2.setAttribute("value", text);
                            }
                        }
                    };
                    Debugger.clear = function () {
                        if (Debugger.isDebug) {
                            console.log("clear ok");
                            Debugger._instance.logText = "";
                            Debugger._instance.update();
                        }
                    };
                    Debugger.prototype.update = function () {
                        var deb = Debugger._instance;
                        deb.logTag.innerHTML = deb.logText;
                    };
                    Debugger.prototype.recFps = function () {
                        this.useDeltaTime = true;
                        var t = 0;
                        var cc = 0;
                        var tag = this.fpsTag;
                        this.onEnterFrame = function (deltaTime) {
                            cc++;
                            if ((t += deltaTime) >= 1000) {
                                tag.innerHTML = "fps:" + cc.toString();
                                t = 0;
                                cc = 0;
                            }
                        };
                    };
                    Debugger.fontSize = "0.6em";
                    Debugger.fontColor = "#fff";
                    return Debugger;
                }(EventDispatcher));
                debug.Debugger = Debugger;
            })(debug = lib.debug || (lib.debug = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var display;
            (function (display) {
                var EventDispatcher = com.enirva.lib.core.EventDispatcher;
                var Sprite = (function (_super) {
                    __extends(Sprite, _super);
                    function Sprite(target, def_props) {
                        if (def_props === void 0) { def_props = null; }
                        _super.call(this);
                        var tg = $(target);
                        this.element = tg;
                        this.useDigit = false;
                        this.x = 0;
                        this.y = 0;
                        this.alpha = 1;
                        this.scale = 1;
                        this._visible = true;
                        if (def_props != null) {
                            for (var prop in def_props) {
                                this[prop] = def_props[prop];
                            }
                        }
                        this.fixedScaleX = false;
                        this.fixedScaleY = false;
                        this.currAlpha = null;
                        this.displayName = "block";
                        this.update();
                    }
                    Object.defineProperty(Sprite.prototype, "rotation", {
                        get: function () {
                            return this._rotation;
                        },
                        set: function (value) {
                            this._rotation = value;
                            this.updateRotation = true;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Sprite.prototype.setAnchor = function (x, y) {
                        var sx = x + ((x != 0) ? "%" : "");
                        var sy = y + ((y != 0) ? "%" : "");
                        this.element.css("transformOrigin", sx + " " + sy);
                    };
                    Sprite.prototype.update = function (use_digit) {
                        if (use_digit === void 0) { use_digit = false; }
                        var sc_x = (this.fixedScaleX) ? 1 : this.scale;
                        var sc_y = (this.fixedScaleY) ? 1 : this.scale;
                        var mtx;
                        if (this.useDigit) {
                            mtx = 'matrix3d(' + sc_x + ', 0, 0, 0,   0, ' + sc_y + ', 0, 0,  0, 0, 1, 0,          ' + (this.x) + ', ' + (this.y) + ', 0, 1)';
                        }
                        else {
                            mtx = 'matrix3d(' + sc_x + ', 0, 0, 0,   0, ' + sc_y + ', 0, 0,  0, 0, 1, 0,          ' + (this.x >> 0) + ', ' + (this.y >> 0) + ', 0, 1)';
                        }
                        this.element.css("transform", mtx);
                        if (this.alpha != this.currAlpha) {
                            this.element.css("opacity", this.alpha);
                            this.currAlpha = this.alpha;
                        }
                    };
                    ;
                    Object.defineProperty(Sprite.prototype, "visible", {
                        get: function () {
                            return this._visible;
                        },
                        set: function (flag) {
                            this._visible = flag;
                            this.element.css("display", (flag) ? this.displayName : "none");
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return Sprite;
                }(EventDispatcher));
                display.Sprite = Sprite;
            })(display = lib.display || (lib.display = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var geom;
            (function (geom) {
                var MatrixSvg = (function () {
                    function MatrixSvg(args) {
                        if (args === void 0) { args = null; }
                        if (!args) {
                            this.n11 = 1;
                            this.n12 = 0;
                            this.n13 = 0;
                            this.n21 = 0;
                            this.n22 = 1;
                            this.n23 = 0;
                            this.n31 = 0;
                            this.n32 = 0;
                            this.n33 = 1;
                        }
                        else {
                            this.n11 = args[0];
                            this.n12 = args[1];
                            this.n13 = args[2];
                            this.n21 = args[3];
                            this.n22 = args[4];
                            this.n23 = args[5];
                            this.n31 = 0;
                            this.n32 = 0;
                            this.n33 = 1;
                        }
                    }
                    MatrixSvg.prototype.reset = function () {
                        this.n11 = 1;
                        this.n12 = 0;
                        this.n13 = 0;
                        this.n21 = 0;
                        this.n22 = 1;
                        this.n23 = 0;
                        this.n31 = 0;
                        this.n32 = 0;
                        this.n33 = 1;
                    };
                    MatrixSvg.prototype.multiply = function (m) {
                        var d11 = this.n11, d12 = this.n12, d13 = this.n13;
                        var d21 = this.n21, d22 = this.n22, d23 = this.n23;
                        var d31 = this.n31, d32 = this.n32, d33 = this.n33;
                        this.n11 = d11 * m.n11 + d12 * m.n21 + d13 * m.n31;
                        this.n12 = d11 * m.n12 + d12 * m.n22 + d13 * m.n32;
                        this.n13 = d11 * m.n13 + d12 * m.n23 + d13 * m.n33;
                        this.n21 = d21 * m.n11 + d22 * m.n21 + d23 * m.n31;
                        this.n22 = d21 * m.n12 + d22 * m.n22 + d23 * m.n32;
                        this.n23 = d21 * m.n13 + d22 * m.n23 + d23 * m.n33;
                        this.n31 = d31 * m.n11 + d32 * m.n21 + d33 * m.n31;
                        this.n32 = d31 * m.n12 + d32 * m.n22 + d33 * m.n32;
                        this.n33 = d31 * m.n13 + d32 * m.n23 + d33 * m.n33;
                    };
                    MatrixSvg.prototype.toString = function () {
                        return "n11=" + this.n11 + ", n12=" + this.n12 + ", n13=" + this.n13 + ", n21=" + this.n21 + ", n22=" + this.n22 + ", n23=" + this.n23 + ", n31=" + this.n31 + ", n32=" + this.n32 + ", n33=" + this.n33;
                    };
                    MatrixSvg.prototype.transform3d = function () {
                        var enc = function (val) {
                            return Math.round(val * 10000) / 10000;
                        };
                        var str = "matrix(";
                        str += enc(this.n11) + ", " + enc(this.n21) + ", ";
                        str += enc(this.n12) + ", " + enc(this.n22) + ", ";
                        str += enc(this.n13) + ", " + enc(this.n23) + ")";
                        return str;
                    };
                    return MatrixSvg;
                }());
                geom.MatrixSvg = MatrixSvg;
            })(geom = lib.geom || (lib.geom = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var display;
            (function (display) {
                var EventDispatcher = com.enirva.lib.core.EventDispatcher;
                var MatrixSvg = com.enirva.lib.geom.MatrixSvg;
                var SvgSprite = (function (_super) {
                    __extends(SvgSprite, _super);
                    function SvgSprite(target, def_props) {
                        if (def_props === void 0) { def_props = null; }
                        _super.call(this);
                        this.mtxRot = new MatrixSvg();
                        this.mtxScale = new MatrixSvg();
                        var tg = $(target);
                        this.element = tg;
                        this.useDigit = false;
                        this.x = 0;
                        this.y = 0;
                        this.alpha = 1;
                        this._scaleX = 1;
                        this._scaleY = 1;
                        this.rotation = 0;
                        this._visible = true;
                        if (def_props != null) {
                            for (var prop in def_props) {
                                this[prop] = def_props[prop];
                            }
                        }
                        this.fixedScaleX = false;
                        this.fixedScaleY = false;
                        this.currAlpha = null;
                        this.displayName = "block";
                        this.update();
                    }
                    Object.defineProperty(SvgSprite.prototype, "scaleX", {
                        get: function () {
                            return this._scaleX;
                        },
                        set: function (value) {
                            this._scaleX = value;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(SvgSprite.prototype, "scaleY", {
                        get: function () {
                            return this._scaleY;
                        },
                        set: function (value) {
                            this._scaleY = value;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(SvgSprite.prototype, "rotation", {
                        get: function () {
                            return this._rotation;
                        },
                        set: function (value) {
                            this._rotation = value;
                            this.updateRotation = true;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    SvgSprite.prototype.update = function (use_digit) {
                        if (use_digit === void 0) { use_digit = false; }
                        var sc_x = (this.fixedScaleX) ? 1 : this.scaleX;
                        var sc_y = (this.fixedScaleY) ? 1 : this.scaleY;
                        var mtx;
                        this.mtxScale.reset();
                        this.mtxScale.n11 = sc_x;
                        this.mtxScale.n22 = sc_y;
                        var r = this.rotation / 180 * Math.PI;
                        this.mtxRot.reset();
                        this.mtxRot.n11 = Math.cos(r);
                        this.mtxRot.n12 = -Math.sin(r);
                        this.mtxRot.n21 = Math.sin(r);
                        this.mtxRot.n22 = Math.cos(r);
                        this.mtxRot.multiply(this.mtxScale);
                        this.mtxRot.n13 = this.x;
                        this.mtxRot.n23 = this.y;
                        if (this.updateRotation || (this.rotation != 0)) {
                            mtx = this.mtxRot.transform3d();
                            this.updateRotation = false;
                        }
                        else {
                            mtx = "matrix(" + sc_x + ", 0, 0, " + sc_y + ", " + this.x + "," + this.y + ")";
                        }
                        this.element.attr("transform", mtx);
                    };
                    ;
                    Object.defineProperty(SvgSprite.prototype, "visible", {
                        get: function () {
                            return this._visible;
                        },
                        set: function (flag) {
                            this._visible = flag;
                            this.element.css("display", (flag) ? this.displayName : "none");
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return SvgSprite;
                }(EventDispatcher));
                display.SvgSprite = SvgSprite;
            })(display = lib.display || (lib.display = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var tween;
            (function (tween) {
                var Tween = (function () {
                    function Tween() {
                    }
                    Tween.fadeIn = function (spt, sp, cb_func) {
                        if (sp === void 0) { sp = null; }
                        if (cb_func === void 0) { cb_func = null; }
                        sp = (sp != null) ? sp : 0.1;
                        spt.onEnterFrame = function () {
                            if ((spt.alpha += sp) >= 0.9) {
                                spt.alpha = 1;
                                spt.deleteEnterFrame;
                                if (cb_func) {
                                    cb_func();
                                }
                            }
                            spt.update();
                        };
                    };
                    Tween.fadeOut = function (spt, sp, cb_func) {
                        if (sp === void 0) { sp = null; }
                        if (cb_func === void 0) { cb_func = null; }
                        sp = (sp != null) ? sp : 0.1;
                        spt.onEnterFrame = function () {
                            if ((spt.alpha -= sp) <= 0.1) {
                                spt.alpha = 0;
                                spt.deleteEnterFrame;
                                if (cb_func) {
                                    cb_func();
                                }
                            }
                            spt.update();
                        };
                    };
                    Tween.motion = function (spt, prop_array, end_array, sp, delay, threshold, cb_func) {
                        if (delay === void 0) { delay = null; }
                        if (threshold === void 0) { threshold = null; }
                        if (cb_func === void 0) { cb_func = null; }
                        var sa = 0;
                        var curr = {};
                        var tmps = {};
                        var end = {};
                        var ln = prop_array.length;
                        var diff = (threshold) ? threshold : 0.002;
                        for (var i = 0; i < ln; i++) {
                            var prop = prop_array[i];
                            curr[prop] = spt[prop];
                            tmps[prop] = 0;
                            end[prop] = end_array[i];
                        }
                        var flag = true;
                        var cc = 0;
                        if (delay != null) {
                            cc = delay;
                        }
                        var c = 0;
                        spt.onEnterFrame = function () {
                            if (--cc <= 0) {
                                spt.deleteEnterFrame;
                                spt.onEnterFrame = function () {
                                    c++;
                                    sa += sp;
                                    flag = true;
                                    for (var prop in curr) {
                                        curr[prop] += tmps[prop] = (end[prop] - curr[prop]) * sa;
                                        if (Math.abs(tmps[prop]) < diff) {
                                            curr[prop] = end[prop];
                                        }
                                        else {
                                            flag = false;
                                        }
                                        spt[prop] = curr[prop];
                                        spt.update();
                                    }
                                    if (flag) {
                                        spt.deleteEnterFrame;
                                        if (cb_func) {
                                            cb_func();
                                        }
                                    }
                                };
                            }
                        };
                    };
                    Tween.motionSpring = function (spt, prop_array, end_array, sp1, sp2, limit, cb_func) {
                        if (limit === void 0) { limit = null; }
                        if (cb_func === void 0) { cb_func = null; }
                        var curr = {};
                        var tmps = {};
                        var end = {};
                        var ln = prop_array.length;
                        var lim = (limit) ? limit : 0.006;
                        for (var i = 0; i < ln; i++) {
                            var prop = prop_array[i];
                            curr[prop] = spt[prop];
                            tmps[prop] = 0;
                            end[prop] = end_array[i];
                        }
                        var flag = true;
                        spt.onEnterFrame = function () {
                            flag = true;
                            for (var prop in curr) {
                                curr[prop] += tmps[prop] = (end[prop] - curr[prop]) / sp1 + tmps[prop] * sp2;
                                if (Math.abs(tmps[prop]) < lim) {
                                    curr[prop] = end[prop];
                                }
                                else {
                                    flag = false;
                                }
                                spt[prop] = curr[prop];
                                spt.update();
                            }
                            if (flag) {
                                spt.deleteEnterFrame;
                                if (cb_func) {
                                    cb_func();
                                }
                            }
                        };
                    };
                    Tween.motionSvg = function (spt, prop_array, end_array, sp, delay, threshold, cb_func) {
                        if (delay === void 0) { delay = null; }
                        if (threshold === void 0) { threshold = null; }
                        if (cb_func === void 0) { cb_func = null; }
                        var sa = 0;
                        var curr = {};
                        var tmps = {};
                        var end = {};
                        var ln = prop_array.length;
                        var diff = (threshold) ? threshold : 0.002;
                        for (var i = 0; i < ln; i++) {
                            var prop = prop_array[i];
                            curr[prop] = spt[prop];
                            tmps[prop] = 0;
                            end[prop] = end_array[i];
                        }
                        var flag = true;
                        var cc = 0;
                        if (delay != null) {
                            cc = delay;
                        }
                        spt.onEnterFrame = function () {
                            if (--cc <= 0) {
                                spt.deleteEnterFrame;
                                spt.onEnterFrame = function () {
                                    sa += sp;
                                    flag = true;
                                    for (var prop in curr) {
                                        curr[prop] += tmps[prop] = (end[prop] - curr[prop]) * sa;
                                        if (Math.abs(tmps[prop]) < diff) {
                                            curr[prop] = end[prop];
                                        }
                                        else {
                                            flag = false;
                                        }
                                        spt[prop] = curr[prop];
                                        spt.update();
                                    }
                                    if (flag) {
                                        spt.deleteEnterFrame;
                                        if (cb_func) {
                                            cb_func();
                                        }
                                    }
                                };
                            }
                        };
                    };
                    Tween.motionCSS = function (spt, prop_array, start_array, end_array, sp, delay, threshold, cb_func, enterFrameObj) {
                        if (delay === void 0) { delay = null; }
                        if (threshold === void 0) { threshold = null; }
                        if (cb_func === void 0) { cb_func = null; }
                        if (enterFrameObj === void 0) { enterFrameObj = null; }
                        var sa = 0;
                        var curr = {};
                        var tmps = {};
                        var end = {};
                        var ln = prop_array.length;
                        var diff = (threshold) ? threshold : 0.002;
                        for (var i = 0; i < ln; i++) {
                            var prop = prop_array[i];
                            curr[prop] = start_array[i];
                            tmps[prop] = 0;
                            end[prop] = end_array[i];
                        }
                        var flag = true;
                        var cc = 0;
                        if (delay != null) {
                            cc = delay;
                        }
                        var tg = spt;
                        if (enterFrameObj != null) {
                            tg = enterFrameObj;
                        }
                        tg.onEnterFrame = function () {
                            if (--cc <= 0) {
                                tg.deleteEnterFrame;
                                tg.onEnterFrame = function () {
                                    sa += sp;
                                    flag = true;
                                    for (var prop in curr) {
                                        curr[prop] += tmps[prop] = (end[prop] - curr[prop]) * sa;
                                        if (Math.abs(tmps[prop]) < diff) {
                                            curr[prop] = end[prop];
                                        }
                                        else {
                                            flag = false;
                                        }
                                        spt.element.css(prop, curr[prop]);
                                    }
                                    if (flag) {
                                        tg.deleteEnterFrame;
                                        if (cb_func) {
                                            cb_func();
                                        }
                                    }
                                };
                            }
                        };
                    };
                    Tween.delay = function (spt, time, cb_func) {
                        if (cb_func === void 0) { cb_func = null; }
                        spt.onEnterFrame = function () {
                            if (--time <= 0) {
                                spt.deleteEnterFrame;
                                if (cb_func != null) {
                                    cb_func();
                                }
                            }
                        };
                    };
                    return Tween;
                }());
                tween.Tween = Tween;
            })(tween = lib.tween || (lib.tween = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var dtj;
            (function (dtj) {
                var EventDispatcher = com.enirva.lib.core.EventDispatcher;
                var Tween = com.enirva.lib.tween.Tween;
                var FadeObject = (function (_super) {
                    __extends(FadeObject, _super);
                    function FadeObject(spt) {
                        _super.call(this);
                        this.type = 0;
                        var tag = spt.element.prop("tagName").toLowerCase();
                        if (tag == "img") {
                            this.type = 1;
                        }
                        else if (tag == "h2") {
                            this.type = 2;
                        }
                        spt.update();
                        this.spt = spt;
                        this.isShown = false;
                    }
                    FadeObject.prototype.showInit = function (hh) {
                        var elm = this.spt;
                        var top = $(elm.element).offset().top;
                        var is_cutin = top < hh;
                        if (is_cutin) {
                            if (!this.isShown) {
                                this.isShown = true;
                                elm.x = 0;
                                elm.y = 0;
                                elm.alpha = 1;
                                elm.update();
                            }
                        }
                        else {
                            this.isShown = false;
                            elm.alpha = 0;
                            elm.update();
                        }
                    };
                    FadeObject.prototype.showMobile = function () {
                        var elm = this.spt;
                        elm.alpha = 1;
                        elm.x = 0;
                        elm.y = 0;
                        elm.update();
                        this.isShown = true;
                    };
                    FadeObject.prototype.update = function (hh) {
                        var elm = this.spt;
                        var top = $(elm.element).offset().top;
                        var is_cutin = top < hh;
                        if (is_cutin) {
                            if (!this.isShown) {
                                this.show(top);
                            }
                        }
                        else {
                        }
                    };
                    FadeObject.prototype.show = function (top_h) {
                        this.isShown = true;
                        var elm = this.spt;
                        var delay = top_h / 500;
                        var scope = this;
                        switch (this.type) {
                            case 0:
                                Tween.motion(elm, ["alpha"], [1], 0.015, delay, null);
                                break;
                            case 1:
                                Tween.motion(elm, ["alpha"], [1], 0.015, delay, null);
                                break;
                            case 2:
                                elm.x = 20;
                                Tween.motion(elm, ["x", "alpha"], [0, 1], 0.015, delay, null, function () {
                                    var sa = 0;
                                    var tmp;
                                    var w = 0;
                                    var end_w = 800;
                                    elm.onEnterFrame = function () {
                                        sa += 0.0025;
                                        w += tmp = (end_w - w) * sa;
                                        if (Math.abs(tmp) < 0.02) {
                                            elm.deleteEnterFrame;
                                        }
                                    };
                                });
                                break;
                            default: break;
                        }
                    };
                    ;
                    return FadeObject;
                }(EventDispatcher));
                dtj.FadeObject = FadeObject;
            })(dtj = lib.dtj || (lib.dtj = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var model;
            (function (model) {
                var UserAgent = (function () {
                    function UserAgent(singleton) {
                    }
                    Object.defineProperty(UserAgent, "isMobile", {
                        get: function () {
                            this.initialize();
                            return this._instance._isMobile;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    UserAgent.isMac = function () {
                        this.initialize();
                        return this._instance._isMac;
                    };
                    UserAgent.initialize = function () {
                        if (UserAgent._instance == null) {
                            UserAgent._instance = new UserAgent(new UserAgentSingleton());
                            var agent = navigator.userAgent;
                            UserAgent._instance._isMac = agent.indexOf('Mac') >= 0;
                            var isIOS = agent.indexOf('iPhone') > -1 || agent.indexOf('iPod') > -1 || agent.indexOf('iPad') > -1;
                            var isAndroid = agent.indexOf('Android') > -1;
                            UserAgent._instance._isMobile = isIOS || isAndroid;
                        }
                    };
                    return UserAgent;
                }());
                model.UserAgent = UserAgent;
                var UserAgentSingleton = (function () {
                    function UserAgentSingleton() {
                    }
                    return UserAgentSingleton;
                }());
            })(model = lib.model || (lib.model = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var dtj;
            (function (dtj) {
                var EventDispatcher = com.enirva.lib.core.EventDispatcher;
                var Sprite = com.enirva.lib.display.Sprite;
                var FadeObject = com.enirva.lib.dtj.FadeObject;
                var UserAgent = com.enirva.lib.model.UserAgent;
                var FadeObjectController = (function (_super) {
                    __extends(FadeObjectController, _super);
                    function FadeObjectController() {
                        _super.call(this);
                        this.fadeObjects = new Array();
                        var scope = this;
                        var h = window.innerHeight ? window.innerHeight : $(window).height();
                        var curr = document.documentElement.scrollTop || document.body.scrollTop;
                        var hh = curr + h - 50;
                        $(".fadeObject").each(function (index, elem) {
                            var spt = new Sprite($(elem), { alpha: 0 });
                            var obj = new FadeObject(spt);
                            obj.showInit(hh);
                            scope.fadeObjects.push(obj);
                        });
                        if (UserAgent.isMobile) {
                            var elements = scope.fadeObjects;
                            for (var i = 0, ln = elements.length; i < ln; i++) {
                                var elm = elements[i];
                                elm.showMobile();
                            }
                        }
                        else {
                            this.startScrollCheck();
                        }
                    }
                    FadeObjectController.prototype.startScrollCheck = function () {
                        var scope = this;
                        this.onEnterFrame = function () {
                            var h = window.innerHeight ? window.innerHeight : $(window).height();
                            var curr = document.documentElement.scrollTop || document.body.scrollTop;
                            var hh = curr + h - 50;
                            var elements = scope.fadeObjects;
                            for (var i = 0, ln = elements.length; i < ln; i++) {
                                var elm = elements[i];
                                elm.update(hh);
                            }
                        };
                    };
                    FadeObjectController.prototype.stopScrollCheck = function () {
                    };
                    return FadeObjectController;
                }(EventDispatcher));
                dtj.FadeObjectController = FadeObjectController;
            })(dtj = lib.dtj || (lib.dtj = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var dtj;
            (function (dtj) {
                var EventDispatcher = com.enirva.lib.core.EventDispatcher;
                var SvgSprite = com.enirva.lib.display.SvgSprite;
                var Tween = com.enirva.lib.tween.Tween;
                var UserAgent = com.enirva.lib.model.UserAgent;
                var GNavigation = (function (_super) {
                    __extends(GNavigation, _super);
                    function GNavigation() {
                        _super.call(this);
                        var scope = this;
                        $(".gnavi .btnOpenClose").bind("click", function () {
                            if (scope.isOpen) {
                                scope.isOpen = false;
                                $(".gnavi .main").removeClass("open");
                                $(".openNaviCover").removeClass("openNaviCoverShow");
                                scope.close();
                            }
                            else {
                                scope.isOpen = true;
                                $(".gnavi .main").addClass("open");
                                $(".openNaviCover").addClass("openNaviCoverShow");
                                scope.open();
                            }
                        });
                        this.btnLine0 = new SvgSprite($(".svgButton .bline0"), { x: 16, y: 7 });
                        this.btnLine1 = new SvgSprite($(".svgButton .bline1"), { x: 16, y: 16 });
                        this.btnLine2 = new SvgSprite($(".svgButton .bline2"), { x: 16, y: 25 });
                        if (!UserAgent.isMobile) {
                            var curr = document.documentElement.scrollTop || document.body.scrollTop;
                            var threshold = 500;
                            var isMin = curr > threshold;
                            if (isMin) {
                                $(".gnaviInner").addClass("min");
                            }
                            var prev = document.documentElement.scrollTop || document.body.scrollTop;
                            this.onEnterFrame = function () {
                                curr = document.documentElement.scrollTop || document.body.scrollTop;
                                var diff = curr - prev;
                                if (diff < -20) {
                                    if (isMin) {
                                        isMin = false;
                                        $(".gnaviInner").removeClass("min");
                                    }
                                }
                                else if (diff > 20) {
                                    if (!isMin) {
                                        isMin = true;
                                        $(".gnaviInner").addClass("min");
                                    }
                                }
                                prev = curr;
                            };
                        }
                    }
                    GNavigation.prototype.open = function () {
                        var scope = this;
                        var b0 = this.btnLine0;
                        var b1 = this.btnLine1;
                        var b2 = this.btnLine2;
                        Tween.motionSvg(b0, ["y"], [14], 0.015, null, 0.035, function () {
                            Tween.motionSvg(b0, ["rotation"], [45 * 3], 0.045, null, null);
                        });
                        Tween.motionSvg(b1, ["y", "scaleX"], [16, 0], 0.035, null, null);
                        Tween.motionSvg(b2, ["y"], [14], 0.015, null, 0.035, function () {
                            Tween.motionSvg(b2, ["rotation"], [-45 * 3], 0.045, null, null);
                        });
                    };
                    GNavigation.prototype.close = function () {
                        var b0 = this.btnLine0;
                        var b1 = this.btnLine1;
                        var b2 = this.btnLine2;
                        Tween.motionSvg(b0, ["rotation"], [0], 0.045, null, null, function () {
                            b0.scaleX = 0.1;
                            b0.update();
                            b1.scaleX = 0.6;
                            b1.update();
                            Tween.motionSvg(b0, ["y", "scaleX"], [7, 1], 0.045, null, 0.01);
                            Tween.motionSvg(b1, ["y", "scaleX"], [16, 1], 0.045, null, 0.01);
                        });
                        Tween.motionSvg(b2, ["rotation"], [0], 0.045, null, null, function () {
                            Tween.motionSvg(b2, ["y"], [25], 0.045, null, 0.01);
                        });
                    };
                    return GNavigation;
                }(EventDispatcher));
                dtj.GNavigation = GNavigation;
            })(dtj = lib.dtj || (lib.dtj = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var dtj;
            (function (dtj) {
                var EventDispatcher = com.enirva.lib.core.EventDispatcher;
                var Sprite = com.enirva.lib.display.Sprite;
                var Tween = com.enirva.lib.tween.Tween;
                var OurContentsItem = (function (_super) {
                    __extends(OurContentsItem, _super);
                    function OurContentsItem(element, href) {
                        _super.call(this);
                        var scope = this;
                        this.menus = [];
                        this.menuInner = new Sprite(element.find(".menuInner"));
                        element.find("ul li").each(function (index, elm) {
                            var spt = new Sprite($(elm));
                            spt.y = 0;
                            spt.alpha = 1;
                            spt.update();
                            spt.visible = false;
                            scope.menus.push(spt);
                        });
                        element.bind("mouseenter", function () {
                            if (window.innerWidth > 1100) {
                                element.addClass("open");
                                element.find(".img .cover").fadeIn(200);
                                scope.open();
                            }
                        });
                        element.bind("mouseleave", function () {
                            if (window.innerWidth > 1100) {
                                element.removeClass("open");
                                element.find(".img .cover").fadeOut(200);
                                scope.close();
                            }
                        });
                        element.bind("click", function () {
                            if (window.innerWidth <= 1100) {
                                location.href = href;
                            }
                        });
                        element.find(".img").bind("click", function () {
                            location.href = href;
                        });
                        this.element = element;
                        this.ul = new Sprite(this.element.find("ul"));
                    }
                    OurContentsItem.prototype.open = function () {
                        for (var i = 0; i < this.menus.length; i++) {
                            var spt = this.menus[i];
                            var y = (spt.element.height() * (i));
                            spt.y = y;
                            spt.update();
                            spt.visible = true;
                        }
                        var h = parseFloat(this.ul.element.css("height"));
                        Tween.motion(this.menuInner, ["y"], [-265], 0.015, null, 0.004);
                        Tween.motionCSS(this.ul, ["height"], [h], [275], 0.015, null, 0.004);
                    };
                    OurContentsItem.prototype.close = function () {
                        var h = parseFloat(this.ul.element.css("height"));
                        Tween.motion(this.menuInner, ["y"], [0], 0.015, null, 0.004);
                        Tween.motionCSS(this.ul, ["height"], [h], [0], 0.015, null, 0.004);
                    };
                    return OurContentsItem;
                }(EventDispatcher));
                dtj.OurContentsItem = OurContentsItem;
                var OurContents = (function (_super) {
                    __extends(OurContents, _super);
                    function OurContents() {
                        _super.call(this);
                        var scope = this;
                        this.buttons = [];
                        var links = [
                            "/about/",
                            "/company/",
                            "/recruit/"
                        ];
                        $(".ourContentsArea .box").each(function (index, elm) {
                            var item = new OurContentsItem($(elm), links[index]);
                            scope.buttons.push(item);
                        });
                    }
                    return OurContents;
                }(EventDispatcher));
                dtj.OurContents = OurContents;
            })(dtj = lib.dtj || (lib.dtj = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var dtj;
            (function (dtj) {
                var Debugger = com.enirva.lib.debug.Debugger;
                var EventDispatcher = com.enirva.lib.core.EventDispatcher;
                var Sprite = com.enirva.lib.display.Sprite;
                var Tween = com.enirva.lib.tween.Tween;
                var UserAgent = com.enirva.lib.model.UserAgent;
                var SubTextAnimation = (function (_super) {
                    __extends(SubTextAnimation, _super);
                    function SubTextAnimation() {
                        _super.call(this);
                        this.container = new Sprite($(".mainVisualArea .textContainer"));
                        this.title = new Sprite($(".mainVisualArea .title"), { alpha: 0 });
                        this.sub = new Sprite($(".mainVisualArea .sub"), { alpha: 0 });
                        this.text = new Sprite($(".mainVisualArea .text"), { alpha: 0 });
                        this.titleEnterFrame = new EventDispatcher();
                        if (this.sub.element.length == 0) {
                            this.sub = new Sprite($(".mainVisualArea .btn"), { alpha: 0 });
                        }
                        if (UserAgent.isMobile) {
                            this.title.alpha = 1;
                            this.title.update();
                            this.sub.alpha = 1;
                            this.sub.update();
                            this.text.alpha = 1;
                            this.text.update();
                        }
                        else {
                            this.isShown = true;
                            this.showAnim();
                            this.startScrollEffect();
                        }
                    }
                    SubTextAnimation.prototype.showAnim = function () {
                        var container = this.container;
                        var title = this.title;
                        var sub = this.sub;
                        var text = this.text;
                        var titleEnterFrame = this.titleEnterFrame;
                        Debugger.log("title " + title.element.height());
                        var h = title.element.height();
                        title.element.css("height", 0);
                        title.element.css("opacity", 1);
                        title.x = 0;
                        title.y = 20;
                        title.alpha = 1;
                        title.update();
                        Tween.motion(title, ["y"], [0], 0.015, null, 0.1);
                        Tween.motionCSS(title, ["height"], [0], [h], 0.015, null, 0.1, function () {
                            title.element.css("height", "auto");
                            text.x = 20;
                            text.update();
                            Tween.motion(text, ["x", "alpha"], [0, 1], 0.018, null, null);
                            sub.x = -20;
                            sub.update();
                            Tween.motion(sub, ["x", "alpha"], [0, 1], 0.018, null, null);
                        }, titleEnterFrame);
                        this.title = title;
                        var scope = this;
                        $(window).bind("resize", function () {
                            scope.onResize();
                        });
                    };
                    SubTextAnimation.prototype.hideAnim = function () {
                        var title = this.title;
                        var sub = this.sub;
                        var text = this.text;
                        Tween.motion(title, ["x", "alpha"], [-20, 0], 0.015, null, null);
                        Tween.motion(sub, ["x", "alpha"], [20, 0], 0.015, null, null);
                        Tween.motion(text, ["x", "alpha"], [-20, 0], 0.015, null, null);
                    };
                    SubTextAnimation.prototype.startScrollEffect = function () {
                        var scope = this;
                        this.onEnterFrame = function () {
                            var h = window.innerHeight ? window.innerHeight : $(window).height();
                            var curr = document.documentElement.scrollTop || document.body.scrollTop;
                            var hh = curr + h - 100;
                            Debugger.text(1, curr);
                            if (curr < 130) {
                                if (!scope.isShown) {
                                    scope.showAnim();
                                    scope.isShown = true;
                                }
                            }
                            else {
                                if (scope.isShown) {
                                    scope.hideAnim();
                                    scope.isShown = false;
                                }
                            }
                        };
                    };
                    SubTextAnimation.prototype.onResize = function () {
                    };
                    return SubTextAnimation;
                }(EventDispatcher));
                dtj.SubTextAnimation = SubTextAnimation;
            })(dtj = lib.dtj || (lib.dtj = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var dtj;
            (function (dtj) {
                var EventDispatcher = com.enirva.lib.core.EventDispatcher;
                var Sprite = com.enirva.lib.display.Sprite;
                var Tween = com.enirva.lib.tween.Tween;
                var UserAgent = com.enirva.lib.model.UserAgent;
                var TextAnimation = (function (_super) {
                    __extends(TextAnimation, _super);
                    function TextAnimation() {
                        _super.call(this);
                        this.showAnim();
                    }
                    TextAnimation.prototype.showAnim = function () {
                        var title = new Sprite($(".mainVisualArea .title"), { alpha: 0 });
                        var sub = new Sprite($(".mainVisualArea .sub"), { alpha: 0 });
                        var text = new Sprite($(".mainVisualArea .text"), { alpha: 0 });
                        var btn = new Sprite($(".mainVisualArea .btn"), { alpha: 0 });
                        var line = new Sprite($(".mainVisualArea .line"));
                        var w = title.element.width();
                        var h = title.element.height();
                        if (UserAgent.isMobile) {
                            title.alpha = 1;
                            title.update();
                            sub.alpha = 1;
                            sub.update();
                            text.alpha = 1;
                            text.update();
                            btn.alpha = 1;
                            btn.update();
                            line.element.css("width", w);
                        }
                        else {
                            title.element.css("height", 0);
                            title.element.css("opacity", 1);
                            Tween.motionCSS(line, ["width"], [0], [w], 0.015, null, null, function () {
                                Tween.motionCSS(title, ["height"], [0], [h], 0.015, null, null, function () {
                                    title.element.css("height", "auto");
                                    text.x = 20;
                                    text.update();
                                    Tween.motion(text, ["x", "alpha"], [0, 1], 0.015, null, null);
                                    btn.x = -20;
                                    btn.update();
                                    Tween.motion(btn, ["x", "alpha"], [0, 1], 0.015, null, null);
                                    Tween.motion(sub, ["alpha"], [1], 0.015, null, null);
                                });
                            });
                            this.title = title;
                            this.line = line;
                        }
                        var scope = this;
                        $(window).bind("resize", function () {
                            scope.onResize();
                        });
                    };
                    TextAnimation.prototype.onResize = function () {
                        if (this.line != null) {
                            this.line.element.css("width", this.title.element.width());
                        }
                    };
                    return TextAnimation;
                }(EventDispatcher));
                dtj.TextAnimation = TextAnimation;
            })(dtj = lib.dtj || (lib.dtj = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
var com;
(function (com) {
    var enirva;
    (function (enirva) {
        var lib;
        (function (lib) {
            var dtj;
            (function (dtj) {
                var EventDispatcher = com.enirva.lib.core.EventDispatcher;
                var Sprite = com.enirva.lib.display.Sprite;
                var Tween = com.enirva.lib.tween.Tween;
                var UserAgent = com.enirva.lib.model.UserAgent;
                var TopBillboard = (function (_super) {
                    __extends(TopBillboard, _super);
                    function TopBillboard() {
                        _super.call(this);
                        this.INTERVAL = 5000;
                        this.currentIndex = 0;
                        this.photos = [];
                        this.thumbs = [];
                        this.isFirst = true;
                        this.locked = false;
                        var scope = this;
                        $(".mainVisualArea .photo").each(function (index, elm) {
                            scope.photos.push(new Sprite($(elm)));
                        });
                        $(".mainVisualArea .thumbContainer li").each(function (index, elm) {
                            var thumb = $(elm);
                            scope.thumbs.push(thumb);
                            scope.setThumb(thumb, index);
                        });
                        if (UserAgent.isMobile) {
                            var spPhoto = this.photos[0];
                            spPhoto.alpha = 1;
                            spPhoto.update();
                            spPhoto.element.css("width", "100%");
                        }
                        else {
                            this.change(0);
                        }
                        this.onResize();
                        $(window).bind("resize", function () {
                            scope.onResize();
                        });
                    }
                    TopBillboard.prototype.setThumb = function (thumb, index) {
                        var scope = this;
                        thumb.bind("click", function () {
                            if (!scope.locked) {
                                window.clearTimeout(scope.timerId);
                                scope.change(index);
                            }
                        });
                    };
                    TopBillboard.prototype.startTimer = function () {
                        var scope = this;
                        window.clearTimeout(this.timerId);
                        this.timerId = window.setTimeout(function () {
                            var next = scope.currentIndex + 1;
                            if (next >= scope.photos.length) {
                                next = 0;
                            }
                            scope.change(next);
                        }, this.INTERVAL);
                    };
                    TopBillboard.prototype.change = function (next) {
                        if (this.locked) {
                            return;
                        }
                        this.locked = true;
                        var scope = this;
                        var spt = this.photos[next];
                        var elm = spt.element;
                        var curr = 0;
                        var sp = 100;
                        var acc = 1;
                        var sp_acc1 = 0.6;
                        var sp_acc2 = 2;
                        var sp_min = 3;
                        this.currentIndex = next;
                        if (this.currentPhoto != null) {
                            Tween.motion(this.currentPhoto, ["alpha"], [0.5], 0.015);
                        }
                        spt.alpha = 1;
                        spt.update();
                        elm.css("width", "0%");
                        $(".mainVisualArea .photoContainer").append(elm);
                        var delay = 10;
                        this.onEnterFrame = function () {
                            if (--delay < 0) {
                                acc = Math.min(acc + sp_acc1, sp_acc2);
                                sp = Math.max(sp - (acc * acc), sp_min);
                                curr += (100 - curr) / sp;
                                elm.css("width", curr + "%");
                                if (curr > 99.9) {
                                    scope.deleteEnterFrame;
                                    elm.css("width", "100%");
                                    scope.currentPhoto = spt;
                                    for (var i = 0, ln = scope.photos.length; i < ln; i++) {
                                        var photo = scope.photos[i];
                                        photo.alpha = 1;
                                        if (i != scope.currentIndex) {
                                            photo.element.css("width", "0%");
                                        }
                                        photo.update();
                                    }
                                    scope.startTimer();
                                    if (scope.isFirst) {
                                        scope.isFirst = false;
                                        scope.dispatchEvent({ type: "initialized" });
                                    }
                                    scope.locked = false;
                                }
                            }
                        };
                        for (var i = 0, ln = scope.thumbs.length; i < ln; i++) {
                            if (i == this.currentIndex) {
                                this.thumbs[i].addClass("selected");
                            }
                            else {
                                this.thumbs[i].removeClass("selected");
                            }
                        }
                    };
                    TopBillboard.prototype.onResize = function () {
                        var w = document.documentElement.clientWidth || document.body.clientWidth;
                        var h = $(".mainVisualArea").height();
                        var img_ini_w = 1800;
                        var img_ini_h = 800;
                        var img_w = 1800;
                        var img_h = 800;
                        var img_x = 1800;
                        var img_y = 800;
                        var per = w / h;
                        if (per > (img_ini_w / img_ini_h)) {
                            img_w = w;
                            img_h = img_ini_h * (w / img_ini_w);
                            img_x = 0;
                            img_y = (h - img_h) / 2;
                        }
                        else {
                            img_h = h;
                            img_w = img_ini_w * (h / img_ini_h);
                            img_x = (w - img_w) / 2;
                            img_y = 0;
                        }
                        for (var i = 0, ln = this.photos.length; i < ln; i++) {
                            var photo = this.photos[i].element;
                            photo.css("background-size", img_w + "px auto");
                            photo.css("background-position", img_x + "px " + img_y + "px");
                        }
                    };
                    return TopBillboard;
                }(EventDispatcher));
                dtj.TopBillboard = TopBillboard;
            })(dtj = lib.dtj || (lib.dtj = {}));
        })(lib = enirva.lib || (enirva.lib = {}));
    })(enirva = com.enirva || (com.enirva = {}));
})(com || (com = {}));
