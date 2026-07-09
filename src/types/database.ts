export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agg_kpi_daily: {
        Row: {
          computed_at: string
          date_key: string
          denominator: number | null
          id: string
          metric_key: string
          metric_version: number
          numerator: number | null
          owner_id: string | null
          pipeline_id: string | null
          priority: string | null
          team_id: string | null
          tenant_id: string
          value: number | null
        }
        Insert: {
          computed_at?: string
          date_key: string
          denominator?: number | null
          id?: string
          metric_key: string
          metric_version?: number
          numerator?: number | null
          owner_id?: string | null
          pipeline_id?: string | null
          priority?: string | null
          team_id?: string | null
          tenant_id: string
          value?: number | null
        }
        Update: {
          computed_at?: string
          date_key?: string
          denominator?: number | null
          id?: string
          metric_key?: string
          metric_version?: number
          numerator?: number | null
          owner_id?: string | null
          pipeline_id?: string | null
          priority?: string | null
          team_id?: string | null
          tenant_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agg_kpi_daily_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agg_kpi_daily_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_profile_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          target: string | null
          tenant_id: string
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target?: string | null
          tenant_id: string
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dim_date: {
        Row: {
          date_key: string
          fiscal_period: string | null
          is_business_day: boolean
        }
        Insert: {
          date_key: string
          fiscal_period?: string | null
          is_business_day?: boolean
        }
        Update: {
          date_key?: string
          fiscal_period?: string | null
          is_business_day?: boolean
        }
        Relationships: []
      }
      dim_owner: {
        Row: {
          active: boolean
          full_name: string | null
          hubspot_owner_id: string
          id: string
          team_id: string | null
          tenant_id: string
          user_profile_id: string | null
        }
        Insert: {
          active?: boolean
          full_name?: string | null
          hubspot_owner_id: string
          id?: string
          team_id?: string | null
          tenant_id: string
          user_profile_id?: string | null
        }
        Update: {
          active?: boolean
          full_name?: string | null
          hubspot_owner_id?: string
          id?: string
          team_id?: string | null
          tenant_id?: string
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dim_owner_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dim_owner_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dim_owner_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dim_pipeline_stage: {
        Row: {
          display_order: number | null
          hubspot_pipeline_id: string
          hubspot_stage_id: string
          id: string
          is_closed: boolean
          is_won: boolean | null
          object_type: string
          pipeline_label: string | null
          probability: number | null
          stage_label: string | null
          tenant_id: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          display_order?: number | null
          hubspot_pipeline_id: string
          hubspot_stage_id: string
          id?: string
          is_closed?: boolean
          is_won?: boolean | null
          object_type: string
          pipeline_label?: string | null
          probability?: number | null
          stage_label?: string | null
          tenant_id: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          display_order?: number | null
          hubspot_pipeline_id?: string
          hubspot_stage_id?: string
          id?: string
          is_closed?: boolean
          is_won?: boolean | null
          object_type?: string
          pipeline_label?: string | null
          probability?: number | null
          stage_label?: string | null
          tenant_id?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dim_pipeline_stage_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_activity: {
        Row: {
          engagement_id: string
          id: string
          occurred_at: string
          owner_id: string | null
          team_id: string | null
          tenant_id: string
          type: string
        }
        Insert: {
          engagement_id: string
          id?: string
          occurred_at: string
          owner_id?: string | null
          team_id?: string | null
          tenant_id: string
          type: string
        }
        Update: {
          engagement_id?: string
          id?: string
          occurred_at?: string
          owner_id?: string | null
          team_id?: string | null
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_activity_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_activity_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_deal_snapshot: {
        Row: {
          amount: number | null
          deal_id: string
          id: string
          is_dq_excluded: boolean
          is_open: boolean
          is_won: boolean | null
          owner_id: string | null
          pipeline_id: string | null
          snapshot_date: string
          stage_id: string | null
          team_id: string | null
          tenant_id: string
        }
        Insert: {
          amount?: number | null
          deal_id: string
          id?: string
          is_dq_excluded?: boolean
          is_open?: boolean
          is_won?: boolean | null
          owner_id?: string | null
          pipeline_id?: string | null
          snapshot_date: string
          stage_id?: string | null
          team_id?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number | null
          deal_id?: string
          id?: string
          is_dq_excluded?: boolean
          is_open?: boolean
          is_won?: boolean | null
          owner_id?: string | null
          pipeline_id?: string | null
          snapshot_date?: string
          stage_id?: string | null
          team_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_deal_snapshot_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_deal_snapshot_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_stage_transition: {
        Row: {
          duration_seconds: number | null
          entered_at: string
          exited_at: string | null
          from_stage_id: string | null
          id: string
          object_id: string
          object_type: string
          owner_id: string | null
          pipeline_id: string | null
          tenant_id: string
          to_stage_id: string
        }
        Insert: {
          duration_seconds?: number | null
          entered_at: string
          exited_at?: string | null
          from_stage_id?: string | null
          id?: string
          object_id: string
          object_type: string
          owner_id?: string | null
          pipeline_id?: string | null
          tenant_id: string
          to_stage_id: string
        }
        Update: {
          duration_seconds?: number | null
          entered_at?: string
          exited_at?: string | null
          from_stage_id?: string | null
          id?: string
          object_id?: string
          object_type?: string
          owner_id?: string | null
          pipeline_id?: string | null
          tenant_id?: string
          to_stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_stage_transition_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_ticket_sla: {
        Row: {
          closed_at: string | null
          created_at: string | null
          first_response_at: string | null
          first_response_within_sla: boolean | null
          id: string
          is_dq_excluded: boolean
          owner_id: string | null
          priority: string | null
          resolution_within_sla: boolean | null
          sla_first_response_target_seconds: number | null
          sla_resolution_target_seconds: number | null
          team_id: string | null
          tenant_id: string
          ticket_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          first_response_at?: string | null
          first_response_within_sla?: boolean | null
          id?: string
          is_dq_excluded?: boolean
          owner_id?: string | null
          priority?: string | null
          resolution_within_sla?: boolean | null
          sla_first_response_target_seconds?: number | null
          sla_resolution_target_seconds?: number | null
          team_id?: string | null
          tenant_id: string
          ticket_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          first_response_at?: string | null
          first_response_within_sla?: boolean | null
          id?: string
          is_dq_excluded?: boolean
          owner_id?: string | null
          priority?: string | null
          resolution_within_sla?: boolean | null
          sla_first_response_target_seconds?: number | null
          sla_resolution_target_seconds?: number | null
          team_id?: string | null
          tenant_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fact_ticket_sla_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_ticket_sla_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hubspot_connections: {
        Row: {
          access_token_secret_ref: string
          created_at: string
          id: string
          last_backfill_at: string | null
          last_synced_at: string | null
          portal_id: string
          refresh_token_secret_ref: string
          scopes_granted: string[]
          status: string
          tenant_id: string
        }
        Insert: {
          access_token_secret_ref: string
          created_at?: string
          id?: string
          last_backfill_at?: string | null
          last_synced_at?: string | null
          portal_id: string
          refresh_token_secret_ref: string
          scopes_granted?: string[]
          status?: string
          tenant_id: string
        }
        Update: {
          access_token_secret_ref?: string
          created_at?: string
          id?: string
          last_backfill_at?: string | null
          last_synced_at?: string | null
          portal_id?: string
          refresh_token_secret_ref?: string
          scopes_granted?: string[]
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hubspot_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          hubspot_owner_id: string | null
          id: string
          role: string
          team_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          hubspot_owner_id?: string | null
          id: string
          role: string
          team_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          hubspot_owner_id?: string | null
          id?: string
          role?: string
          team_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_deals: {
        Row: {
          amount: number | null
          closedate: string | null
          createdate: string | null
          currency: string | null
          dealtype: string | null
          hubspot_deal_id: string
          id: string
          is_deleted: boolean
          owner_id: string | null
          pipeline_id: string | null
          raw_payload: Json | null
          stage_id: string | null
          synced_at: string
          tenant_id: string
        }
        Insert: {
          amount?: number | null
          closedate?: string | null
          createdate?: string | null
          currency?: string | null
          dealtype?: string | null
          hubspot_deal_id: string
          id?: string
          is_deleted?: boolean
          owner_id?: string | null
          pipeline_id?: string | null
          raw_payload?: Json | null
          stage_id?: string | null
          synced_at?: string
          tenant_id: string
        }
        Update: {
          amount?: number | null
          closedate?: string | null
          createdate?: string | null
          currency?: string | null
          dealtype?: string | null
          hubspot_deal_id?: string
          id?: string
          is_deleted?: boolean
          owner_id?: string | null
          pipeline_id?: string | null
          raw_payload?: Json | null
          stage_id?: string | null
          synced_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raw_deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_engagements: {
        Row: {
          associated_deal_id: string | null
          associated_ticket_id: string | null
          duration: number | null
          hubspot_engagement_id: string
          id: string
          is_deleted: boolean
          outcome: string | null
          owner_id: string | null
          raw_payload: Json | null
          synced_at: string
          tenant_id: string
          timestamp: string | null
          type: string
        }
        Insert: {
          associated_deal_id?: string | null
          associated_ticket_id?: string | null
          duration?: number | null
          hubspot_engagement_id: string
          id?: string
          is_deleted?: boolean
          outcome?: string | null
          owner_id?: string | null
          raw_payload?: Json | null
          synced_at?: string
          tenant_id: string
          timestamp?: string | null
          type: string
        }
        Update: {
          associated_deal_id?: string | null
          associated_ticket_id?: string | null
          duration?: number | null
          hubspot_engagement_id?: string
          id?: string
          is_deleted?: boolean
          outcome?: string | null
          owner_id?: string | null
          raw_payload?: Json | null
          synced_at?: string
          tenant_id?: string
          timestamp?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "raw_engagements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_property_history: {
        Row: {
          changed_at: string
          hubspot_object_id: string
          id: string
          object_type: string
          property_name: string
          tenant_id: string
          value: string | null
        }
        Insert: {
          changed_at: string
          hubspot_object_id: string
          id?: string
          object_type: string
          property_name: string
          tenant_id: string
          value?: string | null
        }
        Update: {
          changed_at?: string
          hubspot_object_id?: string
          id?: string
          object_type?: string
          property_name?: string
          tenant_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_property_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_tickets: {
        Row: {
          closed_date: string | null
          createdate: string | null
          first_response_time: string | null
          hubspot_ticket_id: string
          id: string
          is_deleted: boolean
          owner_id: string | null
          pipeline_id: string | null
          priority: string | null
          raw_payload: Json | null
          stage_id: string | null
          synced_at: string
          tenant_id: string
        }
        Insert: {
          closed_date?: string | null
          createdate?: string | null
          first_response_time?: string | null
          hubspot_ticket_id: string
          id?: string
          is_deleted?: boolean
          owner_id?: string | null
          pipeline_id?: string | null
          priority?: string | null
          raw_payload?: Json | null
          stage_id?: string | null
          synced_at?: string
          tenant_id: string
        }
        Update: {
          closed_date?: string | null
          createdate?: string | null
          first_response_time?: string | null
          hubspot_ticket_id?: string
          id?: string
          is_deleted?: boolean
          owner_id?: string | null
          pipeline_id?: string | null
          priority?: string | null
          raw_payload?: Json | null
          stage_id?: string | null
          synced_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raw_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          job_type: string
          object_type: string | null
          records_processed: number
          started_at: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_type: string
          object_type?: string | null
          records_processed?: number
          started_at?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          job_type?: string
          object_type?: string | null
          records_processed?: number
          started_at?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          hubspot_team_id: string
          id: string
          name: string
          parent_team_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          hubspot_team_id: string
          id?: string
          name: string
          parent_team_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          hubspot_team_id?: string
          id?: string
          name?: string
          parent_team_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          reporting_timezone: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          reporting_timezone?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          reporting_timezone?: string
        }
        Relationships: []
      }
    }
    Views: {
      view_activity_summary: {
        Row: {
          activities_per_rep: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fact_activity_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_backlog_age_bands: {
        Row: {
          age_band: string | null
          tenant_id: string | null
          ticket_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_deal_source_mix: {
        Row: {
          deal_count: number | null
          source: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_deals_by_owner: {
        Row: {
          lost_count: number | null
          open_count: number | null
          owner_id: string | null
          owner_name: string | null
          tenant_id: string | null
          won_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_dq_completeness: {
        Row: {
          field: string | null
          missing_count: number | null
          object_type: string | null
          tenant_id: string | null
          total_count: number | null
        }
        Relationships: []
      }
      view_dq_issues: {
        Row: {
          createdate: string | null
          issue_type: string | null
          object_id: string | null
          object_name: string | null
          object_type: string | null
          owner_id: string | null
          owner_name: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
      view_dq_orphan_owners: {
        Row: {
          owner_id: string | null
          record_count: number | null
          tenant_id: string | null
        }
        Relationships: []
      }
      view_dq_stale_records: {
        Row: {
          days_stale: number | null
          last_activity_at: string | null
          object_id: string | null
          object_name: string | null
          object_type: string | null
          owner_id: string | null
          owner_name: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_pipeline_summary: {
        Row: {
          avg_sales_cycle_days: number | null
          decided_count: number | null
          open_value: number | null
          tenant_id: string | null
          weighted_value: number | null
          won_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_recent_activity: {
        Row: {
          activity_type: string | null
          amount: number | null
          object_id: string | null
          occurred_at: string | null
          owner_id: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
      view_revenue_trend: {
        Row: {
          actual: number | null
          month: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_sla_by_priority: {
        Row: {
          attainment: number | null
          priority: string | null
          tenant_id: string | null
          volume: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fact_ticket_sla_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_sla_summary: {
        Row: {
          avg_first_response_days: number | null
          avg_resolution_days: number | null
          open_backlog: number | null
          sla_attainment: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fact_ticket_sla_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_stage_funnel: {
        Row: {
          avg_days: number | null
          deal_count: number | null
          display_order: number | null
          stage_id: string | null
          stage_label: string | null
          tenant_id: string | null
          total_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dim_pipeline_stage_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_stage_velocity: {
        Row: {
          avg_stage_velocity_days: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fact_stage_transition_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_stalled_deals: {
        Row: {
          baseline_avg_days: number | null
          days_in_stage: number | null
          deal_id: string | null
          deal_name: string | null
          entered_at: string | null
          multiple_of_baseline: number | null
          owner_id: string | null
          owner_name: string | null
          stage_id: string | null
          stage_label: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fact_stage_transition_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_ticket_volume_trend: {
        Row: {
          created_count: number | null
          date_key: string | null
          resolved_count: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_owner_id: { Args: never; Returns: string }
      auth_role: { Args: never; Returns: string }
      auth_team_id: { Args: never; Returns: string }
      auth_tenant_id: { Args: never; Returns: string }
      backfill_agg_kpi_daily: {
        Args: { p_days?: number; p_tenant_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
