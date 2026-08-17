(() => {
  "use strict";
  const plants = window.ECORESTORE_PLANTS || [];
  const filters = window.ECORESTORE_FILTERS || {};
  const state = { ecosystem:"", county:"", grazing:new Set(), soils:new Set(), chemistry:new Set(), conditions:new Set(), goals:new Set(), plantType:"all", query:"", sort:"match" };
  const weights = { ecosystem:3, county:3, grazing:1, soils:2, chemistry:2, conditions:2, goals:2 };
  const $ = id => document.getElementById(id);

  const els = {
    ecosystem:$("ecosystem"), county:$("county"), grid:$("plant-grid"), count:$("result-count"), summary:$("results-summary"),
    activeCount:$("active-filter-count"), search:$("plant-search"), sort:$("sort-results"), empty:$("no-results"), dialog:$("plant-dialog"),
    dialogTitle:$("dialog-title"), dialogScientific:$("dialog-scientific"), dialogKicker:$("dialog-kicker"), dialogContent:$("dialog-content")
  };

  fillSelect(els.ecosystem, filters.ecosystems || []);
  fillSelect(els.county, filters.counties || []);
  buildChoices("grazing-options", "grazing", filters.grazing || []);
  buildChoices("soil-options", "soils", filters.soils || []);
  buildChoices("chemistry-options", "chemistry", filters.chemistry || []);
  buildChoices("condition-options", "conditions", filters.conditions || []);
  buildChoices("goal-options", "goals", filters.goals || []);

  els.ecosystem.addEventListener("change", e => { state.ecosystem=e.target.value; render(); });
  els.county.addEventListener("change", e => { state.county=e.target.value; render(); });
  els.search.addEventListener("input", e => { state.query=e.target.value.trim().toLowerCase(); render(); });
  els.sort.addEventListener("change", e => { state.sort=e.target.value; render(); });
  document.querySelectorAll(".chip[data-type]").forEach(btn => btn.addEventListener("click", () => {
    state.plantType=btn.dataset.type;
    document.querySelectorAll(".chip[data-type]").forEach(b=>b.classList.toggle("is-active", b===btn));
    render();
  }));
  $("clear-all").addEventListener("click", clearAll); $("clear-all-top").addEventListener("click", clearAll);
  $("dialog-close").addEventListener("click", () => els.dialog.close());
  els.dialog.addEventListener("click", e => { if(e.target===els.dialog) els.dialog.close(); });

  function fillSelect(select, values){ values.forEach(v=>{ const o=document.createElement("option"); o.value=v; o.textContent=v; select.appendChild(o); }); }
  function buildChoices(containerId, key, values){
    const container=$(containerId);
    values.forEach(value=>{
      const label=document.createElement("label"); label.className="choice";
      const input=document.createElement("input"); input.type="checkbox"; input.value=value;
      input.addEventListener("change",()=>{ input.checked ? state[key].add(value) : state[key].delete(value); render(); });
      const span=document.createElement("span"); span.textContent=value;
      label.append(input,span); container.appendChild(label);
    });
  }

  function activeSiteSelections(){ return (state.ecosystem?1:0)+(state.county?1:0)+state.grazing.size+state.soils.size+state.chemistry.size+state.conditions.size+state.goals.size; }
  function intersectionCount(selected, available){ let n=0; selected.forEach(v=>{ if((available||[]).includes(v)) n++; }); return n; }
  function scorePlant(p){
    let earned=0, possible=0; const reasons=[]; const misses=[];
    if(state.ecosystem){ possible+=weights.ecosystem; (p.ecosystems||[]).includes(state.ecosystem) ? (earned+=weights.ecosystem,reasons.push(state.ecosystem)) : misses.push(`Ecosystem: ${state.ecosystem}`); }
    if(state.county){ possible+=weights.county; (p.counties||[]).includes(state.county) ? (earned+=weights.county,reasons.push(`${state.county} County`)) : misses.push(`${state.county} County`); }
    [["grazing",state.grazing,"grazing"],["soils",state.soils,"soil"],["chemistry",state.chemistry,"chemistry"],["conditions",state.conditions,"condition"],["goals",state.goals,"goal"]].forEach(([field, selected, label])=>{
      if(selected.size){ const w=weights[field]; possible += w*selected.size; const matched=[...selected].filter(v=>(p[field]||[]).includes(v)); earned += w*matched.length; matched.forEach(v=>reasons.push(v)); [...selected].filter(v=>!matched.includes(v)).forEach(v=>misses.push(`${label}: ${v}`)); }
    });
    const pct = possible ? Math.round(100*earned/possible) : 100;
    return {pct, earned, possible, reasons, misses};
  }

  function matchLabel(pct, hasCriteria){ if(!hasCriteria) return "View plant"; if(pct>=85) return "Excellent match"; if(pct>=65) return "Good match"; if(pct>=45) return "Possible match"; return "Limited match"; }
  function initials(name){ return name.split(/\s+/).slice(0,2).map(x=>x[0]).join(""); }
  function escapeHTML(s){ return String(s??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }

  function render(){
    const hasCriteria=activeSiteSelections()>0;
    let rows=plants.map(p=>({p,score:scorePlant(p)}));
    if(state.plantType!=="all") rows=rows.filter(x=>x.p.type===state.plantType);
    if(state.query) rows=rows.filter(x=>`${x.p.common} ${x.p.scientific}`.toLowerCase().includes(state.query));
    rows.sort((a,b)=> state.sort==="common" ? a.p.common.localeCompare(b.p.common) : state.sort==="scientific" ? a.p.scientific.localeCompare(b.p.scientific) : b.score.pct-a.score.pct || a.p.common.localeCompare(b.p.common));

    els.grid.innerHTML="";
    rows.forEach(({p,score})=>els.grid.appendChild(makeCard(p,score,hasCriteria)));
    els.count.textContent=rows.length;
    els.empty.hidden=rows.length!==0;
    els.activeCount.textContent=`${activeSiteSelections()} selected`;
    els.summary.textContent = hasCriteria ? "Site criteria rank all compatible records; higher-scoring plants match more of your selections." : "Showing all plants in the starter dataset. Add site criteria to rank recommendations.";
    notifyHeight();
  }

  function makeCard(p,score,hasCriteria){
    const article=document.createElement("article"); article.className="plant-card";
    const topReasons=score.reasons.slice(0,3);
    article.innerHTML=`
      <div class="card-banner"><span class="botanical-mark" aria-hidden="true">${escapeHTML(initials(p.scientific))}</span><span class="match-badge">${hasCriteria?score.pct+"%":"Native"}</span></div>
      <div class="card-body">
        <div><h3>${escapeHTML(p.common)}</h3><p class="scientific">${escapeHTML(p.scientific)}</p></div>
        <div class="meta-row"><span class="tag">${escapeHTML(p.type)}</span><span class="tag">${escapeHTML(p.status)}</span>${(p.services||[]).slice(0,2).map(s=>`<span class="tag">${escapeHTML(s)}</span>`).join("")}</div>
        <div class="why"><strong>${escapeHTML(matchLabel(score.pct,hasCriteria))}</strong>${hasCriteria && topReasons.length ? `<br>Matches: ${topReasons.map(escapeHTML).join(", ")}${score.reasons.length>3?"…":""}` : "<br>Select site criteria to see why it ranks."}</div>
        <button class="details-button" type="button">Why recommended + plant details →</button>
      </div>`;
    article.querySelector("button").addEventListener("click",()=>openPlant(p,score,hasCriteria));
    return article;
  }

  function openPlant(p,score,hasCriteria){
    els.dialogKicker.textContent=`${p.status} ${p.type}`; els.dialogTitle.textContent=p.common; els.dialogScientific.textContent=p.scientific;
    const rows=[];
    if(state.ecosystem) rows.push(detailMatch("Ecosystem",state.ecosystem,(p.ecosystems||[]).includes(state.ecosystem)));
    if(state.county) rows.push(detailMatch("County",`${state.county} County`,(p.counties||[]).includes(state.county)));
    [["Grazing",state.grazing,p.grazing],["Soil texture",state.soils,p.soils],["Soil chemistry",state.chemistry,p.chemistry],["Site conditions",state.conditions,p.conditions],["Restoration goals",state.goals,p.goals]].forEach(([label,selected,available])=>{
      if(selected.size) [...selected].forEach(v=>rows.push(detailMatch(label,v,(available||[]).includes(v))));
    });
    els.dialogContent.innerHTML=`
      <section class="detail-section"><h3>${hasCriteria?`${score.pct}% site match — ${matchLabel(score.pct,true)}`:"Site matching"}</h3>
        ${rows.length?`<table class="match-table"><tbody>${rows.join("")}</tbody></table>`:"<p>No site criteria are active. Close this window and choose site characteristics to generate an explanation.</p>"}
      </section>
      <section class="detail-section"><h3>Ecosystem services supplied</h3><div class="detail-list">${(p.services||[]).map(x=>`<span class="tag">${escapeHTML(x)}</span>`).join("")}</div></section>
      <section class="detail-section"><h3>Starter record note</h3><p>${escapeHTML(p.notes||"")}</p></section>
      <section class="detail-section"><h3>Recorded compatibility fields</h3>
        <p><strong>Ecosystems:</strong> ${escapeHTML((p.ecosystems||[]).join(", ")||"—")}</p>
        <p><strong>Soils:</strong> ${escapeHTML((p.soils||[]).join(", ")||"—")}</p>
        <p><strong>Conditions:</strong> ${escapeHTML((p.conditions||[]).join(", ")||"—")}</p>
        <p><strong>Goals:</strong> ${escapeHTML((p.goals||[]).join(", ")||"—")}</p>
      </section>`;
    els.dialog.showModal();
  }
  function detailMatch(label,value,matched){ return `<tr><th>${escapeHTML(label)}</th><td><span class="${matched?"check":"miss"}">${matched?"✓ Matches":"○ Not recorded as a match"}</span><br>${escapeHTML(value)}</td></tr>`; }

  function clearAll(){
    state.ecosystem=""; state.county=""; [state.grazing,state.soils,state.chemistry,state.conditions,state.goals].forEach(s=>s.clear()); state.query=""; state.plantType="all"; state.sort="match";
    els.ecosystem.value=""; els.county.value=""; els.search.value=""; els.sort.value="match";
    document.querySelectorAll('.choice input[type="checkbox"]').forEach(i=>i.checked=false);
    document.querySelectorAll(".chip[data-type]").forEach(b=>b.classList.toggle("is-active",b.dataset.type==="all"));
    render();
  }

  function notifyHeight(){
    if(window.parent!==window){ requestAnimationFrame(()=>window.parent.postMessage({type:"ecorestore:height",height:document.documentElement.scrollHeight},"*")); }
  }
  window.addEventListener("resize",notifyHeight); new ResizeObserver(notifyHeight).observe(document.body);
  render();
})();
