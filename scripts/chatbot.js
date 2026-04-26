/**
 * DA Prints AI Chatbot - Email List Building Assistant
 * Sections: 1)Opt-in Forms 2)Lead Magnets 3)Brevo Automation
 * 4)Community Partnerships 5)Engagement Strategies
 */
(function () {
  "use strict";
    var BREVO_API = (function() { var h = window.location.hostname, p = window.location.port; if (p === "3000" || h === "daprintsai.live" || h === "www.daprintsai.live") return "/api/subscribe"; if (h === "localhost" || h === "127.0.0.1") { console.warn("Chatbot: For local development, access the site at http://localhost:3000 to avoid CORS issues."); return "http://localhost:3000/api/subscribe"; } return "/api/subscribe"; })(), chatOpen = false;

  var MENU = {
    main: {
      text: "\ud83d\udc4b Welcome to DA Prints AI! I can help you discover amazing digital artwork. What interests you?",
      options: [
        { label: "\ud83c\udfa8 Browse Artwork", action: "browse" },
        { label: "\ud83c\udf81 Free Wallpaper", action: "leadmagnet" },
        { label: "\ud83c\udfc6 Giveaways", action: "giveaways" },
        { label: "\ud83c\udf10 Art Communities", action: "communities" },
            { label: "\ud83d\udd0d Search Artwork", action: "keyword_search" }
      ]
    },
    browse: {
      text: "\ud83d\uddbc\ufe0f We have 80 stunning digital artworks at just $1.99 each! Instant download after purchase. Want to stay updated on new drops?",
      options: [
        { label: "\u2705 Yes, notify me!", action: "signup_newdrops" },
        { label: "\u2b05\ufe0f Back to Menu", action: "main" }
      ]
    },
    leadmagnet: {
      text: "\ud83c\udf81 Get 1 Free Exclusive Digital Wallpaper when you join our email list!",
      options: [
        { label: "\ud83d\udce7 Subscribe", action: "signup_wallpapers" }
      ]
    },
    discount: {
      text: "\ud83d\udcb0 Sign up for our email list and get an exclusive 15% discount code on your first purchase! That's any artwork for just $1.69!",
      options: [
        { label: "\ud83d\udce7 Get My Discount Code", action: "signup_discount" },
        { label: "\ud83c\udf81 I'd rather get a free wallpaper", action: "leadmagnet" },
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
      text: "We run monthly giveaways and contests. The current giveaway: win 3 artworks free.\nFirst contest is July 1st.",
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
      text: "\ud83c\udf89 Awesome! Check your email for a confirmation.\n\u2705 Welcome email\n\u2705 Early access to new artwork drops\n\u2705 Exclusive subscriber discounts\n\nThank you for joining DA Prints!",
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
    signup_wallpapers: { tag: "free-wallpapers", gift: "1 free wallpaper" },
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
    /* Keyword Search Functions */
    function showSearchForm() {
        var c = document.getElementById("dapChatMessages");
        var w = document.createElement("div");
        w.className = "dap-email-form";
        w.innerHTML = '<input type="text" placeholder="Enter keyword..." id="dapSearchInput"/><button id="dapSearchSubmit">Search</button>';
        c.appendChild(w);
        c.scrollTop = c.scrollHeight;
        var inp = w.querySelector("#dapSearchInput");
        var btn = w.querySelector("#dapSearchSubmit");
        function doSearch() {
            var query = inp.value.trim().toLowerCase();
            if (!query) { addBotMsg("Please enter a keyword to search."); return; }
            btn.disabled = true;
            btn.textContent = "...";
            var results = searchByKeyword(query);
            if (results.length === 0) {
                addBotMsg("No artwork found for \"" + query + "\". Try another keyword like animal, ocean, or fantasy.");
                showButtons([{ label: "\ud83d\udd0d Search Again", action: "keyword_search" }, { label: "\ud83c\udfe0 Back to Menu", action: "main" }]);
            } else {
                addBotMsg("Found " + results.length + " artwork(s) matching \"" + query + "\"! Opening results page...");
                openResultsPage(results, query);
                showButtons([{ label: "\ud83d\udd0d Search Again", action: "keyword_search" }, { label: "\ud83c\udfe0 Back to Menu", action: "main" }]);
            }
        }
        btn.onclick = doSearch;
        inp.onkeydown = function (e) { if (e.key === "Enter") doSearch(); };
        inp.focus();
    }

    function searchByKeyword(query) {
        var kw = (typeof productKeywords !== "undefined") ? productKeywords : (typeof window.productKeywords !== "undefined") ? window.productKeywords : null; if (!kw) { console.error("productKeywords not loaded"); return []; }
        var q = query.toLowerCase();
        return kw.filter(function (p) {
            if (p.name && p.name.toLowerCase().indexOf(q) >= 0) return true;
            if (p.productClass && p.productClass.toLowerCase().indexOf(q) >= 0) return true;
            if (p.keywords) {
                for (var i = 0; i < p.keywords.length; i++) {
                    if (p.keywords[i].toLowerCase().indexOf(q) >= 0) return true;
                }
            }
            return false;
        });
    }

    function openResultsPage(results, query) {
        // Remove any existing overlay first
        var ex = document.getElementById("dapSearchOverlay");
        if (ex) ex.parentNode.removeChild(ex);

        // Create overlay container
        var ov = document.createElement("div");
        ov.id = "dapSearchOverlay";
        ov.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:100000;display:flex;align-items:center;justify-content:center;padding:10px;box-sizing:border-box;";

        // Create results container
        var ct = document.createElement("div");
        ct.style.cssText = "background:#f5f5f5;width:100%;max-width:500px;max-height:90vh;border-radius:12px;overflow-y:auto;padding:16px;position:relative;-webkit-overflow-scrolling:touch;";

        // Header with close button
        var hd = document.createElement("div");
        hd.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #febd69;position:sticky;top:0;background:#f5f5f5;z-index:1;";

        var title = document.createElement("div");
        title.style.cssText = "font-size:17px;font-weight:bold;color:#232f3e;";
        title.textContent = 'Results for "' + query + '"';
        hd.appendChild(title);

        var cb = document.createElement("button");
        cb.textContent = "\u2715";
        cb.style.cssText = "background:#232f3e;color:white;border:none;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;flex-shrink:0;";
        cb.addEventListener("click", function() {
            if (ov.parentNode) ov.parentNode.removeChild(ov);
        });
        hd.appendChild(cb);
        ct.appendChild(hd);

        // Build result cards
        for (var i = 0; i < results.length; i++) {
            (function(p) {
                var card = document.createElement("div");
                card.style.cssText = "border:1px solid #ddd;border-radius:10px;padding:12px;margin-bottom:12px;background:#fff;text-align:center;";

                if (p.image) {
                    var img = document.createElement("img");
                    img.src = p.image;
                    img.alt = p.name || "";
                    img.style.cssText = "width:100%;max-width:250px;border-radius:8px;display:block;margin:0 auto 10px;";
                    card.appendChild(img);
                }

                var nameDiv = document.createElement("div");
                nameDiv.style.cssText = "font-weight:bold;font-size:15px;color:#232f3e;margin-bottom:4px;";
                nameDiv.textContent = p.name || "Unknown";
                card.appendChild(nameDiv);

                // Price display
                if (typeof p.priceCents !== "undefined") {
                    var priceDiv = document.createElement("div");
                    priceDiv.style.cssText = "color:#b12704;font-size:16px;font-weight:bold;margin-bottom:8px;";
                    if (p.priceCents === 0) {
                        priceDiv.textContent = "FREE";
                        priceDiv.style.color = "#067D62";
                    } else {
                        priceDiv.textContent = "$" + (p.priceCents / 100).toFixed(2);
                    }
                    card.appendChild(priceDiv);
                }

                // Add to Cart button
                var cartBtn = document.createElement("button");
                cartBtn.textContent = "Add to Cart";
                cartBtn.style.cssText = "background:#febd69;color:#232f3e;border:none;padding:10px 20px;border-radius:6px;font-weight:bold;font-size:14px;cursor:pointer;margin:4px;";
                cartBtn.addEventListener("click", function() {
                    try {
                        var cart = JSON.parse(localStorage.getItem("cart")) || [];
                        var found = false;
                        for (var j = 0; j < cart.length; j++) {
                            if (cart[j].productId === p.id) {
                                cart[j].quantity += 1;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            cart.push({productId: p.id, quantity: 1, deliveryOptionId: "1"});
                        }
                        localStorage.setItem("cart", JSON.stringify(cart));
                        cartBtn.textContent = "Added \u2713";
                        cartBtn.style.background = "#4CAF50";
                        cartBtn.style.color = "white";
                        setTimeout(function() {
                            cartBtn.textContent = "Add to Cart";
                            cartBtn.style.background = "#febd69";
                            cartBtn.style.color = "#232f3e";
                        }, 1500);
                    } catch(e) {
                        console.error("Add to cart error:", e);
                    }
                });
                card.appendChild(cartBtn);

                ct.appendChild(card);
            })(results[i]);
        }

        // Footer with navigation links
        var ft = document.createElement("div");
        ft.style.cssText = "margin-top:12px;padding-top:8px;border-top:1px solid #ddd;text-align:center;";

        var backLink = document.createElement("a");
        backLink.href = "amazon.html";
        backLink.textContent = "Back to Store";
        backLink.style.cssText = "color:#232f3e;text-decoration:none;font-weight:bold;margin:0 10px;";
        ft.appendChild(backLink);

        var sep = document.createTextNode(" | ");
        ft.appendChild(sep);

        var checkLink = document.createElement("a");
        checkLink.href = "checkout.html";
        checkLink.textContent = "Checkout";
        checkLink.style.cssText = "color:#232f3e;text-decoration:none;font-weight:bold;margin:0 10px;";
        ft.appendChild(checkLink);

        ct.appendChild(ft);
        ov.appendChild(ct);

        // Close on overlay background click
        ov.addEventListener("click", function(e) {
            if (e.target === ov && ov.parentNode) ov.parentNode.removeChild(ov);
        });

        document.body.appendChild(ov);
    }

  function toggleChat() {
    var w = document.getElementById("dapChatWindow");
    chatOpen = !chatOpen;
        if (chatOpen) { var mc = document.getElementById("dapChatMessages"); mc.innerHTML = ""; showMenu("main"); w.classList.add("open"); } else { w.classList.remove("open"); }
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
      b.onclick = function () { if (o.action !== "keyword_search") addUserMsg(o.label); handleAction(o.action); };
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
            if (action === "signup_wallpapers") { addBotMsg("\ud83d\udce7 Enter your email to get one free wallpaper"); } else { addBotMsg("\ud83d\udce7 Great choice! Enter your email to get " + info.gift + ":"); }
      showEmailForm(action); return;
    }
        if (action === "keyword_search") { addBotMsg("\ud83d\udd0d Enter a keyword to search our artwork."); showSearchForm(); return; }
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
