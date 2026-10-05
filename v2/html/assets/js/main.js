// Kosei Nexus — overlay nav, scroll-reveal, tabs, lightbox
(function(){
  "use strict";

  // Overlay navigation
  var menuBtn = document.querySelector(".menu-btn");
  var overlay = document.querySelector(".nav-overlay");
  if (menuBtn && overlay) {
    var closeOverlay = function(){
      menuBtn.classList.remove("is-open");
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    menuBtn.addEventListener("click", function(){
      var open = overlay.classList.toggle("is-open");
      menuBtn.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    overlay.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", closeOverlay);
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape") closeOverlay();
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("is-visible"); });
  }

  // Tabs
  document.querySelectorAll("[data-tabs]").forEach(function(group){
    var buttons = group.querySelectorAll(".tab-btn");
    var panels = group.querySelectorAll(".tab-panel");
    buttons.forEach(function(btn){
      btn.addEventListener("click", function(){
        var target = btn.getAttribute("data-tab");
        buttons.forEach(function(b){ b.classList.remove("is-active"); });
        panels.forEach(function(p){ p.classList.remove("is-active"); });
        btn.classList.add("is-active");
        group.querySelector('.tab-panel[data-tab="' + target + '"]').classList.add("is-active");
      });
    });
  });

  // Lightbox
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var closeBtn = lightbox.querySelector(".lightbox-close");
    document.querySelectorAll("[data-lightbox]").forEach(function(trigger){
      trigger.addEventListener("click", function(){
        var src = trigger.getAttribute("data-lightbox");
        var alt = trigger.querySelector("img") ? trigger.querySelector("img").alt : "";
        lbImg.src = src;
        lbImg.alt = alt;
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    });
    var closeLb = function(){
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    closeBtn.addEventListener("click", closeLb);
    lightbox.addEventListener("click", function(e){
      if (e.target === lightbox) closeLb();
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape") closeLb();
    });
  }

  // Active nav link highlighting
  var path = window.location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".overlay-nav-list a").forEach(function(a){
    var href = a.getAttribute("href");
    if (!href) return;
    var resolved = new URL(href, window.location.href).pathname.replace(/index\.html$/, "");
    if (resolved === path) a.classList.add("is-active");
  });
})();
