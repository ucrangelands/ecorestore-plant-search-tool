# UC EcoRestore Plant Selector

Static GitHub Pages application using plain HTML, CSS, and JavaScript. No React, Node, database, or Jekyll is required.

## Data
`data/plants.js` contains the intentionally public browser subset generated from the approved 88-record EcoRestore master table. The private master CSV is **not** included in this project. `notes` and `Citation Code` are excluded. Wide county flags are transformed into `counties[]`; trait fields retain their original explanatory text while also providing normalized filter values.

## Plant photos
Store redistribution-authorized web images in `assets/plants/` using PlantID filenames, e.g. `ACMI.jpg`. Keep photo credit/source metadata in the public plant data.

## GitHub Pages
Upload the folder contents to the repository root and enable GitHub Pages. `.nojekyll` is included so the static app is served as-is.

## SiteFarm iframe
```html
<iframe id="ecorestore-plant-selector" src="https://YOUR-GITHUB-USERNAME.github.io/ecorestore-plant-selector/" title="UC EcoRestore Plant Selection Tool" width="100%" height="1100" style="border:0;width:100%;" loading="lazy"></iframe>
<script>
window.addEventListener("message",function(event){
  if(event.data && event.data.type==="ecorestore:height" && Number.isFinite(event.data.height)){
    document.getElementById("ecorestore-plant-selector").style.height=`${event.data.height}px`;
  }
});
</script>
```

## Interactive soil texture triangle

The site assessment now includes an interactive USDA-style soil texture triangle with the 12 standard texture-class names:

Clay, Silty clay, Sandy clay, Clay loam, Silty clay loam, Sandy clay loam, Loam, Silt loam, Silt, Sandy loam, Loamy sand, and Sand.

Users can select multiple classes either by clicking labels inside the triangle or by using the accessible buttons below the figure. Plant ranking uses the normalized `soilTextureClasses` field derived from the master table's `Suitable soil types` values. The original `Suitable soil types` text remains visible in plant details.
