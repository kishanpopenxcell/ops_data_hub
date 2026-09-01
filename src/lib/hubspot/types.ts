/**
 * HubSpot API response shapes actually consumed by the sync engine.
 * Verify these against a live sandbox portal once one is available -- they
 * were authored from HubSpot's public API docs, not confirmed live.
 */

export interface HubspotDeal {
  id: string;
  properties: {
    hs_object_id: string;
    pipeline: string;
    dealstage: string;
    amount: string | null;
    deal_currency_code: string | null;
    hubspot_owner_id: string | null;
    dealtype: string | null;
    createdate: string;
    closedate: string | null;
    hs_lastmodifieddate: string;
  };
}

export interface HubspotTicket {
  id: string;
  properties: {
    hs_object_id: string;
    hs_pipeline: string;
    hs_pipeline_stage: string;
    hs_ticket_priority: string;
    hubspot_owner_id: string | null;
    createdate: string;
    closed_date: string | null;
    hs_first_response_time: string | null;
    hs_time_to_close: string | null;
  };
}

export interface HubspotEngagement {
  id: string;
  type: "call" | "email" | "meeting" | "note" | "task";
  properties: {
    hs_object_id: string;
    hubspot_owner_id: string | null;
    hs_timestamp: string;
  };
}

export interface HubspotPipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  metadata: {
    probability?: string;
    isClosed: boolean;
  };
}

export interface HubspotPipeline {
  pipelineId: string;
  label: string;
  stages: HubspotPipelineStage[];
}

export interface HubspotOwner {
  id: string;
  firstName: string;
  lastName: string;
  teams?: { id: string; name: string }[];
  archived: boolean;
}

export interface HubspotPropertyHistoryEntry {
  value: string;
  timestamp: string;
}
