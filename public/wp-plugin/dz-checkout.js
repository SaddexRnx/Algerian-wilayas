/**
 * DZ Address Picker — WordPress / WooCommerce checkout script.
 * Renders cascading Wilaya -> Daira -> Commune selects into every
 * `.dz-address-picker` container and writes the result into a hidden input.
 */
(function () {
  "use strict";

  var CONFIG = window.DZ_ADDRESS_PICKER || {};
  var API_BASE = (CONFIG.apiBase || "").replace(/\/$/, "");
  var LABELS = CONFIG.labels || {};
  var CACHE_KEY = "dz-address-picker:wp-data";
  var CACHE_TTL = 6 * 60 * 60 * 1000;

  function labelOf(item, format) {
    return format === "latin" ? item.ascii : item.arabic;
  }

  function readCache() {
    try {
      var raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || Date.now() - parsed.at > CACHE_TTL) return null;
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: data }));
    } catch (e) {
      /* storage unavailable */
    }
  }

  function loadData() {
    var cached = readCache();
    if (cached) return Promise.resolve(cached);
    return fetch(API_BASE + "/full-data.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(function (json) {
        writeCache(json);
        return json;
      });
  }

  function createSelect(labelText, container) {
    var wrapper = document.createElement("p");
    wrapper.className = "form-row form-row-wide dz-address-row";

    var label = document.createElement("label");
    label.textContent = labelText || "";

    var select = document.createElement("select");
    select.className = "select dz-address-select";
    select.setAttribute("aria-label", labelText || "");
    select.style.width = "100%";

    label.appendChild(select);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
    return select;
  }

  function fill(select, options, placeholder) {
    select.innerHTML = "";
    var empty = document.createElement("option");
    empty.value = "";
    empty.textContent = placeholder;
    select.appendChild(empty);
    options.forEach(function (opt) {
      var el = document.createElement("option");
      el.value = String(opt.value);
      el.textContent = opt.label;
      select.appendChild(el);
    });
  }

  function mount(container, data) {
    if (container.dataset.dzMounted === "1") return;
    container.dataset.dzMounted = "1";

    var format = container.dataset.format || CONFIG.format || "arabic";
    var inputName = container.dataset.inputName || CONFIG.inputName || "shipping_address";

    var hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = inputName;
    container.appendChild(hidden);

    var hiddenParts = ["wilaya", "daira", "commune"].map(function (part) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = "dz_" + part;
      container.appendChild(input);
      return input;
    });

    var wilayaSelect = createSelect(LABELS.wilaya || "Wilaya", container);
    var dairaSelect = createSelect(LABELS.daira || "Daira", container);
    var communeSelect = createSelect(LABELS.commune || "Commune", container);

    fill(
      wilayaSelect,
      data.map(function (w) {
        return { value: w.code, label: w.code + " - " + labelOf(w, format) };
      }),
      LABELS.wilaya || "Wilaya",
    );
    fill(dairaSelect, [], LABELS.daira || "Daira");
    fill(communeSelect, [], LABELS.commune || "Commune");
    dairaSelect.disabled = true;
    communeSelect.disabled = true;

    function current() {
      var wilaya = data.filter(function (w) {
        return String(w.code) === wilayaSelect.value;
      })[0];
      var daira = wilaya && wilaya.dairas[Number(dairaSelect.value)];
      var commune = daira && daira.communes[Number(communeSelect.value)];
      return { wilaya: wilaya, daira: daira, commune: commune };
    }

    function sync() {
      var sel = current();
      var parts = [
        sel.commune ? labelOf(sel.commune, format) : "",
        sel.daira ? labelOf(sel.daira, format) : "",
        sel.wilaya ? labelOf(sel.wilaya, format) : "",
      ].filter(Boolean);

      if (format === "json") {
        hidden.value = JSON.stringify({
          wilayaCode: sel.wilaya ? sel.wilaya.code : "",
          wilaya: sel.wilaya ? sel.wilaya.arabic : "",
          daira: sel.daira ? sel.daira.arabic : "",
          commune: sel.commune ? sel.commune.arabic : "",
        });
      } else {
        hidden.value = parts.join(format === "latin" ? ", " : "، ");
      }

      hiddenParts[0].value = sel.wilaya ? sel.wilaya.arabic : "";
      hiddenParts[1].value = sel.daira ? sel.daira.arabic : "";
      hiddenParts[2].value = sel.commune ? sel.commune.arabic : "";

      window.dispatchEvent(
        new CustomEvent("dz-address-update", {
          detail: {
            wilayaCode: sel.wilaya ? String(sel.wilaya.code) : "",
            wilayaName: sel.wilaya ? sel.wilaya.arabic : "",
            dairaName: sel.daira ? sel.daira.arabic : "",
            communeName: sel.commune ? sel.commune.arabic : "",
          },
        }),
      );
    }

    wilayaSelect.addEventListener("change", function () {
      var sel = current();
      var dairas = sel.wilaya ? sel.wilaya.dairas : [];
      fill(
        dairaSelect,
        dairas.map(function (d, i) {
          return { value: i, label: labelOf(d, format) };
        }),
        LABELS.daira || "Daira",
      );
      fill(communeSelect, [], LABELS.commune || "Commune");
      dairaSelect.disabled = dairas.length === 0;
      communeSelect.disabled = true;
      sync();
    });

    dairaSelect.addEventListener("change", function () {
      var sel = current();
      var communes = sel.daira ? sel.daira.communes : [];
      fill(
        communeSelect,
        communes.map(function (c, i) {
          return { value: i, label: labelOf(c, format) };
        }),
        LABELS.commune || "Commune",
      );
      communeSelect.disabled = communes.length === 0;
      sync();
    });

    communeSelect.addEventListener("change", sync);
  }

  function init() {
    var containers = document.querySelectorAll(".dz-address-picker");
    if (!containers.length) return;

    loadData()
      .then(function (data) {
        Array.prototype.forEach.call(containers, function (container) {
          mount(container, data);
        });
      })
      .catch(function () {
        Array.prototype.forEach.call(containers, function (container) {
          container.textContent = "";
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.body.addEventListener("updated_checkout", init);
})();
