/*
  STARTER / PROTOTYPE DATA ONLY.
  Scientific/common names, plant group, native classification and example ecosystem-service labels
  mirror the kinds of fields shown in UC EcoRestore. Site-compatibility arrays below are provided to
  exercise the application and ranking logic; validate/replace them with the authoritative UC dataset
  before public ecological decision support.
*/
window.ECORESTORE_PLANTS = [
  {
    id:"achillea-millefolium", scientific:"Achillea millefolium", common:"Common yarrow", type:"forb", status:"Native",
    ecosystems:["California grassland","Coastal scrub"], counties:["Yolo","Solano","Napa","Sonoma","Marin","Alameda","Contra Costa","Santa Clara","Monterey","Santa Barbara","Ventura"],
    grazing:["Low","Moderate"], soils:["Clay","Loam","Sand"], chemistry:["Neutral","Alkaline"],
    conditions:["Drought","Frequent disturbance","Partial shade"], goals:["Biodiversity","Pollinator habitat","Wildlife habitat","Water-wise planting"],
    services:["Pollinator resource","Wildlife habitat"], notes:"A familiar native forb included here to demonstrate multi-goal matching and the plant detail view."
  },
  {
    id:"amsinckia-intermedia", scientific:"Amsinckia intermedia", common:"Common fiddleneck", type:"forb", status:"Native",
    ecosystems:["California grassland"], counties:["Yolo","Solano","Napa","Sacramento","San Joaquin","Stanislaus","Merced","Alameda","Contra Costa"],
    grazing:["None","Low"], soils:["Clay","Loam"], chemistry:["Neutral","Alkaline"],
    conditions:["Drought","Frequent disturbance"], goals:["Biodiversity","Pollinator habitat","Water-wise planting"],
    services:["Pollinator resource"], notes:"Species currently represented in the UC EcoRestore plant search; compatibility fields here are prototype values."
  },
  {
    id:"amsinckia-menziesii", scientific:"Amsinckia menziesii", common:"Fiddleneck", type:"forb", status:"Native",
    ecosystems:["California grassland"], counties:["Yolo","Solano","Napa","Sonoma","Lake","Colusa","Glenn","Butte","Tehama"],
    grazing:["None","Low"], soils:["Loam","Sand"], chemistry:["Neutral"],
    conditions:["Drought","Frequent disturbance"], goals:["Biodiversity","Pollinator habitat"],
    services:["Pollinator resource"], notes:"Species currently represented in the UC EcoRestore plant search; compatibility fields here are prototype values."
  },
  {
    id:"calandrinia-ciliata", scientific:"Calandrinia ciliata", common:"Redmaids", type:"forb", status:"Native",
    ecosystems:["California grassland","Coastal scrub"], counties:["Yolo","Solano","Napa","Sonoma","Marin","Monterey","San Luis Obispo","Santa Barbara","Ventura","Los Angeles"],
    grazing:["None","Low"], soils:["Loam","Sand"], chemistry:["Neutral"],
    conditions:["Drought","Frequent disturbance"], goals:["Biodiversity","Pollinator habitat","Water-wise planting"],
    services:["Pollinator resource"], notes:"Species currently represented in the UC EcoRestore plant search; compatibility fields here are prototype values."
  },
  {
    id:"castilleja-exserta", scientific:"Castilleja exserta", common:"Owl's clover", type:"forb", status:"Native",
    ecosystems:["California grassland"], counties:["Yolo","Solano","Napa","Alameda","Contra Costa","Santa Clara","Monterey","San Luis Obispo"],
    grazing:["None","Low"], soils:["Clay","Loam"], chemistry:["Neutral"],
    conditions:["Drought"], goals:["Biodiversity","Pollinator habitat"],
    services:["Pollinator resource"], notes:"Species currently represented in the UC EcoRestore plant search; compatibility fields here are prototype values."
  },
  {
    id:"deinandra-fasciculata", scientific:"Deinandra fasciculata", common:"Clustered tarweed", type:"forb", status:"Native",
    ecosystems:["California grassland","Coastal scrub"], counties:["Monterey","San Luis Obispo","Santa Barbara","Ventura","Los Angeles","Orange","San Diego"],
    grazing:["None","Low"], soils:["Clay","Loam","Rocky / shallow"], chemistry:["Neutral","Alkaline"],
    conditions:["Drought","Frequent disturbance","Fire-prone / prescribed fire"], goals:["Biodiversity","Pollinator habitat","Water-wise planting"],
    services:["Pollinator resource"], notes:"Species currently represented in the UC EcoRestore plant search; compatibility fields here are prototype values."
  },
  {
    id:"eremocarpus-setigerus", scientific:"Eremocarpus setigerus", common:"Turkey mullein", type:"forb", status:"Native",
    ecosystems:["California grassland"], counties:["Yolo","Solano","Napa","Sacramento","San Joaquin","Stanislaus","Merced","Fresno"],
    grazing:["Low","Moderate"], soils:["Clay","Loam"], chemistry:["Neutral","Alkaline"],
    conditions:["Drought","Frequent disturbance"], goals:["Biodiversity","Wildlife habitat","Water-wise planting"],
    services:["Wildlife habitat"], notes:"Species currently represented in the UC EcoRestore plant search; compatibility fields here are prototype values."
  },
  {
    id:"hemizonia-congesta", scientific:"Hemizonia congesta", common:"Hayfield tarweed", type:"forb", status:"Native",
    ecosystems:["California grassland"], counties:["Marin","Sonoma","Napa","Solano","Lake","Mendocino"],
    grazing:["Low","Moderate"], soils:["Clay","Loam"], chemistry:["Neutral"],
    conditions:["Drought","Frequent disturbance"], goals:["Biodiversity","Pollinator habitat"],
    services:["Pollinator resource"], notes:"Species currently represented in the UC EcoRestore plant search; compatibility fields here are prototype values."
  },
  {
    id:"layia-platyglossa", scientific:"Layia platyglossa", common:"Coastal tidytips", type:"forb", status:"Native",
    ecosystems:["California grassland","Coastal scrub"], counties:["Marin","Sonoma","Napa","Solano","Alameda","Contra Costa","San Mateo","Santa Cruz","Monterey","San Luis Obispo","Santa Barbara"],
    grazing:["None","Low"], soils:["Loam","Sand"], chemistry:["Neutral"],
    conditions:["Drought"], goals:["Biodiversity","Pollinator habitat","Water-wise planting"],
    services:["Pollinator resource"], notes:"Species currently represented in the UC EcoRestore plant search; compatibility fields here are prototype values."
  },
  {
    id:"lupinus-bicolor", scientific:"Lupinus bicolor", common:"Annual lupine", type:"forb", status:"Native",
    ecosystems:["California grassland","Coastal scrub"], counties:["Yolo","Solano","Napa","Sonoma","Marin","Alameda","Contra Costa","Santa Clara","Monterey","San Luis Obispo"],
    grazing:["None","Low"], soils:["Loam","Sand"], chemistry:["Neutral","Acidic"],
    conditions:["Drought"], goals:["Biodiversity","Pollinator habitat","Soil improvement","Water-wise planting"],
    services:["Pollinator resource","Soil support"], notes:"A native lupine included as a prototype record; validate compatibility attributes before public release."
  },
  {
    id:"elymus-glaucus", scientific:"Elymus glaucus", common:"Blue wildrye", type:"grass", status:"Native",
    ecosystems:["California grassland","Coastal scrub"], counties:["Yolo","Solano","Napa","Sonoma","Marin","Mendocino","Humboldt","Alameda","Contra Costa","Santa Clara"],
    grazing:["Low","Moderate"], soils:["Clay","Loam","Silt"], chemistry:["Neutral","Acidic"],
    conditions:["Partial shade","Fire-prone / prescribed fire"], goals:["Biodiversity","Erosion control","Forage production","Soil improvement","Weed resistance / competition","Wildlife habitat"],
    services:["Erosion control","Forage","Wildlife habitat"], notes:"Prototype grass record included to demonstrate functional-group filtering."
  },
  {
    id:"festuca-microstachys", scientific:"Festuca microstachys", common:"Small fescue", type:"grass", status:"Native",
    ecosystems:["California grassland"], counties:["Yolo","Solano","Napa","Sonoma","Lake","Colusa","Alameda","Contra Costa"],
    grazing:["Low","Moderate"], soils:["Clay","Loam","Rocky / shallow"], chemistry:["Neutral"],
    conditions:["Drought","Frequent disturbance"], goals:["Biodiversity","Erosion control","Forage production","Water-wise planting"],
    services:["Forage","Soil protection"], notes:"Prototype grass record included to demonstrate functional-group filtering."
  },
  {
    id:"baccharis-pilularis", scientific:"Baccharis pilularis", common:"Coyote brush", type:"shrub", status:"Native",
    ecosystems:["Coastal scrub","California grassland"], counties:["Marin","Sonoma","Napa","Alameda","Contra Costa","San Mateo","Santa Cruz","Monterey","San Luis Obispo","Santa Barbara","Ventura"],
    grazing:["None","Low"], soils:["Clay","Loam","Sand","Rocky / shallow"], chemistry:["Neutral"],
    conditions:["Drought","Partial shade","Fire-prone / prescribed fire"], goals:["Biodiversity","Erosion control","Pollinator habitat","Wildlife habitat","Water-wise planting"],
    services:["Pollinator resource","Wildlife habitat","Erosion control"], notes:"Prototype shrub record included to demonstrate coastal scrub results."
  },
  {
    id:"quercus-agrifolia", scientific:"Quercus agrifolia", common:"Coast live oak", type:"tree", status:"Native",
    ecosystems:["Coastal scrub","California grassland"], counties:["Marin","Sonoma","Napa","Alameda","Contra Costa","San Mateo","Santa Clara","Santa Cruz","Monterey","San Luis Obispo","Santa Barbara","Ventura","Los Angeles","Orange","San Diego"],
    grazing:["None","Low"], soils:["Clay","Loam","Sand","Rocky / shallow"], chemistry:["Neutral"],
    conditions:["Drought","Partial shade","Fire-prone / prescribed fire"], goals:["Biodiversity","Erosion control","Wildlife habitat","Water-wise planting"],
    services:["Wildlife habitat","Biodiversity","Soil protection"], notes:"Prototype tree record included to demonstrate the extensible data model."
  }
];
