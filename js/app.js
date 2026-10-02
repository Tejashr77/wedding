/* ============================================================
   SAGAR WEDS YASHASWINI — Invitation behaviour
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.WEDDING;
  var $ = function (id) { return document.getElementById(id); };

  var stage = $("envelopeStage");
  var envelope = $("envelope");
  var openBtn = $("openBtn");
  var replayBtn = $("replayBtn");
  var invitation = $("invitation");

  /* ---------- Fill content from config ---------- */
  function setText(id, value) {
    var el = $(id);
    if (el && value != null) el.textContent = value;
  }

  setText("sealMonogram", cfg.couple.monogram);
  setText("envGroom", cfg.couple.groom);
  setText("envBride", cfg.couple.bride);

  setText("coverEyebrow", cfg.cover.eyebrow);
  setText("coverGroom", cfg.cover.groom);
  setText("coverWord", cfg.cover.word);
  setText("coverBride", cfg.cover.bride);
  setText("coverTagline", cfg.cover.tagline);

  setText("detailDate", cfg.details.date);
  setText("detailTime", cfg.details.time);
  setText("detailVenue", cfg.details.venue);
  setText("detailAddress", cfg.details.address);
  $("directionsBtn").href = cfg.details.mapsUrl;
  $("rsvpLink").href = cfg.details.rsvpUrl;

  setText("blessingsText", cfg.blessings.text);

  setText("closingText", cfg.closing.text);
  setText("closingDate", cfg.details.date);
  setText("footerText", cfg.couple.groom + " & " + cfg.couple.bride);

  setText("labelYes", cfg.rsvp.yes);
  setText("labelNo", cfg.rsvp.no);
  setText("guestsLabel", cfg.rsvp.guestsLabel);
  setText("rsvpSubmit", cfg.rsvp.submit);

  /* ---------- Timeline ---------- */
  var timeline = $("timeline");
  cfg.events.forEach(function (ev) {
    var li = document.createElement("li");
    li.className = "timeline__item reveal";

    var name = document.createElement("h3");
    name.className = "timeline__name";
    name.textContent = ev.name;

    var when = document.createElement("p");
    when.className = "timeline__when";
    when.textContent = ev.when;

    li.appendChild(name);
    li.appendChild(when);

    if (ev.note) {
      var note = document.createElement("p");
      note.className = "timeline__note";
      note.textContent = ev.note;
      li.appendChild(note);
    }

    timeline.appendChild(li);
  });

  /* ---------- Couple photo ----------
     Only revealed once the file actually loads, so a missing
     photo leaves no empty gold frame behind. The cover frame
     adapts to the photo's real shape: portrait gets the arch,
     square/landscape gets a soft rounded frame. */
  (function loadPhoto() {
    var p = cfg.photo;
    if (!p) return;

    /* test-build ribbon */
    var badge = $("testBadge");
    if (badge && p.testBadge) {
      badge.textContent = p.testBadge;
      badge.hidden = false;
    }

    if (!p.src) return;

    var cover = $("coverPhoto");
    var targets = [
      { frame: cover, img: $("coverPhotoImg"), caption: $("coverPhotoCaption") },
      { frame: $("envPhoto"), img: $("envPhotoImg") },
    ].filter(function (t) { return t.frame && t.img; });

    if (!targets.length) return;

    var probe = new Image();

    probe.onload = function () {
      if (cover) fitFrame(cover, probe.naturalWidth, probe.naturalHeight);

      targets.forEach(function (t) {
        t.img.src = p.src;
        if (t.caption) {
          /* caption is optional — the names already sit right below the photo */
          if (p.caption) {
            t.caption.textContent = p.caption;
            t.frame.classList.add("is-captioned");
          } else {
            t.caption.textContent = "";
          }
        }
        if (p.alt && t.frame.id === "coverPhoto") t.img.alt = p.alt;
        t.frame.classList.add("is-ready");
      });
    };
    probe.onerror = function () {
      /* photo not provided yet — keep the layout clean */
    };
    probe.src = p.src;

    function fitFrame(frame, w, h) {
      if (!w || !h) return;
      var ar = Math.min(Math.max(w / h, 0.62), 1.7);
      frame.style.setProperty("--ar", ar.toFixed(3));
      frame.setAttribute(
        "data-shape",
        ar <= 0.92 ? "portrait" : ar <= 1.25 ? "square" : "wide"
      );
    }
  })();

  /* ---------- Petals ---------- */
  var petalHost = $("petals");
  var COLORS = ["#EBD391", "#F7E6BC", "#D98C99", "#5CB494"];
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function spawnPetals() {
    petalHost.innerHTML = "";
    if (reduced) return;
    var count = window.innerWidth < 600 ? 9 : 14;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      p.style.left = (Math.random() * 100).toFixed(2) + "%";
      p.style.background = COLORS[i % COLORS.length];
      p.style.animationDuration = (9 + Math.random() * 8).toFixed(2) + "s";
      p.style.animationDelay = (Math.random() * 9).toFixed(2) + "s";
      p.style.opacity = (0.35 + Math.random() * 0.4).toFixed(2);
      petalHost.appendChild(p);
    }
  }
  spawnPetals();

  /* ---------- Reveal on scroll ---------- */
  var observer = null;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
  }

  function observeReveals(root) {
    var items = root.querySelectorAll(".reveal:not(.is-visible)");
    var show = function (el) { el.classList.add("is-visible"); };

    if (reduced || !observer) {
      Array.prototype.forEach.call(items, show);
      return;
    }

    Array.prototype.forEach.call(items, function (el, i) {
      el.style.transitionDelay = Math.min(i, 6) * 90 + "ms";
      observer.observe(el);
      el.addEventListener("transitionend", function once() {
        el.style.transitionDelay = "";
        el.removeEventListener("transitionend", once);
      });
    });
  }

  /* ---------- Open / replay ----------
     Timings line up with the CSS keyframes:
     seal 0.08s+0.55s · flap 0s+1.25s · card 0.42s+1.4s · stage fade 0.95s */
  function openInvitation() {
    stage.classList.add("is-opening");
    envelope.classList.add("is-open");

    // the letter is most of the way out — bring the invitation in behind the stage
    window.setTimeout(function () {
      invitation.hidden = false;
      observeReveals(invitation);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, reduced ? 0 : 1250);

    window.setTimeout(function () {
      stage.classList.add("is-gone");
      stage.setAttribute("aria-hidden", "true");
    }, reduced ? 0 : 1700);
  }

  function replayInvitation() {
    stage.classList.remove("is-gone", "is-opening");
    stage.removeAttribute("aria-hidden");
    envelope.classList.remove("is-open");
    invitation.hidden = true;

    // reset revealed state
    Array.prototype.forEach.call(invitation.querySelectorAll(".is-visible"), function (el) {
      el.classList.remove("is-visible");
    });

    openBtn.focus({ preventScroll: true });
  }

  openBtn.addEventListener("click", openInvitation);
  replayBtn.addEventListener("click", replayInvitation);

  /* ---------- RSVP ---------- */
  var rsvpForm = $("rsvpForm");
  var rsvpOpen = $("rsvpOpen");
  var rsvpThanks = $("rsvpThanks");

  rsvpOpen.addEventListener("click", function () {
    var isOpen = rsvpForm.classList.toggle("is-open");
    rsvpOpen.hidden = isOpen;
    if (isOpen) $("rsvpName").focus({ preventScroll: true });
  });

  rsvpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!rsvpForm.reportValidity()) return;
    rsvpThanks.textContent = cfg.rsvp.thanks;
    rsvpThanks.hidden = false;
    rsvpForm.reset();
  });
})();