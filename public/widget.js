/* DZ Address Picker — embeddable widget.
   Usage: <div class="dz-address-picker"></div>
          <script src="https://your-domain.vercel.app/widget.js"></script> */
(function () {
  "use strict";

  var script = document.currentScript;
  var origin = script ? new URL(script.src, location.href).origin : location.origin;
  var DATA_URL = origin + "/api/full-data.json";

  var CSS =
    ".dz-w{display:grid;gap:12px;font-family:system-ui,Inter,sans-serif}" +
    ".dz-w label{display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px}" +
    ".dz-w select{width:100%;padding:10px 12px;border-radius:8px;font-size:14px;" +
    "background:var(--dz-bg-color,#fff);color:var(--dz-text-color,#000);" +
    "border:1px solid var(--dz-border-color,#d1d5db);outline:none}" +
    ".dz-w select:focus{border-color:var(--dz-focus-ring-color,#000);" +
    "box-shadow:0 0 0 1px var(--dz-focus-ring-color,#000)}" +
    ".dz-w select:disabled{background:var(--dz-disabled-bg,#f9fafb);color:#9ca3af;cursor:not-allowed}";

  function injectCss() {
    if (document.getElementById("dz-w-style")) return;
    var s = document.createElement("style");
    s.id = "dz-w-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function normalize(json) {
    var list = Array.isArray(json) ? json : json && json.wilayas ? json.wilayas : [];
    return list.map(function (w) {
      return {
        code: w.code,
        arabic: w.arabic || w.name_ar || "",
        ascii: w.ascii || w.name || "",
        dairas: (w.dairas || []).map(function (d) {
          return {
            arabic: d.arabic || "",
            ascii: d.ascii || "",
            communes: (d.communes || []).map(function (c) {
              return { arabic: c.arabic || "", ascii: c.ascii || "" };
            }),
          };
        }),
      };
    });
  }

  function mount(el, data) {
    var format = el.getAttribute("data-format") || "arabic";
    var inputName = el.getAttribute("data-input-name") || "shipping_address";
    var lang = el.getAttribute("data-lang") || "ar";
    var key = lang === "ar" ? "arabic" : "ascii";
    var labels =
      lang === "ar"
        ? ["الولاية", "الدائرة", "البلدية"]
        : lang === "fr"
          ? ["Wilaya", "Daira", "Commune"]
          : ["Wilaya", "Daira", "Commune"];

    el.classList.add("dz-w");
    el.innerHTML = "";

    function field(label, id) {
      var wrap = document.createElement("div");
      var l = document.createElement("label");
      l.textContent = label;
      l.setAttribute("for", id);
      var sel = document.createElement("select");
      sel.id = id;
      wrap.appendChild(l);
      wrap.appendChild(sel);
      el.appendChild(wrap);
      return sel;
    }

    var uid = "dz-" + Math.random().toString(36).slice(2, 8);
    var wSel = field(labels[0], uid + "-w");
    var dSel = field(labels[1], uid + "-d");
    var cSel = field(labels[2], uid + "-c");

    var hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = inputName;
    el.appendChild(hidden);

    function fill(sel, options, placeholder) {
      sel.innerHTML = "";
      var o = document.createElement("option");
      o.value = "";
      o.textContent = placeholder;
      sel.appendChild(o);
      options.forEach(function (opt) {
        var x = document.createElement("option");
        x.value = String(opt.value);
        x.textContent = opt.label;
        sel.appendChild(x);
      });
    }

    fill(
      wSel,
      data.map(function (w) {
        return { value: w.code, label: w.code + " - " + w[key] };
      }),
      labels[0],
    );
    fill(dSel, [], labels[1]);
    fill(cSel, [], labels[2]);
    dSel.disabled = true;
    cSel.disabled = true;

    function current() {
      var w = data.filter(function (x) {
        return String(x.code) === wSel.value;
      })[0];
      var d = w ? w.dairas[Number(dSel.value)] : undefined;
      var c = d ? d.communes[Number(cSel.value)] : undefined;
      return { w: w, d: d, c: c };
    }

    function emit() {
      var s = current();
      var detail = {
        wilayaCode: s.w ? String(s.w.code) : "",
        wilayaName: s.w ? s.w.arabic : "",
        dairaName: s.d ? s.d.arabic : "",
        communeName: s.c ? s.c.arabic : "",
      };
      if (format === "json") {
        hidden.value = JSON.stringify(detail);
      } else {
        var k = format === "latin" ? "ascii" : "arabic";
        hidden.value = [s.c && s.c[k], s.d && s.d[k], s.w && s.w[k]]
          .filter(Boolean)
          .join(format === "latin" ? ", " : "، ");
      }
      el.dispatchEvent(new CustomEvent("dz-address-update", { detail: detail, bubbles: true }));
    }

    wSel.addEventListener("change", function () {
      var s = current();
      fill(
        dSel,
        s.w
          ? s.w.dairas.map(function (d, i) {
              return { value: i, label: d[key] };
            })
          : [],
        labels[1],
      );
      fill(cSel, [], labels[2]);
      dSel.disabled = !s.w;
      cSel.disabled = true;
      emit();
    });

    dSel.addEventListener("change", function () {
      var s = current();
      fill(
        cSel,
        s.d
          ? s.d.communes.map(function (c, i) {
              return { value: i, label: c[key] };
            })
          : [],
        labels[2],
      );
      cSel.disabled = !s.d;
      emit();
    });

    cSel.addEventListener("change", emit);

    // Pre-selection support via data attributes.
    var dw = el.getAttribute("data-wilaya");
    if (dw) {
      wSel.value = dw;
      wSel.dispatchEvent(new Event("change"));
      var dd = el.getAttribute("data-daira");
      if (dd) {
        var w0 = current().w;
        var di = w0
          ? w0.dairas.findIndex(function (x) {
              return x.ascii === dd || x.arabic === dd;
            })
          : -1;
        if (di >= 0) {
          dSel.value = String(di);
          dSel.dispatchEvent(new Event("change"));
          var dc = el.getAttribute("data-commune");
          if (dc) {
            var d0 = current().d;
            var ci = d0
              ? d0.communes.findIndex(function (x) {
                  return x.ascii === dc || x.arabic === dc;
                })
              : -1;
            if (ci >= 0) {
              cSel.value = String(ci);
              emit();
            }
          }
        }
      }
    }
  }

  function init() {
    var nodes = document.querySelectorAll(".dz-address-picker,[data-dz-address-picker]");
    if (!nodes.length) return;
    injectCss();
    fetch(DATA_URL)
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        var data = normalize(json);
        Array.prototype.forEach.call(nodes, function (el) {
          mount(el, data);
        });
      })
      .catch(function () {
        Array.prototype.forEach.call(nodes, function (el) {
          el.textContent = "Address data unavailable.";
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
