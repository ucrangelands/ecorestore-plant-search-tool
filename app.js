(() => {
  "use strict";

  const plants = window.ECORESTORE_PLANTS || [];
  const filters = window.ECORESTORE_FILTERS || {};

  const state = {
    community: "",
    county: "",
    elevation: "",
    grazing: new Set(),
    soils: new Set(),
    chemistry: new Set(),
    conditions: new Set(),
    goals: new Set(),
    plantType: "all",
    query: "",
    sort: "match"
  };

  const weights = {
    community: 3,
    county: 3,
    elevation: 2,
    grazing: 1,
    soils: 2,
    chemistry: 2,
    conditions: 2,
    goals: 2
  };

  const $ = id => document.getElementById(id);

  const els = {
    community: $("community"),
    county: $("county"),
    elevation: $("elevation"),
    grid: $("plant-grid"),
    count: $("result-count"),
    summary: $("results-summary"),
    activeCount: $("active-filter-count"),
    search: $("plant-search"),
    sort: $("sort-results"),
    empty: $("no-results"),
    dialog: $("plant-dialog"),
    dialogTitle: $("dialog-title"),
    dialogScientific: $("dialog-scientific"),
    dialogKicker: $("dialog-kicker"),
    dialogContent: $("dialog-content")
  };

  fillSelect(
    els.community,
    filters.communities || []
  );

  fillSelect(
    els.county,
    filters.counties || []
  );

  fillSelect(
    els.elevation,
    filters.elevations || []
  );

  buildChoices(
    "grazing-options",
    "grazing",
    filters.grazing || []
  );

  buildChoices(
    "soil-options",
    "soils",
    filters.soils || []
  );

  buildChoices(
    "chemistry-options",
    "chemistry",
    filters.chemistry || []
  );

  buildChoices(
    "condition-options",
    "conditions",
    filters.conditions || []
  );

  buildChoices(
    "goal-options",
    "goals",
    filters.goals || []
  );

  els.community.addEventListener(
    "change",
    e => {
      state.community = e.target.value;
      render();
    }
  );

  els.county.addEventListener(
    "change",
    e => {
      state.county = e.target.value;
      render();
    }
  );

  els.elevation.addEventListener(
    "change",
    e => {
      state.elevation = e.target.value;
      render();
    }
  );

  els.search.addEventListener(
    "input",
    e => {
      state.query = e.target.value
        .trim()
        .toLowerCase();

      render();
    }
  );

  els.sort.addEventListener(
    "change",
    e => {
      state.sort = e.target.value;
      render();
    }
  );

  document
    .querySelectorAll(".chip[data-type]")
    .forEach(btn => {
      btn.addEventListener(
        "click",
        () => {
          state.plantType =
            btn.dataset.type;

          document
            .querySelectorAll(
              ".chip[data-type]"
            )
            .forEach(b => {
              b.classList.toggle(
                "is-active",
                b === btn
              );
            });

          render();
        }
      );
    });

  $("clear-all").addEventListener(
    "click",
    clearAll
  );

  $("clear-all-top").addEventListener(
    "click",
    clearAll
  );

  $("dialog-close").addEventListener(
    "click",
    () => els.dialog.close()
  );

  els.dialog.addEventListener(
    "click",
    e => {
      if (e.target === els.dialog) {
        els.dialog.close();
      }
    }
  );

  function fillSelect(select, values) {
    values.forEach(v => {
      const option =
        document.createElement("option");

      option.value = v;
      option.textContent = v;

      select.appendChild(option);
    });
  }

  function buildChoices(
    containerId,
    key,
    values
  ) {
    const container = $(containerId);

    values.forEach(value => {
      const label =
        document.createElement("label");

      label.className = "choice";

      const input =
        document.createElement("input");

      input.type = "checkbox";
      input.value = value;

      input.addEventListener(
        "change",
        () => {
          if (input.checked) {
            state[key].add(value);
          } else {
            state[key].delete(value);
          }

          render();
        }
      );

      const span =
        document.createElement("span");

      span.textContent = value;

      label.append(
        input,
        span
      );

      container.appendChild(label);
    });
  }

  function activeSiteSelections() {
    return (
      (state.community ? 1 : 0) +
      (state.county ? 1 : 0) +
      (state.elevation ? 1 : 0) +
      state.grazing.size +
      state.soils.size +
      state.chemistry.size +
      state.conditions.size +
      state.goals.size
    );
  }

  function scorePlant(p) {
    let earned = 0;
    let possible = 0;

    const reasons = [];
    const misses = [];

    if (state.community) {
      possible += weights.community;

      if (
        (p.communities || [])
          .includes(state.community)
      ) {
        earned += weights.community;
        reasons.push(state.community);
      } else {
        misses.push(
          `Plant community: ${state.community}`
        );
      }
    }

    if (state.county) {
      possible += weights.county;

      if (
        (p.counties || [])
          .includes(state.county)
      ) {
        earned += weights.county;

        reasons.push(
          `${state.county} County`
        );
      } else {
        misses.push(
          `${state.county} County`
        );
      }
    }

    if (state.elevation) {
      possible += weights.elevation;

      const elevationMatch =
        (p.elevations || [])
          .includes(state.elevation);

      if (elevationMatch) {
        earned += weights.elevation;
        reasons.push(state.elevation);
      } else {
        misses.push(
          `Elevation: ${state.elevation}`
        );
      }
    }

    [
      [
        "grazing",
        state.grazing,
        "grazing"
      ],
      [
        "soils",
        state.soils,
        "soil"
      ],
      [
        "chemistry",
        state.chemistry,
        "chemistry"
      ],
      [
        "conditions",
        state.conditions,
        "condition"
      ],
      [
        "goals",
        state.goals,
        "goal"
      ]
    ].forEach(
      ([field, selected, label]) => {

        if (!selected.size) {
          return;
        }

        const weight =
          weights[field];

        possible +=
          weight * selected.size;

        const available =
          p[field] || [];

        const matched =
          [...selected].filter(
            value =>
              available.includes(value)
          );

        earned +=
          weight * matched.length;

        matched.forEach(
          value =>
            reasons.push(value)
        );

        [...selected]
          .filter(
            value =>
              !matched.includes(value)
          )
          .forEach(
            value =>
              misses.push(
                `${label}: ${value}`
              )
          );
      }
    );

    const pct = possible
      ? Math.round(
          100 * earned / possible
        )
      : 100;

    return {
      pct,
      earned,
      possible,
      reasons,
      misses
    };
  }

  function matchLabel(
    pct,
    hasCriteria
  ) {
    if (!hasCriteria) {
      return "View plant";
    }

    if (pct >= 85) {
      return "Excellent match";
    }

    if (pct >= 65) {
      return "Good match";
    }

    if (pct >= 45) {
      return "Possible match";
    }

    return "Limited match";
  }

  function escapeHTML(v) {
    return String(v ?? "")
      .replace(
        /[&<>'"]/g,
        c => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        }[c])
      );
  }

  /*
   * Plant cards display only the first
   * common name listed in the source field.
   */
  function firstCommonName(name) {
    return (
      String(name || "")
        .split(/[,;|]/)[0]
        .trim() ||
      String(name || "").trim()
    );
  }

  /*
   * Build possible locally hosted image paths.
   *
   * Example:
   *
   * assets/plants/ACAM.jpg
   */
  function imageCandidates(p) {
    const explicit =
      p.photoFileName ||
      p.photoFile ||
      p.image ||
      "";

    const code =
      p.plantId ||
      p.PlantID ||
      "";

    const candidates = [];

    if (explicit) {
      const clean =
        String(explicit).replace(
          /^assets\/plants\//,
          ""
        );

      candidates.push(
        `assets/plants/${clean}`
      );
    }

    if (code) {
      [
        "webp",
        "jpg",
        "jpeg",
        "png"
      ].forEach(ext => {
        candidates.push(
          `assets/plants/${code}.${ext}`
        );
      });
    }

    return [
      ...new Set(candidates)
    ];
  }

  /*
   * Load a plant image without hiding the
   * parent before lazy loading begins.
   *
   * If the explicit filename fails, the
   * PlantID filenames are tried.
   *
   * The banner is hidden only if every
   * candidate fails.
   */
  function loadPlantThumbnail(
    article,
    p
  ) {
    const banner =
      article.querySelector(
        ".card-banner"
      );

    const img =
      article.querySelector(
        ".plant-thumbnail"
      );

    if (!banner || !img) {
      return;
    }

    const candidates =
      imageCandidates(p);

    let i = 0;

    banner.hidden = false;

    banner.classList.add(
      "is-loading"
    );

    function next() {
      if (
        i >= candidates.length
      ) {
        img.removeAttribute("src");

        banner.classList.remove(
          "is-loading"
        );

        banner.hidden = true;

        return;
      }

      img.src =
        candidates[i++];
    }

    img.addEventListener(
      "load",
      () => {
        banner.classList.remove(
          "is-loading"
        );

        banner.hidden = false;
      }
    );

    img.addEventListener(
      "error",
      next
    );

    next();
  }

  function render() {
    const hasCriteria =
      activeSiteSelections() > 0;

    let rows =
      plants.map(p => ({
        p,
        score: scorePlant(p)
      }));

    if (
      state.plantType !== "all"
    ) {
      rows =
        rows.filter(
          x =>
            x.p.type ===
            state.plantType
        );
    }

    if (state.query) {
      rows =
        rows.filter(x => {
          const searchable =
            `${x.p.common} ${x.p.scientific}`
              .toLowerCase();

          return searchable.includes(
            state.query
          );
        });
    }

    rows.sort(
      (a, b) => {

        if (
          state.sort === "common"
        ) {
          return firstCommonName(
            a.p.common
          ).localeCompare(
            firstCommonName(
              b.p.common
            )
          );
        }

        if (
          state.sort === "scientific"
        ) {
          return a.p.scientific
            .localeCompare(
              b.p.scientific
            );
        }

        return (
          b.score.pct -
            a.score.pct ||
          firstCommonName(
            a.p.common
          ).localeCompare(
            firstCommonName(
              b.p.common
            )
          )
        );
      }
    );

    els.grid.innerHTML = "";

    rows.forEach(
      ({ p, score }) => {
        els.grid.appendChild(
          makeCard(
            p,
            score,
            hasCriteria
          )
        );
      }
    );

    els.count.textContent =
      rows.length;

    els.empty.hidden =
      rows.length !== 0;

    els.activeCount.textContent =
      `${activeSiteSelections()} selected`;

    els.summary.textContent =
      hasCriteria
        ? "Site criteria rank all compatible records; higher-scoring plants match more of your selections."
        : "Showing all plants. Add site criteria to rank recommendations.";

    notifyHeight();
  }

  function makeCard(
    p,
    score,
    hasCriteria
  ) {
    const article =
      document.createElement(
        "article"
      );

    article.className =
      "plant-card";

    const topReasons =
      score.reasons.slice(0, 3);

    article.innerHTML = `

      <div class="card-banner is-loading">

        <img
          class="plant-thumbnail"
          alt=""
          loading="lazy"
          decoding="async">

      </div>

      <div class="card-body">

        <div>

          <h3>
            ${escapeHTML(
              firstCommonName(
                p.common
              )
            )}
          </h3>

          <p class="scientific">
            ${escapeHTML(
              p.scientific
            )}
          </p>

        </div>

        <div class="meta-row">

          <span class="tag">
            ${escapeHTML(
              p.type
            )}
          </span>

          <span class="tag">
            ${escapeHTML(
              p.status
            )}
          </span>

          ${
            (p.services || [])
              .slice(0, 2)
              .map(
                s =>
                  `<span class="tag">${escapeHTML(s)}</span>`
              )
              .join("")
          }

        </div>

        <div class="why">

          <strong>
            ${escapeHTML(
              matchLabel(
                score.pct,
                hasCriteria
              )
            )}
          </strong>

          ${
            hasCriteria &&
            topReasons.length

              ? `<br>Matches: ${
                  topReasons
                    .map(
                      escapeHTML
                    )
                    .join(", ")
                }${
                  score.reasons.length >
                  3
                    ? "…"
                    : ""
                }`

              : "<br>Select site criteria to see why it ranks."
          }

        </div>

        <button
          class="details-button"
          type="button">

          Click here to see restoration + plant details
          <strong aria-hidden="true">
            →
          </strong>

        </button>

      </div>
    `;

    article
      .querySelector("button")
      .addEventListener(
        "click",
        () => {
          openPlant(
            p,
            score,
            hasCriteria
          );
        }
      );

    loadPlantThumbnail(
      article,
      p
    );

    return article;
  }

  function openPlant(
    p,
    score,
    hasCriteria
  ) {
    els.dialogKicker.textContent =
      `${p.status} ${p.type}`;

    /*
     * Full common-name field is retained
     * in the detailed plant view.
     */
    els.dialogTitle.textContent =
      p.common;

    els.dialogScientific.textContent =
      p.scientific;

    const rows = [];

    if (state.community) {
      rows.push(
        detailMatch(
          "Plant community",
          state.community,
          (p.communities || [])
            .includes(
              state.community
            )
        )
      );
    }

    if (state.county) {
      rows.push(
        detailMatch(
          "County",
          `${state.county} County`,
          (p.counties || [])
            .includes(
              state.county
            )
        )
      );
    }

    if (state.elevation) {
      rows.push(
        detailMatch(
          "Elevation",
          state.elevation,
          (p.elevations || [])
            .includes(
              state.elevation
            )
        )
      );
    }

    [
      [
        "Grazing",
        state.grazing,
        p.grazing
      ],
      [
        "Soil texture",
        state.soils,
        p.soils
      ],
      [
        "Soil chemistry",
        state.chemistry,
        p.chemistry
      ],
      [
        "Site conditions",
        state.conditions,
        p.conditions
      ],
      [
        "Restoration goals",
        state.goals,
        p.goals
      ]
    ].forEach(
      ([
        label,
        selected,
        available
      ]) => {

        if (!selected.size) {
          return;
        }

        [...selected].forEach(
          value => {
            rows.push(
              detailMatch(
                label,
                value,
                (available || [])
                  .includes(value)
              )
            );
          }
        );
      }
    );

    els.dialogContent.innerHTML = `

      <section class="detail-section">

        <h3>
          ${
            hasCriteria

              ? `${score.pct}% site match — ${
                  matchLabel(
                    score.pct,
                    true
                  )
                }`

              : "Site matching"
          }
        </h3>

        ${
          rows.length

            ? `
              <table class="match-table">
                <tbody>
                  ${rows.join("")}
                </tbody>
              </table>
            `

            : `
              <p>
                No site criteria are active.
                Close this window and choose
                site characteristics to
                generate an explanation.
              </p>
            `
        }

      </section>

      <section class="detail-section">

        <h3>
          Ecosystem services supplied
        </h3>

        <div class="detail-list">

          ${
            (p.services || [])
              .map(
                value =>
                  `<span class="tag">${escapeHTML(value)}</span>`
              )
              .join("")
          }

        </div>

      </section>

      <section class="detail-section">

        <h3>
          Recorded compatibility fields
        </h3>

        <p>
          <strong>
            Plant communities:
          </strong>

          ${escapeHTML(
            (p.communities || [])
              .join(", ") ||
              "—"
          )}
        </p>

        <p>
          <strong>
            Soil textures:
          </strong>

          ${escapeHTML(
            (p.soils || [])
              .join(", ") ||
              "—"
          )}
        </p>

        <p>
          <strong>
            Site conditions:
          </strong>

          ${escapeHTML(
            (p.conditions || [])
              .join(", ") ||
              "—"
          )}
        </p>

        <p>
          <strong>
            Restoration goals:
          </strong>

          ${escapeHTML(
            (p.goals || [])
              .join(", ") ||
              "—"
          )}
        </p>

      </section>
    `;

    els.dialog.showModal();
  }

  function detailMatch(
    label,
    value,
    matched
  ) {
    return `
      <tr>

        <th>
          ${escapeHTML(label)}
        </th>

        <td>

          <span
            class="${
              matched
                ? "check"
                : "miss"
            }">

            ${
              matched
                ? "✓ Matches"
                : "○ Not recorded as a match"
            }

          </span>

          <br>

          ${escapeHTML(value)}

        </td>

      </tr>
    `;
  }

  function clearAll() {
    state.community = "";
    state.county = "";
    state.elevation = "";

    [
      state.grazing,
      state.soils,
      state.chemistry,
      state.conditions,
      state.goals
    ].forEach(
      set => set.clear()
    );

    state.query = "";
    state.plantType = "all";
    state.sort = "match";

    els.community.value = "";
    els.county.value = "";
    els.elevation.value = "";
    els.search.value = "";
    els.sort.value = "match";

    document
      .querySelectorAll(
        '.choice input[type="checkbox"]'
      )
      .forEach(
        input => {
          input.checked = false;
        }
      );

    document
      .querySelectorAll(
        ".chip[data-type]"
      )
      .forEach(
        button => {
          button.classList.toggle(
            "is-active",
            button.dataset.type ===
              "all"
          );
        }
      );

    render();
  }

  function notifyHeight() {
    if (
      window.parent !== window
    ) {
      requestAnimationFrame(
        () => {
          window.parent.postMessage(
            {
              type:
                "ecorestore:height",

              height:
                document
                  .documentElement
                  .scrollHeight
            },
            "*"
          );
        }
      );
    }
  }

  window.addEventListener(
    "resize",
    notifyHeight
  );

  new ResizeObserver(
    notifyHeight
  ).observe(
    document.body
  );

  render();

})();
