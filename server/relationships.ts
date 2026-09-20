import { IncidentCategory, IncidentRelationshipGraph, RelationshipLink, RelationshipNode } from '../src/types';

/**
 * Builds an explainable relationship graph for an incident based on its category, subtype, and context
 */
export function buildRelationshipGraph(
  category: IncidentCategory,
  subtype: string,
  title: string
): IncidentRelationshipGraph {
  const nodes: RelationshipNode[] = [];
  const links: RelationshipLink[] = [];
  let summary = '';

  const cleanSub = (subtype || '').toLowerCase();

  if (category === 'WATER / FLOODING') {
    summary = 'Precipitation/Leakage → Storm Drain Choking → Road Inundation → Arterial Traffic Gridlock';
    nodes.push(
      { id: 'n1', label: 'Heavy Precipitation / Inflow', type: 'cause', description: 'Monsoon rainfall or main pipeline burst' },
      { id: 'n2', label: 'Culvert & Drain Occlusion', type: 'cause', description: 'Stormwater grates choked with silt and plastic debris' },
      { id: 'n3', label: `${title}`, type: 'incident', description: 'Primary waterlogging accumulation event' },
      { id: 'n4', label: 'Submerged Carriageway & Stalled Vehicles', type: 'impact', description: 'Direct physical hazard on roadway lanes' },
      { id: 'n5', label: 'Emergency Transit Disruption', type: 'secondary_impact', description: 'Ambulance, transit bus, and school route blockage' }
    );
    links.push(
      { source: 'n1', target: 'n3', label: 'generates runoff' },
      { source: 'n2', target: 'n3', label: 'impedes discharge' },
      { source: 'n3', target: 'n4', label: 'causes' },
      { source: 'n4', target: 'n5', label: 'cascades to' }
    );
  } else if (category === 'GARBAGE / WASTE') {
    summary = 'Waste Dump Accumulation → Storm Inflow Choke → Biohazard & Pest Proliferation → Open Burning';
    nodes.push(
      { id: 'n1', label: 'Municipal Collection Deficit', type: 'cause', description: 'Missed compactor cycles or illegal commercial dumping' },
      { id: 'n2', label: `${title}`, type: 'incident', description: 'Accumulation of unsegregated refuse' },
      { id: 'n3', label: 'Drain Inflow Obstruction', type: 'impact', description: 'Plastic bottles and aggregate wedged in street drains' },
      { id: 'n4', label: 'Toxic Air Emissions from Burning', type: 'secondary_impact', description: 'Open combustion of plastics releasing dioxins and soot' }
    );
    links.push(
      { source: 'n1', target: 'n2', label: 'leads to' },
      { source: 'n2', target: 'n3', label: 'blocks' },
      { source: 'n2', target: 'n4', label: 'risks' }
    );
  } else if (category === 'FIRE / HAZARD') {
    summary = 'Ignition / Electrical Short → Structural Conflagration → Dense Smoke Dispersion → Corridor Evacuation';
    nodes.push(
      { id: 'n1', label: 'Electrical / Chemical Spark', type: 'cause', description: 'Transformer overload or solvent ignition' },
      { id: 'n2', label: `${title}`, type: 'incident', description: 'Active fire event requiring emergency containment' },
      { id: 'n3', label: 'Toxic Hydrocarbon Smoke Plume', type: 'impact', description: 'Airborne particulates drifting across neighboring residential wards' },
      { id: 'n4', label: 'Emergency Transit Bottleneck', type: 'secondary_impact', description: 'Fire tenders blocked by surrounding gridlock' }
    );
    links.push(
      { source: 'n1', target: 'n2', label: 'triggers' },
      { source: 'n2', target: 'n3', label: 'discharges' },
      { source: 'n2', target: 'n4', label: 'demands' }
    );
  } else if (category === 'AIR POLLUTION / SMOKE') {
    summary = 'Combustion / Industrial Release → Atmospheric Inversion → Particulate Spike → Respiratory Distress';
    nodes.push(
      { id: 'n1', label: 'Uncontrolled Emission Source', type: 'cause', description: 'Industrial stack or biomass open burning' },
      { id: 'n2', label: `${title}`, type: 'incident', description: 'Dense smoke and elevated AQI levels' },
      { id: 'n3', label: 'Severe Visibility Reduction', type: 'impact', description: 'Optical range dropped below safety threshold for transport' },
      { id: 'n4', label: 'Vulnerable Population Exposure', type: 'secondary_impact', description: 'Asthmatic, pediatric, and elderly health alerts' }
    );
    links.push(
      { source: 'n1', target: 'n2', label: 'emits' },
      { source: 'n2', target: 'n3', label: 'induces' },
      { source: 'n2', target: 'n4', label: 'endangers' }
    );
  } else if (category === 'INFRASTRUCTURE DAMAGE') {
    summary = 'Structural Wear & Weathering → Pavement Rupture / Cavity → Vehicular Shock → Collision Risk';
    nodes.push(
      { id: 'n1', label: 'Sub-base Water Infiltration', type: 'cause', description: 'Erosion of asphalt sub-layer during rainfall' },
      { id: 'n2', label: `${title}`, type: 'incident', description: 'Physical pavement rupture or exposed utility manhole' },
      { id: 'n3', label: 'Tire Blowouts & Emergency Swerving', type: 'impact', description: 'Immediate vehicular damage on high-speed artery' },
      { id: 'n4', label: 'Secondary Traffic Stoppage', type: 'secondary_impact', description: 'Lane constriction causing cascading corridor queue' }
    );
    links.push(
      { source: 'n1', target: 'n2', label: 'causes' },
      { source: 'n2', target: 'n3', label: 'induces' },
      { source: 'n3', target: 'n4', label: 'leads to' }
    );
  } else {
    // TRAFFIC / OBSTRUCTION
    summary = 'Node Failure / Collision → Carriageway Bottleneck → Multi-Kilometer Queue → Emergency Impasse';
    nodes.push(
      { id: 'n1', label: 'Signal Outage / Road Obstruction', type: 'cause', description: 'Power failure or fallen object blocking lanes' },
      { id: 'n2', label: `${title}`, type: 'incident', description: 'Flow stoppage on primary vehicular route' },
      { id: 'n3', label: 'Arterial Spillback to Secondary Roads', type: 'impact', description: 'Gridlock spreading across connected feeder network' },
      { id: 'n4', label: 'Emergency Response Retardation', type: 'secondary_impact', description: 'Response vehicles impeded in congested lanes' }
    );
    links.push(
      { source: 'n1', target: 'n2', label: 'creates' },
      { source: 'n2', target: 'n3', label: 'triggers' },
      { source: 'n3', target: 'n4', label: 'impedes' }
    );
  }

  return {
    nodes,
    links,
    summary,
  };
}
