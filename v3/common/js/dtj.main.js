var dtj;
(function (dtj) {
    var Debugger = com.enirva.lib.debug.Debugger;
    var OurContents = com.enirva.lib.dtj.OurContents;
    var GNavigation = com.enirva.lib.dtj.GNavigation;
    var TopBillboard = com.enirva.lib.dtj.TopBillboard;
    var SubTextAnimation = com.enirva.lib.dtj.SubTextAnimation;
    var UserAgent = com.enirva.lib.model.UserAgent;
    var FadeObjectController = com.enirva.lib.dtj.FadeObjectController;
    var TextAnimation = com.enirva.lib.dtj.TextAnimation;
    var Main = (function () {
        function Main(pageType) {
            var scope = this;
            var gnaviIndex;
            switch (pageType) {
                case "top":
                    this.isTop = true;
                    gnaviIndex = 0;
                    break;
                case "feature":
                    gnaviIndex = 1;
                    break;
                default: break;
            }
            $(".gnaviInner .main li").each(function (index) {
                if (index == gnaviIndex) {
                    $(this).addClass("selected");
                }
            });
            this.loaded = false;
        }
        Main.prototype.Initialize = function () {
            this.loaded = true;
            new OurContents();
            new GNavigation();
            var scope = this;
            $(window).on("resize", function () {
                scope.onResize();
            });
            if (!UserAgent.isMobile) {
                $(document.body).addClass("loaded");
            }
            this.onResize();
            if (this.isTop) {
                var billboard = new TopBillboard();
                billboard.addEventListener("initialized", function () {
                    new TextAnimation();
                });
                if (UserAgent.isMobile) {
                    new TextAnimation();
                }
            }
            else {
                new SubTextAnimation();
                new FadeObjectController();
            }
        };
        Main.prototype.onResize = function () {
            Debugger.text(0, window.innerWidth);
            Debugger.text(1, window.innerHeight);
            if (this.isTop) {
                if (window.innerWidth <= 640) {
                    var h = 325;
                    $(".mainVisualArea").css("height", h);
                    $(".mainVisualArea .photoContainer").css("height", h);
                    $(".mainVisualArea .photoContainer .photo").css("height", h);
                }
                else {
                    var h = window.innerHeight;
                    var result = 799;
                    if (h < 950) {
                        result = h - (950 - 799);
                    }
                    result = Math.max(result, 550);
                    $(".mainVisualArea").css("height", result);
                    $(".mainVisualArea .photoContainer").css("height", result);
                    $(".mainVisualArea .photoContainer .photo").css("height", result);
                }
            }
        };
        return Main;
    }());
    dtj.Main = Main;
})(dtj || (dtj = {}));
var main;
window.onload = function () {
    main.Initialize();
};
