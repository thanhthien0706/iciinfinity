var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dtj;
(function (dtj) {
    var Debugger = com.enirva.lib.debug.Debugger;
    var GNavigation = com.enirva.lib.dtj.GNavigation;
    var EventDispatcher = com.enirva.lib.core.EventDispatcher;
    var UserAgent = com.enirva.lib.model.UserAgent;
    var SubTextAnimation = com.enirva.lib.dtj.SubTextAnimation;
    var TextAnimation = com.enirva.lib.dtj.TextAnimation;
    var Sub = (function (_super) {
        __extends(Sub, _super);
        function Sub(subIndex) {
            _super.call(this);
            $(".gnaviInner .sub li").each(function (index) {
                if (index == subIndex) {
                    $(this).addClass("selected");
                }
            });
            this.loaded = false;
        }
        Sub.prototype.Initialize = function () {
            this.loaded = true;
            new GNavigation();
            var scope = this;
            $(window).on("resize", function () {
                scope.onResize();
            });
            this.onResize();
            if (!UserAgent.isMobile) {
                $(document.body).addClass("loaded");
            }
            var navi = $(".gnavi .gnaviInner .sub").clone();
            $(".footerNaviArea .gnaviInner").append(navi);
            if (this.isRecruitTop) {
                new TextAnimation();
            }
            else {
                new SubTextAnimation();
            }
        };
        Sub.prototype.onResize = function () {
            Debugger.text(0, window.innerWidth);
        };
        return Sub;
    }(EventDispatcher));
    dtj.Sub = Sub;
})(dtj || (dtj = {}));
var sub;
window.onload = function () {
    sub.Initialize();
};
