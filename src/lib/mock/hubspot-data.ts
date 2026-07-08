/**
 * Mock HubSpot data used while USE_MOCK_HUBSPOT=true (no dev app / sandbox portal yet).
 * Shapes mirror src/lib/hubspot/types.ts. Swap the client in src/lib/hubspot/client.ts
 * for a real API-backed implementation once a HubSpot developer account + sandbox
 * portal exist -- see DESIGN_02_HubSpot_Field_Mapping.md.
 */

import type {
  HubspotDeal,
  HubspotEngagement,
  HubspotOwner,
  HubspotPipeline,
  HubspotTicket,
} from "@/lib/hubspot/types";

export const mockOwners: HubspotOwner[] = [
  { id: "owner-1", firstName: "Asha", lastName: "Rao", teams: [{ id: "team-1", name: "Enterprise" }], archived: false },
  { id: "owner-2", firstName: "Diego", lastName: "Martins", teams: [{ id: "team-1", name: "Enterprise" }], archived: false },
  { id: "owner-3", firstName: "Priya", lastName: "Nair", teams: [{ id: "team-2", name: "SMB" }], archived: false },
];

export const mockPipelines: HubspotPipeline[] = [
  {
    pipelineId: "default",
    label: "Sales Pipeline",
    stages: [
      { id: "appointmentscheduled", label: "Appointment Scheduled", displayOrder: 0, metadata: { probability: "0.2", isClosed: false } },
      { id: "qualifiedtobuy", label: "Qualified to Buy", displayOrder: 1, metadata: { probability: "0.4", isClosed: false } },
      { id: "presentationscheduled", label: "Presentation Scheduled", displayOrder: 2, metadata: { probability: "0.6", isClosed: false } },
      { id: "closedwon", label: "Closed Won", displayOrder: 3, metadata: { probability: "1.0", isClosed: true } },
      { id: "closedlost", label: "Closed Lost", displayOrder: 4, metadata: { probability: "0.0", isClosed: true } },
    ],
  },
];

export const mockDeals: HubspotDeal[] = [
  {
    id: "1001",
    properties: {
      hs_object_id: "1001",
      pipeline: "default",
      dealstage: "closedwon",
      amount: "42000",
      deal_currency_code: "USD",
      hubspot_owner_id: "owner-1",
      dealtype: "newbusiness",
      createdate: "2026-05-01T10:00:00Z",
      closedate: "2026-06-15T15:00:00Z",
      hs_lastmodifieddate: "2026-06-15T15:00:00Z",
    },
  },
  {
    id: "1002",
    properties: {
      hs_object_id: "1002",
      pipeline: "default",
      dealstage: "presentationscheduled",
      amount: "18000",
      deal_currency_code: "USD",
      hubspot_owner_id: "owner-2",
      dealtype: "newbusiness",
      createdate: "2026-06-01T09:00:00Z",
      closedate: null,
      hs_lastmodifieddate: "2026-06-28T09:00:00Z",
    },
  },
  {
    id: "1003",
    properties: {
      hs_object_id: "1003",
      pipeline: "default",
      dealstage: "closedlost",
      amount: "9000",
      deal_currency_code: "USD",
      hubspot_owner_id: "owner-3",
      dealtype: "newbusiness",
      createdate: "2026-04-10T09:00:00Z",
      closedate: "2026-05-20T09:00:00Z",
      hs_lastmodifieddate: "2026-05-20T09:00:00Z",
    },
  },
  {
    id: "1004",
    properties: {
      hs_object_id: "1004",
      pipeline: "default",
      dealstage: "qualifiedtobuy",
      amount: null,
      deal_currency_code: "USD",
      hubspot_owner_id: "owner-1",
      dealtype: "newbusiness",
      createdate: "2026-07-01T09:00:00Z",
      closedate: null,
      hs_lastmodifieddate: "2026-07-05T09:00:00Z",
    },
  },
];

export const mockTickets: HubspotTicket[] = [
  {
    id: "2001",
    properties: {
      hs_object_id: "2001",
      hs_pipeline: "support",
      hs_pipeline_stage: "closed",
      hs_ticket_priority: "HIGH",
      hubspot_owner_id: "owner-3",
      createdate: "2026-07-01T08:00:00Z",
      closed_date: "2026-07-01T12:30:00Z",
      hs_first_response_time: "2026-07-01T08:20:00Z",
      hs_time_to_close: "16200",
    },
  },
  {
    id: "2002",
    properties: {
      hs_object_id: "2002",
      hs_pipeline: "support",
      hs_pipeline_stage: "open",
      hs_ticket_priority: "MEDIUM",
      hubspot_owner_id: "owner-3",
      createdate: "2026-07-06T14:00:00Z",
      closed_date: null,
      hs_first_response_time: null,
      hs_time_to_close: null,
    },
  },
];

export const mockEngagements: HubspotEngagement[] = [
  { id: "3001", type: "call", properties: { hs_object_id: "3001", hubspot_owner_id: "owner-1", hs_timestamp: "2026-07-07T10:00:00Z" } },
  { id: "3002", type: "email", properties: { hs_object_id: "3002", hubspot_owner_id: "owner-1", hs_timestamp: "2026-07-07T11:00:00Z" } },
  { id: "3003", type: "meeting", properties: { hs_object_id: "3003", hubspot_owner_id: "owner-2", hs_timestamp: "2026-07-07T13:00:00Z" } },
];
