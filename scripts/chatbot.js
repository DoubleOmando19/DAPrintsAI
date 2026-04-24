/**
 * DA Prints AI Chatbot - Email List Building Assistant
 * Sections: 1)Opt-in Forms 2)Lead Magnets 3)Brevo Automation
 * 4)Community Partnerships 5)Engagement Strategies
 */
(function () {
  "use strict";
  var BREVO_API = "/api/subscribe", chatOpen = false;

  var MENU = {
    main: {
      text: "\ud83d\udc4b Welcome to DA Prints AI! I can help you discover amazing digital artwork. What interests you?",
      options: [
        { label: "\ud83c\udfa8 Browse Artwork", action: "browse" },
        { label: "\ud83c\udf81 Free Wallpapers", action: "leadmagnet" },
        { label: "\ud83d\udcb0 Get 15% Off", action: "discount" },
        { label: "\ud83d\udcf0 Artist Newsletter", action: "newsletter" },
        { label: "\ud83c\udfc6 Giveaways", action: "giveaways" },
        { label: "\ud83c\udf10 Art Communities", action: "communities" }
      ]
    },
    browse: {
      text: "\ud83d\uddbc\ufe0f We have 85 stunning digital artworks at just $1.99 each! Instant download after purchase. Want to stay updated on new drops?",
      options: [
        { label: "\u2705 Yes, notify me!", action: "signup_newdrops" },
        { label: "\ud83d\uded2 Go to Shop", action: "link_shop" },
        { label: "\u2b05\ufe0f Back to Menu", action: "main" }
      ]
    },
    leadmagnet: {
      text: "\ud83c\udf81 Get 3 FREE exclusive digital wallpapers when you join our email list! Perfect for desktop & mobile backgrounds.",
      options: [
        { label: "\ud83d\udce7 Get Free Wallpapers", action: "signup_wallpapers" },
        { label: "\ud83d\udcb0 I'd rather get a discount", action: "discount" },
        { label: "\u2b05\ufe0f Back to Menu", action: "main" }
      ]
    },
    discount: {
      text: "\ud83d\udcb0 Sign up for our email list and get an exclusive 15% discount code on your first purchase! That's any artwork for just $1.69!",
      options: [
        { label: "\ud83d\udce7 Get My Discount Code", action: "signup_discount" },
        { label: "\ud83c\udf81 I'd rather get free wallpapers", action: "leadmagnet" },
        { label: "\u2b05\ufe0f Back to Menu", action: "main" }
      ]
    },
    newsletter: {
      text: "\ud83d\udcf0 Our weekly Artist Tips Newsletter includes:\n\u2022 Digital art techniques & tutorials\n\u2022 Behind-the-scenes of new artwork\n\u2022 Exclusive subscriber-only deals\n\u2022 Curated art inspiration",
      options: [
        { label: "\ud83d\udce7 Subscribe to Newsletter", action: "signup_newsletter" },
        { label: "\u2b05\ufe0f Back to Menu", action: "main" }
      ]
    },
    giveaways: {
      text: "\ud83c\udfc6 We run monthly giveaways & contests!\n\n\ud83c\udf89 Current: Win a bundle of 10 artworks FREE!\n\ud83d\udcc5 Next contest: Share your desktop setup\n\nSubscribe to get notified about all giveaways!",
      options: [
        { label: "\ud83d\udce7 Notify Me of Giveaways", action: "signup_giveaways" },
        { label: "\ud83d\udecd\ufe0f Check Etsy Shop", action: "link_etsy" },
        { label: "\ud83c\udfa8 Creative Market", action: "link_creativemarket" },
        { label: "\u2b05\ufe0f Back to Menu", action: "main" }
      ]
    },
    communities: {
      text: "\ud83c\udf10 Join the DA Prints community!\n\n\ud83c\udfa8 DeviantArt \u2014 Follow us for art updates\n\ud83d\udcbc Behance \u2014 View our portfolio\n\ud83d\udd8c\ufe0f ArtStation \u2014 High-res showcases\n\nSubscribe for community highlights!",
      options: [
        { label: "\ud83d\udce7 Join Community Updates", action: "signup_community" },
        { label: "\ud83c\udfa8 Visit DeviantArt", action: "link_deviantart" },
        { label: "\ud83d\udcbc Visit Behance", action: "link_behance" },
        { label: "\ud83d\udd8c\ufe0f Visit ArtStation", action: "link_artstation" },
        { label: "\u2b05\ufe0f Back to Menu", action: "main" }
      ]
    },
    signup_success: {
      text: "\ud83c\udf89 Awesome! Check your email for a confirmation.\n\u2705 Welcome email with your free gift\n\u2705 Weekly artist tips & inspiration\n\u2705 Early access to new artwork drops\n\u2705 Exclusive subscriber discounts\n\nThank you for joining DA Prints!",
      options: [
        { label: "\ud83d\uded2 Start Shopping", action: "link_shop" },
        { label: "\ud83c\udf10 Explore Communities", action: "communities" },
        { label: "\u2b05\ufe0f Back to Menu", action: "main" }
      ]
    },
    signup_error: {
      text: "\ud83d\ude15 Something went wrong. Please try again or email us at noreply@daprintsai.live",
      options: [{ label: "\ud83d\udd04 Try Again", action: "main" }]
    }
  };

  var LINKS = {
    link_shop: "/",
    link_etsy: "https://www.etsy.com",
    link_creativemarket: "https://creativemarket.com",
    link_deviantart: "https://www.deviantart.com",
    link_behance: "https://www.behance.net",
    link_artstation: "https://www.artstation.com"
  };

  var SIGNUP_TYPES = {
    signup_wallpapers: { tag: "free-wallpapers", gift: "3 free 4K wallpapers" },
    signup_discount: { tag: "discount-15", gift: "15% discount code" },
    signup_newsletter: { tag: "newsletter", gift: "Artist Tips Newsletter" },
    signup_newdrops: { tag: "new-drops", gift: "new artwork notifications" },
    signup_giveaways: { tag: "giveaways", gift: "giveaway notifications" },
    signup_community: { tag: "community", gift: "community updates" }
  };

  function buildUI() {
    var t = document.createElement("button");
    t.className = "dap-chat-toggle";
    t.setAttribute("aria-label", "Open chat");
    t.innerHTML = '<img src="images/Roboto7.png" alt="DA Prints AI">';
    t.onclick = toggleChat;
    document.body.appendChild(t);

    var w = document.createElement("div");
    w.className = "dap-chat-window";
    w.id = "dapChatWindow";
    w.innerHTML = '<div class="dap-chat-header"><span class="dap-chat-header-title">\ud83d\udcac DA Prints AI</span><button class="dap-chat-close" id="dapChatClose">\u00d7</button></div><div class="dap-chat-messages" id="dapChatMessages"></div>';
    document.body.appendChild(w);

    document.getElementById("dapChatClose").onclick = function () {
      document.getElementById("dapChatWindow").classList.remove("open");
      chatOpen = false;
    };

    setTimeout(function () { showMenu("main"); }, 400);
  }

  function toggleChat() {
    var w = document.getElementById("dapChatWindow");
    chatOpen = !chatOpen;
    if (chatOpen) { w.classList.add("open"); } else { w.classList.remove("open"); }
  }

  function addBotMsg(text) {
    var c = document.getElementById("dapChatMessages");
    var m = document.createElement("div");
    m.className = "dap-msg bot"; m.textContent = text;
    c.appendChild(m); c.scrollTop = c.scrollHeight;
  }

  function addUserMsg(text) {
    var c = document.getElementById("dapChatMessages");
    var m = document.createElement("div");
    m.className = "dap-msg user"; m.textContent = text;
    c.appendChild(m); c.scrollTop = c.scrollHeight;
  }

  function showButtons(options) {
    var c = document.getElementById("dapChatMessages");
    var w = document.createElement("div");
    w.className = "dap-quick-replies";
    options.forEach(function (o) {
      var b = document.createElement("button");
      b.className = "dap-quick-btn"; b.textContent = o.label;
      b.onclick = function () { addUserMsg(o.label); handleAction(o.action); };
      w.appendChild(b);
    });
    c.appendChild(w); c.scrollTop = c.scrollHeight;
  }

  function showEmailForm(signupType) {
    var c = document.getElementById("dapChatMessages");
    var info = SIGNUP_TYPES[signupType];
    var w = document.createElement("div");
    w.className = "dap-email-form";
    w.innerHTML = '<input type="email" placeholder="Enter your email..." id="dapEmailInput"/><button id="dapEmailSubmit">Join</button>';
    c.appendChild(w); c.scrollTop = c.scrollHeight;
    var inp = document.getElementById("dapEmailInput");
    var btn = document.getElementById("dapEmailSubmit");
    function doSubmit() {
      var email = inp.value.trim();
      if (!email || email.indexOf("@") < 0 || email.indexOf(".") < 0) {
        addBotMsg("\u26a0\ufe0f Please enter a valid email address."); return;
      }
      btn.disabled = true; btn.textContent = "...";
      subscribeEmail(email, info.tag, info.gift);
    }
    btn.onclick = doSubmit;
    inp.onkeydown = function (e) { if (e.key === "Enter") doSubmit(); };
    inp.focus();
  }

  function subscribeEmail(email, tag, gift) {
    fetch(BREVO_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, tag: tag, gift: gift })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.success) { showMenu("signup_success"); }
        else { addBotMsg(d.message || "Something went wrong."); showMenu("signup_error"); }
      })
      .catch(function () { showMenu("signup_error"); });
  }

  function showMenu(key) {
    var m = MENU[key]; if (!m) return;
    addBotMsg(m.text);
    if (m.options) showButtons(m.options);
  }

  function handleAction(action) {
    if (LINKS[action]) { window.open(LINKS[action], "_blank"); return; }
    if (SIGNUP_TYPES[action]) {
      var info = SIGNUP_TYPES[action];
      addBotMsg("\ud83d\udce7 Great choice! Enter your email to get " + info.gift + ":");
      showEmailForm(action); return;
    }
    showMenu(action);
  }

  setTimeout(function () {
    if (!chatOpen) {
      var w = document.getElementById("dapChatWindow");
      if (w) { w.classList.add("open"); chatOpen = true; }
    }
  }, 30000);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildUI);
  } else { buildUI(); }
})();
