(() => {
  "use strict";
  const plants=window.ECORESTORE_PLANTS||[];
  const filters=window.ECORESTORE_FILTERS||{};
  const state={community:"",county:"",elevation:"",grazing:new Set(),soils:new Set(),chemistry:new Set(),conditions:new Set(),goals:new Set(),plantType:"all",query:"",sort:"match"};
  const weights={community:3,county:3,elevation:2,grazing:1,soils:2,chemistry:2,conditions:2,goals:2};
  const $=id=>document.getElementById(id);
  const els={community:$("community"),county:$("county"),elevation:$("elevation"),grid:$("plant-grid"),count:$("result-count"),summary:$("results-summary"),activeCount:$("active-filter-count"),search:$("plant-search"),sort:$("sort-results"),empty:$("no-results"),dialog:$("plant-dialog"),dialogTitle:$("dialog-title"),dialogScientific:$("dialog-scientific"),dialogKicker:$("dialog-kicker"),dialogContent:$("dialog-content")};

  fillSelect(els.community,filters.communities||[]); fillSelect(els.county,filters.counties||[]);
  buildChoices("grazing-options","grazing",filters.grazing||[]); buildChoices("soil-options","soils",filters.soils||[]); buildChoices("chemistry-options","chemistry",filters.chemistry||[]); buildChoices("condition-options","conditions",filters.conditions||[]); buildChoices("goal-options","goals",filters.goals||[]);
  els.community.addEventListener("change",e=>{state.community=e.target.value;render();});
  els.county.addEventListener("change",e=>{state.county=e.target.value;render();});
  els.elevation.addEventListener("input",e=>{state.elevation=e.target.value;render();});
  els.search.addEventListener("input",e=>{state.query=e.target.value.trim().toLowerCase();render();});
  els.sort.addEventListener("change",e=>{state.sort=e.target.value;render();});
  document.querySelectorAll(".chip[data-type]").forEach(btn=>btn.addEventListener("click",()=>{state.plantType=btn.dataset.type;document.querySelectorAll(".chip[data-type]").forEach(b=>b.classList.toggle("is-active",b===btn));render();}));
  $("clear-all").addEventListener("click",clearAll); $("clear-all-top").addEventListener("click",clearAll); $("dialog-close").addEventListener("click",()=>els.dialog.close()); els.dialog.addEventListener("click",e=>{if(e.target===els.dialog)els.dialog.close();});

  function fillSelect(select,values){values.forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;select.appendChild(o);});}
  function buildChoices(containerId,key,values){const container=$(containerId);values.forEach(value=>{const label=document.createElement("label");label.className="choice";const input=document.createElement("input");input.type="checkbox";input.value=value;input.addEventListener("change",()=>{input.checked?state[key].add(value):state[key].delete(value);render();});const span=document.createElement("span");span.textContent=value;label.append(input,span);container.appendChild(label);});}
  function activeSiteSelections(){return(state.community?1:0)+(state.county?1:0)+(state.elevation!==""?1:0)+state.grazing.size+state.soils.size+state.chemistry.size+state.conditions.size+state.goals.size;}
  function scorePlant(p){let earned=0,possible=0;const reasons=[],misses=[];
    if(state.community){possible+=weights.community;(p.communities||[]).includes(state.community)?(earned+=weights.community,reasons.push(state.community)):misses.push(`Community: ${state.community}`);}
    if(state.county){possible+=weights.county;(p.counties||[]).includes(state.county)?(earned+=weights.county,reasons.push(`${state.county} County`)):misses.push(`${state.county} County`);}
    if(state.elevation!==""){possible+=weights.elevation;const e=Number(state.elevation),lo=p.elevation?.min,hi=p.elevation?.max;const known=Number.isFinite(lo)&&Number.isFinite(hi);known&&e>=lo&&e<=hi?(earned+=weights.elevation,reasons.push(`${e.toLocaleString()} ft elevation`)):misses.push(`Elevation: ${e.toLocaleString()} ft`);}
    [["grazing",state.grazing,"grazing"],["soils",state.soils,"soil"],["chemistry",state.chemistry,"chemistry"],["conditions",state.conditions,"condition"],["goals",state.goals,"goal"]].forEach(([field,selected,label])=>{if(selected.size){const w=weights[field];possible+=w*selected.size;const matched=[...selected].filter(v=>(p[field]||[]).includes(v));earned+=w*matched.length;matched.forEach(v=>reasons.push(v));[...selected].filter(v=>!matched.includes(v)).forEach(v=>misses.push(`${label}: ${v}`));}});
    return{pct:possible?Math.round(100*earned/possible):100,earned,possible,reasons,misses};}
  function matchLabel(pct,hasCriteria){if(!hasCriteria)return"View plant";if(pct>=85)return"Excellent match";if(pct>=65)return"Good match";if(pct>=45)return"Possible match";return"Limited match";}
  function escapeHTML(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
  function firstCommonName(name){return String(name||"").split(/[,;|]/)[0].trim()||String(name||"").trim();}
  function safeURL(v){try{const u=new URL(String(v||"").trim());return["http:","https:"].includes(u.protocol)?u.href:"";}catch{return"";}}
  function link(label,url){const safe=safeURL(url);return safe?`<a href="${escapeHTML(safe)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} ↗</a>`:"";}
  function autoLinkText(value){
    const text=String(value||"");
    if(!text)return"";
    const escaped=escapeHTML(text);
    return escaped.replace(/https?:\/\/[^\s<]+/g,url=>{
      const clean=url.replace(/[),.;]+$/,"");
      const trailing=url.slice(clean.length);
      const safe=safeURL(clean);
      return safe?`<a href="${escapeHTML(safe)}" target="_blank" rel="noopener noreferrer">${escapeHTML(clean)} ↗</a>${escapeHTML(trailing)}`:escapeHTML(url);
    });
  }
  function detailLine(label,value,options={}){
    if(value===undefined||value===null||String(value).trim()==="")return"";
    const body=options.link&&safeURL(value)
      ? link(options.linkLabel||String(value),value)
      : options.autoLink
      ? autoLinkText(value)
      : escapeHTML(value);
    return `<div class="detail-field"><dt>${escapeHTML(label)}</dt><dd>${body}</dd></div>`;
  }
  function detailGrid(lines){const content=lines.filter(Boolean).join("");return content?`<dl class="detail-grid">${content}</dl>`:"";}
  function traitRows(p){
    const labels={salt:"Salt",alkaline:"Alkaline",stronglyAlkaline:"Strongly alkaline",acidic:"Acidic",stronglyAcidic:"Strongly acidic",caco3:"CaCO₃ tolerant",metal:"Metal / serpentine",riparian:"Riparian",disturbance:"Disturbance",fire:"Fire",flooding:"Flooding",lowLight:"Low light",cold:"Cold",pollinators:"Pollinators",drought:"Drought tolerant",wildlife:"Wildlife",forage:"Forage",grazingResponse:"Grazing response",erosion:"Erosion",soilFertility:"Soil nutrients / fertility",water:"Water"};
    return Object.entries(p.traits||{}).filter(([,x])=>x?.detail).map(([k,x])=>`<tr><th>${escapeHTML(labels[k]||k)}</th><td>${escapeHTML(x.detail)}</td></tr>`).join("");
  }
  function rawSoilRows(p){
    const labels={"Clay (Fine)":"Clay (fine)","Loam (sand + clay)":"Loam (sand + clay)","Silt (fine)":"Silt (fine)","Sand (MEDIUM)":"Sand (medium)","Gravel (coarse/rocky)":"Gravel (coarse / rocky)"};
    return Object.entries(p.soil?.classesRaw||{}).map(([k,v])=>`<tr><th>${escapeHTML(labels[k]||k)}</th><td>${escapeHTML(v||"—")}</td></tr>`).join("");
  }

  function imageCandidates(p){const out=[];if(p.photoFileName)out.push(`assets/plants/${String(p.photoFileName).replace(/^assets\/plants\//,"")}`);if(p.plantId)["webp","jpg","jpeg","png"].forEach(ext=>out.push(`assets/plants/${p.plantId}.${ext}`));return[...new Set(out)];}
  function loadPlantThumbnail(article,p){
    const banner=article.querySelector(".card-banner"),img=article.querySelector(".plant-thumbnail");
    if(!banner||!img)return;
    const candidates=imageCandidates(p);
    let i=0;
    banner.hidden=false;
    banner.classList.add("is-loading");

    function next(){
      if(i>=candidates.length){
        img.removeAttribute("src");
        banner.classList.remove("is-loading");
        banner.hidden=true;
        return;
      }
      img.src=candidates[i++];
    }

    img.addEventListener("load",()=>{
      banner.classList.remove("is-loading");
      banner.hidden=false;
    });
    img.addEventListener("error",next);
    next();
  }

  function render(){const hasCriteria=activeSiteSelections()>0;let rows=plants.map(p=>({p,score:scorePlant(p)}));if(state.plantType!=="all")rows=rows.filter(x=>x.p.type===state.plantType);if(state.query)rows=rows.filter(x=>`${x.p.common} ${x.p.scientific} ${x.p.alternateScientific||""} ${x.p.plantId}`.toLowerCase().includes(state.query));rows.sort((a,b)=>state.sort==="common"?a.p.common.localeCompare(b.p.common):state.sort==="scientific"?a.p.scientific.localeCompare(b.p.scientific):b.score.pct-a.score.pct||a.p.common.localeCompare(b.p.common));els.grid.innerHTML="";rows.forEach(({p,score})=>els.grid.appendChild(makeCard(p,score,hasCriteria)));els.count.textContent=rows.length;els.empty.hidden=rows.length!==0;els.activeCount.textContent=`${activeSiteSelections()} selected`;els.summary.textContent=hasCriteria?"Plants are ranked by the recorded characteristics matching your selections.":`Showing all ${plants.length} plants in the EcoRestore dataset.`;notifyHeight();}
  function makeCard(p,score,hasCriteria){const article=document.createElement("article");article.className="plant-card";const top=score.reasons.slice(0,3);article.innerHTML=`<div class="card-banner is-loading"><img class="plant-thumbnail" alt="" loading="lazy" decoding="async"></div><div class="card-body"><div><h3>${escapeHTML(firstCommonName(p.common))}</h3><p class="scientific">${escapeHTML(p.scientific)}</p></div><div class="meta-row"><span class="tag">${escapeHTML(p.type)}</span><span class="tag">${escapeHTML(p.status)}</span>${(p.services||[]).slice(0,2).map(x=>`<span class="tag">${escapeHTML(x)}</span>`).join("")}</div><div class="why"><strong>${escapeHTML(matchLabel(score.pct,hasCriteria))}</strong>${hasCriteria&&top.length?`<br>Matches: ${top.map(escapeHTML).join(", ")}${score.reasons.length>3?"…":""}`:"<br>Select site criteria to rank recorded suitability."}</div><button class="details-button" type="button">Click here to see restoration + plant details <strong aria-hidden="true">→</strong></button></div>`;article.querySelector("button").addEventListener("click",()=>openPlant(p,score,hasCriteria));loadPlantThumbnail(article,p);return article;}

  function openPlant(p,score,hasCriteria){
    els.dialogKicker.textContent=`${p.status} • ${p.growthFormRaw||p.type}`;
    els.dialogTitle.textContent=p.common;
    els.dialogScientific.textContent=p.scientific;

    const matches=[];
    if(state.community)matches.push(detailMatch("Plant community",state.community,(p.communities||[]).includes(state.community)));
    if(state.county)matches.push(detailMatch("County",`${state.county} County`,(p.counties||[]).includes(state.county)));
    if(state.elevation!==""){
      const e=Number(state.elevation),lo=p.elevation?.min,hi=p.elevation?.max;
      matches.push(detailMatch("Elevation",`${e.toLocaleString()} ft`,Number.isFinite(lo)&&Number.isFinite(hi)&&e>=lo&&e<=hi));
    }
    [["Grazing",state.grazing,p.grazing],["Soil texture",state.soils,p.soils],["Soil chemistry",state.chemistry,p.chemistry],["Site conditions",state.conditions,p.conditions],["Restoration goals",state.goals,p.goals]].forEach(([label,sel,avail])=>{
      if(sel.size)[...sel].forEach(v=>matches.push(detailMatch(label,v,(avail||[]).includes(v))));
    });

    const refs=[
      link("Calflora",p.links?.calflora),
      link("Calscape",p.links?.calscape),
      link("USDA Plants",p.links?.usda),
      link("Photo source",p.photoSource)
    ].filter(Boolean).join(" · ");

    const perf=p.performance||{};
    const locationIsURL=!!safeURL(p.location);
    const elevationText=(p.elevation?.minRaw!==""&&p.elevation?.maxRaw!=="")
      ? `${p.elevation.minRaw}–${p.elevation.maxRaw} ft`
      : "";

    els.dialogContent.innerHTML=`
      <section class="detail-section detail-section-highlight">
        <h3>${hasCriteria?`${score.pct}% recorded match — ${matchLabel(score.pct,true)}`:"Plant profile"}</h3>
        ${matches.length
          ? `<table class="match-table"><tbody>${matches.join("")}</tbody></table>`
          : "<p>No site criteria are active. The sections below show the recorded plant information.</p>"}
      </section>

      <section class="detail-section">
        <h3>Identity and status</h3>
        ${detailGrid([
          detailLine("Scientific name",p.scientific),
          detailLine("Alternate scientific name",p.alternateScientific),
          detailLine("Common name(s)",p.common),
          detailLine("Lifecycle",p.lifecycle),
          detailLine("Growing season",p.growingSeason),
          detailLine("Functional group / growth form",p.growthFormRaw||p.type),
          detailLine("Status",p.status)
        ])}
      </section>

      <section class="detail-section">
        <h3>Description</h3>
        <p>${escapeHTML(p.description||"—")}</p>
      </section>

      <section class="detail-section">
        <h3>Photo and external plant resources</h3>
        ${detailGrid([
          detailLine("Photo filename",p.photoFileName),
          detailLine("Photo credit",p.photoCredit),
          detailLine("Photo source",p.photoSource,{link:true,linkLabel:"Open photo source"}),
          detailLine("Calflora",p.links?.calflora,{link:true,linkLabel:"Open Calflora"}),
          detailLine("Calscape",p.links?.calscape,{link:true,linkLabel:"Open Calscape"}),
          detailLine("USDA Plants",p.links?.usda,{link:true,linkLabel:"Open USDA Plants"})
        ])}
        ${refs?`<p class="external-links compact-links">${refs}</p>`:""}
      </section>

      <section class="detail-section">
        <h3>Plant communities, distribution, and elevation</h3>
        ${detailGrid([
          detailLine("Plant community",p.plantCommunity),
          detailLine("All communities found",p.allCommunitiesFound),
          detailLine("Location",p.location,{link:locationIsURL,linkLabel:locationIsURL?"Open location/source":undefined,autoLink:!locationIsURL}),
          detailLine("Minimum elevation",p.elevation?.minRaw!==""?`${p.elevation?.minRaw} ft`:""),
          detailLine("Maximum elevation",p.elevation?.maxRaw!==""?`${p.elevation?.maxRaw} ft`:""),
          detailLine("Elevation range",elevationText),
          detailLine("Recorded California counties",(p.counties||[]).join(", "))
        ])}
      </section>

      <section class="detail-section">
        <h3>Restoration benefits and concerns</h3>
        ${detailGrid([
          detailLine("Benefits / pros",p.benefits),
          detailLine("Concerns / issues",p.concerns),
          detailLine("Normalized restoration services",(p.services||[]).join(", "))
        ])}
        ${(p.services||[]).length?`<div class="detail-list">${p.services.map(x=>`<span class="tag">${escapeHTML(x)}</span>`).join("")}</div>`:""}
      </section>

      <section class="detail-section">
        <h3>Seeding and site preparation</h3>
        ${detailGrid([
          detailLine("Seeding rate",p.seeding?.rate),
          detailLine("Minimum seeding rate",p.seeding?.minimum),
          detailLine("Maximum seeding rate",p.seeding?.maximum),
          detailLine("Soil conditions / site preparation",p.soil?.preparation),
          detailLine("Optimum soil type",p.soil?.optimum),
          detailLine("Suitable soil types",p.soil?.suitable),
          detailLine("Normalized selectable soil textures",(p.soils||[]).join(", "))
        ])}
      </section>

      <section class="detail-section">
        <h3>Source soil-texture fields</h3>
        <table class="match-table compact-table"><tbody>${rawSoilRows(p)}</tbody></table>
      </section>

      <section class="detail-section">
        <h3>Soil chemistry, site tolerances, and ecosystem-service traits</h3>
        <table class="match-table"><tbody>${traitRows(p)}</tbody></table>
      </section>

      <section class="detail-section">
        <h3>Normalized search categories</h3>
        ${detailGrid([
          detailLine("Soil chemistry",(p.chemistry||[]).join(", ")),
          detailLine("Site conditions",(p.conditions||[]).join(", ")),
          detailLine("Restoration goals",(p.goals||[]).join(", ")),
          detailLine("Grazing",(p.grazing||[]).join(", "))
        ])}
      </section>

      <section class="detail-section">
        <h3>Germination, establishment, and performance</h3>
        ${detailGrid([
          detailLine("Germination overall",perf.germinationOverall),
          detailLine("Germination rate",perf.germinationRate),
          detailLine("Germination requirements",perf.germinationRequirements),
          detailLine("Establishment",perf.establishment),
          detailLine("Growth rate",perf.growthRate),
          detailLine("Reproduction",perf.reproduction),
          detailLine("Survival",perf.survival),
          detailLine("Lifespan",perf.lifespan),
          detailLine("Cover",perf.cover),
          detailLine("Competitive",perf.competitive),
          detailLine("Weedy",perf.weedy),
          detailLine("Genetics",perf.genetics),
          detailLine("Toxicity",perf.toxicity),
          detailLine("Enhances fire",perf.enhancesFire),
          detailLine("Commercial availability",perf.commercial)
        ])}
      </section>

      <section class="detail-section">
        <h3>Sources and citations</h3>
        ${detailGrid([
          detailLine("Citations",p.citations?.sourceText,{autoLink:true}),
          detailLine("Citation notes",p.citations?.citationNotes,{autoLink:true})
        ])}
        <p class="detail-note">Internal master-table fields not intended for public display are not included in this browser dataset.</p>
      </section>`;

    els.dialog.showModal();
  }

  function detailMatch(label,value,matched){return`<tr><th>${escapeHTML(label)}</th><td><span class="${matched?"check":"miss"}">${matched?"✓ Matches":"○ Not recorded as a match"}</span><br>${escapeHTML(value)}</td></tr>`;}
  function clearAll(){state.community="";state.county="";state.elevation="";[state.grazing,state.soils,state.chemistry,state.conditions,state.goals].forEach(x=>x.clear());state.query="";state.plantType="all";state.sort="match";els.community.value="";els.county.value="";els.elevation.value="";els.search.value="";els.sort.value="match";document.querySelectorAll('.choice input[type="checkbox"]').forEach(i=>i.checked=false);document.querySelectorAll(".chip[data-type]").forEach(b=>b.classList.toggle("is-active",b.dataset.type==="all"));render();}
  function notifyHeight(){if(window.parent!==window)requestAnimationFrame(()=>window.parent.postMessage({type:"ecorestore:height",height:document.documentElement.scrollHeight},"*"));}
  window.addEventListener("resize",notifyHeight);new ResizeObserver(notifyHeight).observe(document.body);render();
})();
