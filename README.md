# UC EcoRestore Native Plant Selector — GitHub Pages prototype

A static, iframe-friendly plant-selection app designed to combine the site-assessment approach of the UC EcoRestore California plant search with the richer filtering/results experience of the network of EcoRestore Utah, Arizona assessment tools.

## What is included

- Site assessment: ecosystem, California county, grazing, soil texture, soil chemistry, environmental conditions, and restoration goals.
- Live plant ranking rather than a submit/reload workflow.
- Weighted explanatory score (ecosystem and county are weighted more heavily than optional management attributes).
- Plant functional-group filters, text search, and sorting.
- “Why recommended?” explanation for every plant.
- Plant detail dialog.
- Responsive UC Davis-inspired interface.
- Accessibility basics: semantic fields, labels, keyboard-friendly controls, focus states, reduced-motion support.
- iframe height `postMessage` support.
- No React, build step, backend, database, or third-party JavaScript dependency.

## Important data note

`data/plants.js` contains a **prototype dataset** so the application is immediately functional. The ecological compatibility arrays are not intended to be published as authoritative recommendations at this point in time. We are continuing to replace or validate those arrays in our curated UC EcoRestore source dataset before public release.

Each plant follows this structure:

```js
{
  id: "achillea-millefolium",
  scientific: "Achillea millefolium",
  common: "Common yarrow",
  type: "forb",
  status: "Native",
  ecosystems: ["California grassland"],
  counties: ["Yolo", "Solano"],
  grazing: ["Low", "Moderate"],
  soils: ["Clay", "Loam"],
  chemistry: ["Neutral"],
  conditions: ["Drought"],
  goals: ["Pollinator habitat"],
  services: ["Pollinator resource"],
  notes: "..."
}
```

## Deploy to GitHub Pages

1. Create a GitHub repository, e.g. `ecorestore-plant-selector`.
2. Upload the contents of this folder to the repository root.
3. In GitHub: **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`.
6. Save. GitHub will publish a URL similar to:
   `https://YOUR-ACCOUNT.github.io/ecorestore-plant-selector/`

No `npm install`, Node, React, or build workflow is required.

## Basic SiteFarm iframe

```html
<iframe
  id="ecorestore-plant-selector"
  src="https://YOUR-ACCOUNT.github.io/ecorestore-plant-selector/"
  title="UC EcoRestore Native Plant Selector"
  width="100%"
  height="1200"
  style="border:0; width:100%;"
  loading="lazy">
</iframe>
```

## Optional automatic iframe height

The app sends messages shaped like:

```js
{ type: "ecorestore:height", height: 1432 }
```

If SiteFarm allows a small script on the parent page, use:

```html
<script>
window.addEventListener("message", function (event) {
  const frame = document.getElementById("ecorestore-plant-selector");
  if (!frame || !event.data || event.data.type !== "ecorestore:height") return;
  if (typeof event.data.height === "number") {
    frame.style.height = Math.max(700, event.data.height) + "px";
  }
});
</script>
```

For production, restrict accepted `event.origin` to your GitHub Pages origin rather than accepting arbitrary origins.

## Main files

- `index.html` — app structure and accessibility semantics.
- `styles.css` — responsive UC Davis-inspired presentation.
- `app.js` — filtering, scoring, ranking, detail dialog, iframe messaging.
- `data/filters.js` — assessment choices and all 58 California counties.
- `data/plants.js` — plant records; replace/validate for production.

## Suggested production-data step

Export the existing UC EcoRestore plant information to CSV/JSON, normalize field names to the schema above, then replace `data/plants.js`. The interface does not need to change when the plant database grows.
