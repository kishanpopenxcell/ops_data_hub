/**
 * HubSpot API client facade. While USE_MOCK_HUBSPOT=true (default, no dev app/sandbox
 * portal yet) every method returns fixture data from src/lib/mock/hubspot-data.ts.
 * Once a HubSpot developer app + sandbox portal exist, fill in the "real" branch of
 * each method with actual fetch() calls against https://api.hubapi.com -- callers
 * never need to change.
 */

import type { HubspotDeal, HubspotEngagement, HubspotOwner, HubspotPipeline, HubspotTicket } from "./types";
import { mockDeals, mockEngagements, mockOwners, mockPipelines, mockTickets } from "@/lib/mock/hubspot-data";

const useMock = process.env.USE_MOCK_HUBSPOT !== "false";

export interface HubspotClientOptions {
  accessToken: string;
}

// options is unused while useMock short-circuits every method; it stays in the
// signature because the live branch needs accessToken for the Authorization
// header, and callers already pass it.
export function createHubspotClient(options: HubspotClientOptions) {
  void options;

  return {
    async listDeals(): Promise<HubspotDeal[]> {
      if (useMock) return mockDeals;
      throw new Error("Live HubSpot API not yet wired -- set USE_MOCK_HUBSPOT=true or implement this method.");
    },

    async listTickets(): Promise<HubspotTicket[]> {
      if (useMock) return mockTickets;
      throw new Error("Live HubSpot API not yet wired -- set USE_MOCK_HUBSPOT=true or implement this method.");
    },

    async listEngagements(): Promise<HubspotEngagement[]> {
      if (useMock) return mockEngagements;
      throw new Error("Live HubSpot API not yet wired -- set USE_MOCK_HUBSPOT=true or implement this method.");
    },

    async listPipelines(): Promise<HubspotPipeline[]> {
      if (useMock) return mockPipelines;
      throw new Error("Live HubSpot API not yet wired -- set USE_MOCK_HUBSPOT=true or implement this method.");
    },

    async listOwners(): Promise<HubspotOwner[]> {
      if (useMock) return mockOwners;
      throw new Error("Live HubSpot API not yet wired -- set USE_MOCK_HUBSPOT=true or implement this method.");
    },
  };
}
