export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alarm_endpoints: {
        Row: {
          alarm_id: string
          created_at: string
          endpoint_id: string
          id: string
        }
        Insert: {
          alarm_id: string
          created_at?: string
          endpoint_id: string
          id?: string
        }
        Update: {
          alarm_id?: string
          created_at?: string
          endpoint_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alarm_endpoints_alarm_id_fkey"
            columns: ["alarm_id"]
            isOneToOne: false
            referencedRelation: "alarms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alarm_endpoints_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      alarm_events: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alarm_id: string
          device_id: string | null
          id: string
          message: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["alarm_status"]
          trigger_value: number | null
          triggered_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alarm_id: string
          device_id?: string | null
          id?: string
          message: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["alarm_status"]
          trigger_value?: number | null
          triggered_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alarm_id?: string
          device_id?: string | null
          id?: string
          message?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["alarm_status"]
          trigger_value?: number | null
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alarm_events_alarm_id_fkey"
            columns: ["alarm_id"]
            isOneToOne: false
            referencedRelation: "alarms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alarm_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      alarms: {
        Row: {
          condition_operator: Database["public"]["Enums"]["condition_operator"]
          condition_value: Json
          cooldown_minutes: number
          created_at: string
          description: string | null
          device_id: string | null
          enabled: boolean
          id: string
          name: string
          organization_id: string
          reading_type: string
          severity: Database["public"]["Enums"]["alarm_severity"]
          updated_at: string
        }
        Insert: {
          condition_operator: Database["public"]["Enums"]["condition_operator"]
          condition_value: Json
          cooldown_minutes?: number
          created_at?: string
          description?: string | null
          device_id?: string | null
          enabled?: boolean
          id?: string
          name: string
          organization_id: string
          reading_type: string
          severity?: Database["public"]["Enums"]["alarm_severity"]
          updated_at?: string
        }
        Update: {
          condition_operator?: Database["public"]["Enums"]["condition_operator"]
          condition_value?: Json
          cooldown_minutes?: number
          created_at?: string
          description?: string | null
          device_id?: string | null
          enabled?: boolean
          id?: string
          name?: string
          organization_id?: string
          reading_type?: string
          severity?: Database["public"]["Enums"]["alarm_severity"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alarms_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alarms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          last_used: string | null
          name: string
          organization_id: string | null
          prefix: string
          scopes: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          last_used?: string | null
          name: string
          organization_id?: string | null
          prefix: string
          scopes?: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          last_used?: string | null
          name?: string
          organization_id?: string | null
          prefix?: string
          scopes?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_requests_log: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          error_message: string | null
          id: string
          ip_address: string | null
          method: string
          organization_id: string | null
          processing_time_ms: number | null
          request_body: Json | null
          request_headers: Json | null
          request_id: string
          response_body: Json | null
          response_headers: Json | null
          response_status: number | null
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method: string
          organization_id?: string | null
          processing_time_ms?: number | null
          request_body?: Json | null
          request_headers?: Json | null
          request_id: string
          response_body?: Json | null
          response_headers?: Json | null
          response_status?: number | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          method?: string
          organization_id?: string | null
          processing_time_ms?: number | null
          request_body?: Json | null
          request_headers?: Json | null
          request_id?: string
          response_body?: Json | null
          response_headers?: Json | null
          response_status?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_requests_log_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_requests_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          organization_id: string | null
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number | null
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          organization_id?: string | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          organization_id?: string | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          organization_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          organization_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          organization_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_buckets: {
        Row: {
          created_at: string
          description: string | null
          device_id: string
          enabled: boolean
          id: string
          name: string
          organization_id: string
          reading_type: string
          retention_days: number
          s3_config: Json | null
          sampling_interval: number | null
          storage_backend: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          device_id: string
          enabled?: boolean
          id?: string
          name: string
          organization_id: string
          reading_type: string
          retention_days: number
          s3_config?: Json | null
          sampling_interval?: number | null
          storage_backend: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          device_id?: string
          enabled?: boolean
          id?: string
          name?: string
          organization_id?: string
          reading_type?: string
          retention_days?: number
          s3_config?: Json | null
          sampling_interval?: number | null
          storage_backend?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_buckets_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_buckets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      data_volume_usage: {
        Row: {
          data_type: string
          device_id: string | null
          id: string
          organization_id: string | null
          period_date: string | null
          recorded_at: string | null
          volume_bytes: number
        }
        Insert: {
          data_type: string
          device_id?: string | null
          id?: string
          organization_id?: string | null
          period_date?: string | null
          recorded_at?: string | null
          volume_bytes?: number
        }
        Update: {
          data_type?: string
          device_id?: string | null
          id?: string
          organization_id?: string | null
          period_date?: string | null
          recorded_at?: string | null
          volume_bytes?: number
        }
        Relationships: [
          {
            foreignKeyName: "data_volume_usage_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_volume_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      device_connections: {
        Row: {
          connection_end: string | null
          connection_start: string | null
          connection_type: string | null
          created_at: string | null
          device_id: string | null
          duration_seconds: number | null
          id: string
          organization_id: string | null
        }
        Insert: {
          connection_end?: string | null
          connection_start?: string | null
          connection_type?: string | null
          created_at?: string | null
          device_id?: string | null
          duration_seconds?: number | null
          id?: string
          organization_id?: string | null
        }
        Update: {
          connection_end?: string | null
          connection_start?: string | null
          connection_type?: string | null
          created_at?: string | null
          device_id?: string | null
          duration_seconds?: number | null
          id?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_connections_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      device_group_memberships: {
        Row: {
          added_at: string
          device_id: string
          group_id: string
          id: string
        }
        Insert: {
          added_at?: string
          device_id: string
          group_id: string
          id?: string
        }
        Update: {
          added_at?: string
          device_id?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_group_memberships_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "device_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      device_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_readings: {
        Row: {
          device_id: string
          id: string
          metadata: Json | null
          organization_id: string
          reading_type: string
          timestamp: string
          value: number
        }
        Insert: {
          device_id: string
          id?: string
          metadata?: Json | null
          organization_id: string
          reading_type: string
          timestamp?: string
          value: number
        }
        Update: {
          device_id?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          reading_type?: string
          timestamp?: string
          value?: number
        }
        Relationships: []
      }
      devices: {
        Row: {
          description: string | null
          id: string
          last_active_at: string | null
          name: string
          organization_id: string
          product_template_id: string | null
          status: string
          type: string
        }
        Insert: {
          description?: string | null
          id?: string
          last_active_at?: string | null
          name: string
          organization_id: string
          product_template_id?: string | null
          status: string
          type: string
        }
        Update: {
          description?: string | null
          id?: string
          last_active_at?: string | null
          name?: string
          organization_id?: string
          product_template_id?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_product_template_id_fkey"
            columns: ["product_template_id"]
            isOneToOne: false
            referencedRelation: "product_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      endpoint_executions: {
        Row: {
          endpoint_id: string
          executed_at: string
          id: string
          payload: Json | null
          success: boolean
        }
        Insert: {
          endpoint_id: string
          executed_at?: string
          id?: string
          payload?: Json | null
          success: boolean
        }
        Update: {
          endpoint_id?: string
          executed_at?: string
          id?: string
          payload?: Json | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "endpoint_executions_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      endpoints: {
        Row: {
          configuration: Json
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          organization_id: string
          type: string
          updated_at: string
        }
        Insert: {
          configuration: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          organization_id: string
          type: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          organization_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "endpoints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      file_storage_profiles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          index_file: string
          name: string
          organization_id: string
          path: string
          public_read: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          index_file?: string
          name: string
          organization_id: string
          path: string
          public_read?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          index_file?: string
          name?: string
          organization_id?: string
          path?: string
          public_read?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_storage_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["role_type"]
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["role_type"]
          token: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["role_type"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          notify_device_alerts: boolean
          notify_new_devices: boolean
          notify_system_events: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          notify_device_alerts?: boolean
          notify_new_devices?: boolean
          notify_system_events?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          notify_device_alerts?: boolean
          notify_new_devices?: boolean
          notify_system_events?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          delivery_status: string
          expires_at: string | null
          id: string
          is_read: boolean
          priority: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          delivery_status?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          delivery_status?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["role_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["role_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["role_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string | null
          status: string | null
          subscription_plan_id: string | null
          trial_end: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          subscription_plan_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          subscription_plan_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          subscription_plan_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          subscription_plan_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          subscription_plan_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      product_buckets: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          name: string
          product_id: string
          property_id: string
          retention_days: number
          sampling_interval: number | null
          storage_backend: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          product_id: string
          property_id: string
          retention_days: number
          sampling_interval?: number | null
          storage_backend: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          product_id?: string
          property_id?: string
          retention_days?: number
          sampling_interval?: number | null
          storage_backend?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_buckets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_buckets_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "product_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      product_dashboards: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          name: string
          product_id: string
          updated_at: string
        }
        Insert: {
          config: Json
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          product_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_dashboards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      product_properties: {
        Row: {
          created_at: string
          data_type: string
          default_value: Json | null
          description: string | null
          id: string
          is_required: boolean
          name: string
          product_id: string
          unit: string | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          data_type: string
          default_value?: Json | null
          description?: string | null
          id?: string
          is_required?: boolean
          name: string
          product_id: string
          unit?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          data_type?: string
          default_value?: Json | null
          description?: string | null
          id?: string
          is_required?: boolean
          name?: string
          product_id?: string
          unit?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "product_properties_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      product_scripts: {
        Row: {
          code: string
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          product_id: string
          script_type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          product_id: string
          script_type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          product_id?: string
          script_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_scripts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      product_services: {
        Row: {
          config: Json
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          product_id: string
          service_type: string
          updated_at: string
        }
        Insert: {
          config: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name: string
          product_id: string
          service_type: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          name?: string
          product_id?: string
          service_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_services_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      product_templates: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          status: string | null
          tags: string | null
          updated_at: string
          version: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          status?: string | null
          tags?: string | null
          updated_at?: string
          version?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          status?: string | null
          tags?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          default_organization_id: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          default_organization_id?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          default_organization_id?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_organization_id_fkey"
            columns: ["default_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_buckets: {
        Row: {
          api_key_id: string | null
          bucket_type: string
          created_at: string | null
          current_count: number | null
          id: string
          limit_value: number
          reset_time: string
          updated_at: string | null
        }
        Insert: {
          api_key_id?: string | null
          bucket_type: string
          created_at?: string | null
          current_count?: number | null
          id?: string
          limit_value: number
          reset_time: string
          updated_at?: string | null
        }
        Update: {
          api_key_id?: string | null
          bucket_type?: string
          created_at?: string | null
          current_count?: number | null
          id?: string
          limit_value?: number
          reset_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_limit_buckets_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          permission_id: string
          role: Database["public"]["Enums"]["role_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          permission_id: string
          role: Database["public"]["Enums"]["role_type"]
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["role_type"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          advanced_analytics: boolean | null
          billing_interval: string | null
          concurrent_connections: number | null
          created_at: string | null
          currency: string | null
          display_name: string
          features: string[] | null
          id: string
          is_active: boolean | null
          max_api_calls_per_month: number | null
          max_api_keys: number | null
          max_data_retention_days: number | null
          max_devices: number | null
          name: string
          price: number | null
          priority_support: boolean | null
          requests_per_hour: number | null
          requests_per_month: number | null
          updated_at: string | null
        }
        Insert: {
          advanced_analytics?: boolean | null
          billing_interval?: string | null
          concurrent_connections?: number | null
          created_at?: string | null
          currency?: string | null
          display_name: string
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          max_api_calls_per_month?: number | null
          max_api_keys?: number | null
          max_data_retention_days?: number | null
          max_devices?: number | null
          name: string
          price?: number | null
          priority_support?: boolean | null
          requests_per_hour?: number | null
          requests_per_month?: number | null
          updated_at?: string | null
        }
        Update: {
          advanced_analytics?: boolean | null
          billing_interval?: string | null
          concurrent_connections?: number | null
          created_at?: string | null
          currency?: string | null
          display_name?: string
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          max_api_calls_per_month?: number | null
          max_api_keys?: number | null
          max_data_retention_days?: number | null
          max_devices?: number | null
          name?: string
          price?: number | null
          priority_support?: boolean | null
          requests_per_hour?: number | null
          requests_per_month?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      usage_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          organization_id: string | null
          period_end: string
          period_start: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number
          organization_id?: string | null
          period_end: string
          period_start: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          organization_id?: string | null
          period_end?: string
          period_start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      timezone_cache: {
        Row: {
          abbrev: string | null
          is_dst: boolean | null
          name: string | null
          utc_offset: unknown | null
        }
        Relationships: []
      }
    }
    Functions: {
      acknowledge_alarm_event_bypass_rls: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      can_access_device: {
        Args: { p_user_id: string; p_device_id: string }
        Returns: boolean
      }
      check_alarm_condition: {
        Args: {
          p_operator: Database["public"]["Enums"]["condition_operator"]
          p_value: Json
          p_reading_value: number
        }
        Returns: boolean
      }
      check_usage_limits: {
        Args: { p_org_id: string }
        Returns: {
          exceeds_device_limit: boolean
          exceeds_api_limit: boolean
          exceeds_data_limit: boolean
          current_plan_name: string
        }[]
      }
      cleanup_old_api_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_audit_log_entry: {
        Args: {
          p_organization_id: string
          p_user_id: string
          p_action: string
          p_details?: Json
        }
        Returns: boolean
      }
      create_device_bypass_rls: {
        Args: {
          p_name: string
          p_type: string
          p_status: string
          p_description: string
          p_organization_id: string
          p_product_template_id: string
        }
        Returns: {
          description: string | null
          id: string
          last_active_at: string | null
          name: string
          organization_id: string
          product_template_id: string | null
          status: string
          type: string
        }
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_content: string
          p_type?: string
          p_priority?: string
          p_related_entity_type?: string
          p_related_entity_id?: string
          p_expires_at?: string
        }
        Returns: string
      }
      create_product_bypass_rls: {
        Args: {
          p_name: string
          p_description: string
          p_version: string
          p_category: string
          p_tags: string
          p_status: string
          p_organization_id: string
        }
        Returns: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          status: string | null
          tags: string | null
          updated_at: string
          version: string
        }
      }
      create_property_bypass_rls: {
        Args: {
          p_product_id: string
          p_name: string
          p_description: string
          p_data_type: string
          p_unit: string
          p_is_required: boolean
          p_default_value: Json
          p_validation_rules: Json
        }
        Returns: {
          created_at: string
          data_type: string
          default_value: Json | null
          description: string | null
          id: string
          is_required: boolean
          name: string
          product_id: string
          unit: string | null
          updated_at: string
          validation_rules: Json | null
        }
      }
      delete_device_bypass_rls: {
        Args: { p_device_id: string }
        Returns: undefined
      }
      delete_expired_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      delete_property_bypass_rls: {
        Args: { p_id: string }
        Returns: undefined
      }
      ensure_user_has_valid_organization: {
        Args: { p_user_id: string }
        Returns: string
      }
      exec_sql: {
        Args: { sql: string }
        Returns: undefined
      }
      function_exists: {
        Args: { function_name: string }
        Returns: boolean
      }
      generate_api_key_prefix: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_audit_logs: {
        Args: {
          p_organization_id: string
          p_limit?: number
          p_offset?: number
          p_action?: string
          p_user_id?: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: {
          id: string
          organization_id: string
          user_id: string
          action: string
          details: Json
          created_at: string
          ip_address: string
          user_agent: string
        }[]
      }
      get_current_user_organizations: {
        Args: Record<PropertyKey, never>
        Returns: {
          organization_id: string
          role: string
        }[]
      }
      get_device_alarm_events_bypass_rls: {
        Args: { p_device_id: string }
        Returns: {
          id: string
          alarm_id: string
          device_id: string
          status: string
          triggered_at: string
          acknowledged_at: string
          resolved_at: string
          acknowledged_by: string
          trigger_value: number
          message: string
          alarm_name: string
          alarm_description: string
          alarm_severity: string
          device_name: string
          device_type: string
        }[]
      }
      get_device_by_id_bypass_rls: {
        Args: { p_device_id: string }
        Returns: {
          description: string | null
          id: string
          last_active_at: string | null
          name: string
          organization_id: string
          product_template_id: string | null
          status: string
          type: string
        }[]
      }
      get_device_readings_aggregate: {
        Args: {
          p_device_id: string
          p_reading_type: string
          p_start_time: string
          p_end_time: string
          p_interval: unknown
          p_aggregation_type?: string
        }
        Returns: {
          time_bucket: string
          value: number
        }[]
      }
      get_device_readings_delta: {
        Args: {
          p_device_id: string
          p_reading_type: string
          p_start_time: string
          p_end_time: string
        }
        Returns: {
          start_timestamp: string
          end_timestamp: string
          start_value: number
          end_value: number
          delta: number
        }[]
      }
      get_device_readings_optimized: {
        Args: {
          p_device_id: string
          p_reading_type?: string
          p_start_time?: string
          p_end_time?: string
          p_limit?: number
        }
        Returns: {
          id: string
          device_id: string
          reading_type: string
          value: number
          reading_timestamp: string
          metadata: Json
        }[]
      }
      get_devices_by_org_id: {
        Args: { p_organization_id: string }
        Returns: {
          description: string | null
          id: string
          last_active_at: string | null
          name: string
          organization_id: string
          product_template_id: string | null
          status: string
          type: string
        }[]
      }
      get_org_products: {
        Args: { p_org_id: string }
        Returns: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          status: string | null
          tags: string | null
          updated_at: string
          version: string
        }[]
      }
      get_organization_alarms_bypass_rls: {
        Args: { p_org_id: string }
        Returns: {
          id: string
          name: string
          description: string
          organization_id: string
          device_id: string
          enabled: boolean
          reading_type: string
          condition_operator: string
          condition_value: Json
          severity: string
          cooldown_minutes: number
          created_at: string
          updated_at: string
          device_name: string
          device_type: string
          endpoints: string[]
        }[]
      }
      get_organization_current_usage: {
        Args: { p_org_id: string }
        Returns: {
          device_count: number
          api_calls_this_month: number
          data_volume_mb: number
          active_connections: number
        }[]
      }
      get_organization_members: {
        Args: { p_org_id: string }
        Returns: {
          id: string
          user_id: string
          role: string
          username: string
          full_name: string
          email: string
        }[]
      }
      get_organization_members_bypass_rls: {
        Args: { p_org_id: string }
        Returns: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["role_type"]
          updated_at: string
          user_id: string
        }[]
      }
      get_organization_summary: {
        Args: { p_organization_id: string }
        Returns: {
          total_devices: number
          active_devices: number
          total_alarms: number
          active_alarms: number
          total_endpoints: number
          active_endpoints: number
          recent_readings_count: number
        }[]
      }
      get_organization_with_role: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
          role: string
        }[]
      }
      get_product_by_id: {
        Args: { p_id: string }
        Returns: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          status: string | null
          tags: string | null
          updated_at: string
          version: string
        }[]
      }
      get_product_properties: {
        Args: { p_product_id: string }
        Returns: {
          created_at: string
          data_type: string
          default_value: Json | null
          description: string | null
          id: string
          is_required: boolean
          name: string
          product_id: string
          unit: string | null
          updated_at: string
          validation_rules: Json | null
        }[]
      }
      get_product_services: {
        Args: { p_product_id: string }
        Returns: {
          config: Json
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          name: string
          product_id: string
          service_type: string
          updated_at: string
        }[]
      }
      get_timezone_info: {
        Args: { timezone_name?: string }
        Returns: {
          name: string
          abbrev: string
          utc_offset: unknown
          is_dst: boolean
        }[]
      }
      get_user_org_role: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: string
      }
      get_user_organization_id: {
        Args: { p_user_id?: string }
        Returns: string
      }
      get_user_organization_role_bypass_rls: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: string
      }
      get_user_organizations: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          name: string
          slug: string
          role: string
          is_default: boolean
        }[]
      }
      get_user_role: {
        Args: { org_id: string; user_id: string }
        Returns: Database["public"]["Enums"]["role_type"]
      }
      is_org_admin_or_owner: {
        Args: { org_id: string } | { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      is_org_admin_or_owner_bypass_rls: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { org_id: string } | { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      is_org_member_bypass_rls: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      is_organization_admin_bypass_rls: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      is_organization_member_bypass_rls: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: boolean
      }
      mark_all_notifications_as_read: {
        Args: { p_user_id: string }
        Returns: number
      }
      mark_notification_as_read: {
        Args: { p_notification_id: string; p_user_id: string }
        Returns: boolean
      }
      refresh_timezone_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_expired_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      resolve_alarm_event_bypass_rls: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      switch_user_organization: {
        Args: { p_user_id: string; p_org_id: string }
        Returns: boolean
      }
      update_device_bypass_rls: {
        Args: { p_device_id: string; p_data: Json }
        Returns: {
          description: string | null
          id: string
          last_active_at: string | null
          name: string
          organization_id: string
          product_template_id: string | null
          status: string
          type: string
        }
      }
      update_product_bypass_rls: {
        Args: { p_id: string; p_data: Json }
        Returns: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          status: string | null
          tags: string | null
          updated_at: string
          version: string
        }
      }
      update_property_bypass_rls: {
        Args: { p_id: string; p_data: Json }
        Returns: {
          created_at: string
          data_type: string
          default_value: Json | null
          description: string | null
          id: string
          is_required: boolean
          name: string
          product_id: string
          unit: string | null
          updated_at: string
          validation_rules: Json | null
        }
      }
    }
    Enums: {
      alarm_severity: "info" | "warning" | "critical"
      alarm_status: "active" | "acknowledged" | "resolved"
      condition_operator:
        | "gt"
        | "lt"
        | "gte"
        | "lte"
        | "eq"
        | "neq"
        | "between"
        | "outside"
      role_type: "owner" | "admin" | "member" | "viewer"
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
  public: {
    Enums: {
      alarm_severity: ["info", "warning", "critical"],
      alarm_status: ["active", "acknowledged", "resolved"],
      condition_operator: [
        "gt",
        "lt",
        "gte",
        "lte",
        "eq",
        "neq",
        "between",
        "outside",
      ],
      role_type: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
