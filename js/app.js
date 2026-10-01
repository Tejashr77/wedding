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

  /* ---------- Petals ---------- */
  var petalHost = $("petals");
  var COLORS = ["#F6DCDE", "#FBE3D3", "#EAE4F3", "#E7D6B4"];
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

  /* ---------- Open / replay ---------- */
  function openInvitation() {
    stage.classList.add("is-opening");
    envelope.classList.add("is-open");

    // the letter rises out, then the invitation reveals
    window.setTimeout(function () {
      invitation.hidden = false;
      observeReveals(invitation);
      window.scrollTo(0, 0);
    }, reduced ? 0 : 780);

    window.setTimeout(function () {
      stage.classList.add("is-gone");
      stage.setAttribute("aria-hidden", "true");
    }, reduced ? 0 : 1650);
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