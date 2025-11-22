/**
 * Webhook Integration Service (Cycle 66)
 *
 * Handles integration with external systems via webhooks and APIs.
 *
 * ONTOLOGY MAPPING (6 Dimensions):
 * - GROUPS: Group-scoped integration configurations
 * - PEOPLE: Actor permissions for managing integrations
 * - THINGS: external_connection entities for each integration
 * - CONNECTIONS: integrated relationship (funnel → external_connection)
 * - EVENTS: integration_event with triggered/succeeded/failed actions
 * - KNOWLEDGE: Integration patterns and lessons learned
 *
 * SUPPORTED INTEGRATIONS:
 * 1. Custom Webhooks - POST form data to any URL
 * 2. Zapier - Trigger Zaps on form submission
 * 3. Email Marketing - Mailchimp, ConvertKit, ActiveCampaign
 * 4. CRM - HubSpot, Salesforce, Pipedrive
 *
 * ERROR HANDLING:
 * - Exponential backoff retry (3 attempts: 1s, 2s, 4s)
 * - Timeout after 10 seconds
 * - Graceful degradation (don't block form submission)
 * - Full event logging for debugging
 *
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 * @see /.claude/agents/agent-integrator.md - Integration specialist role
 */

import { Effect } from "effect";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface IntegrationConfig {
  type: "webhook" | "zapier" | "mailchimp" | "convertkit" | "activecampaign" | "hubspot" | "salesforce" | "pipedrive";
  name: string;
  enabled: boolean;

  // Webhook-specific
  webhookUrl?: string;
  webhookMethod?: "POST" | "GET";
  webhookHeaders?: Record<string, string>;

  // Zapier-specific
  zapierHookUrl?: string;

  // Email Marketing
  apiKey?: string;
  listId?: string;
  audienceId?: string;

  // CRM-specific
  crmApiKey?: string;
  crmDomain?: string;
  pipelineId?: string;

  // Advanced settings
  retryAttempts?: number;
  timeout?: number;
  fieldMapping?: Record<string, string>;
}

export interface FormSubmissionData {
  name?: string;
  email?: string;
  phone?: string;
  formData: Record<string, any>;
  submittedAt: number;
  funnelId: string;
  funnelName?: string;
  stepId?: string;
  stepName?: string;
}

export interface IntegrationResult {
  success: boolean;
  integrationId: string;
  integrationType: string;
  timestamp: number;
  attempts: number;
  error?: string;
  responseStatus?: number;
  responseBody?: any;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class WebhookTimeoutError {
  readonly _tag = "WebhookTimeoutError";
  constructor(public url: string, public timeout: number) {}
}

export class WebhookHttpError {
  readonly _tag = "WebhookHttpError";
  constructor(
    public url: string,
    public status: number,
    public statusText: string,
    public body?: string
  ) {}
}

export class WebhookNetworkError {
  readonly _tag = "WebhookNetworkError";
  constructor(public url: string, public error: Error) {}
}

export class IntegrationConfigError {
  readonly _tag = "IntegrationConfigError";
  constructor(public message: string) {}
}

// ============================================================================
// WEBHOOK DELIVERY SERVICE
// ============================================================================

export const WebhookService = {
  /**
   * Send webhook with exponential backoff retry
   */
  sendWithRetry: (
    url: string,
    payload: any,
    options: {
      method?: "POST" | "GET";
      headers?: Record<string, string>;
      maxRetries?: number;
      timeout?: number;
    } = {}
  ) =>
    Effect.gen(function* () {
      const maxRetries = options.maxRetries ?? 3;
      const timeout = options.timeout ?? 10000; // 10 seconds
      const method = options.method ?? "POST";
      const headers = {
        "Content-Type": "application/json",
        "User-Agent": "ONE-Platform/1.0",
        ...options.headers,
      };

      let lastError: any;
      let attempts = 0;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        attempts++;

        try {
          // Make HTTP request with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          const response = yield* Effect.tryPromise({
            try: () =>
              fetch(url, {
                method,
                headers,
                body: method === "POST" ? JSON.stringify(payload) : undefined,
                signal: controller.signal,
              }),
            catch: (error) => {
              clearTimeout(timeoutId);
              if (error instanceof Error && error.name === "AbortError") {
                return new WebhookTimeoutError(url, timeout);
              }
              return new WebhookNetworkError(
                url,
                error instanceof Error ? error : new Error(String(error))
              );
            },
          });

          clearTimeout(timeoutId);

          // Check response status
          if (!response.ok) {
            const body = yield* Effect.tryPromise({
              try: () => response.text(),
              catch: () => "",
            });

            // Don't retry on 4xx errors (client errors)
            if (response.status >= 400 && response.status < 500) {
              return yield* Effect.fail(
                new WebhookHttpError(url, response.status, response.statusText, body)
              );
            }

            // Retry on 5xx errors (server errors)
            throw new WebhookHttpError(url, response.status, response.statusText, body);
          }

          // Success - parse response
          const responseBody = yield* Effect.tryPromise({
            try: () => response.json(),
            catch: () => ({}),
          });

          return {
            success: true,
            status: response.status,
            statusText: response.statusText,
            body: responseBody,
            attempts,
          };
        } catch (error) {
          lastError = error;

          // Wait before retry (exponential backoff: 1s, 2s, 4s)
          if (attempt < maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 1000;
            yield* Effect.sleep(`${delay} millis`);
          }
        }
      }

      // All retries failed
      return yield* Effect.fail(lastError);
    }),

  /**
   * Validate webhook URL
   */
  validateUrl: (url: string) =>
    Effect.sync(() => {
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error("Invalid protocol. Must be http or https");
        }
        return true;
      } catch (error) {
        throw new IntegrationConfigError(
          `Invalid webhook URL: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),
};

// ============================================================================
// INTEGRATION HANDLERS
// ============================================================================

export const IntegrationHandlers = {
  /**
   * Send to custom webhook
   */
  webhook: (config: IntegrationConfig, data: FormSubmissionData) =>
    Effect.gen(function* () {
      if (!config.webhookUrl) {
        return yield* Effect.fail(
          new IntegrationConfigError("Webhook URL is required")
        );
      }

      // Validate URL
      yield* WebhookService.validateUrl(config.webhookUrl);

      // Send webhook
      const result = yield* WebhookService.sendWithRetry(
        config.webhookUrl,
        {
          event: "form_submission",
          timestamp: data.submittedAt,
          funnel: {
            id: data.funnelId,
            name: data.funnelName,
          },
          step: {
            id: data.stepId,
            name: data.stepName,
          },
          contact: {
            name: data.name,
            email: data.email,
            phone: data.phone,
          },
          formData: data.formData,
        },
        {
          method: config.webhookMethod || "POST",
          headers: config.webhookHeaders,
          maxRetries: config.retryAttempts,
          timeout: config.timeout,
        }
      );

      return result;
    }),

  /**
   * Trigger Zapier Zap
   */
  zapier: (config: IntegrationConfig, data: FormSubmissionData) =>
    Effect.gen(function* () {
      if (!config.zapierHookUrl) {
        return yield* Effect.fail(
          new IntegrationConfigError("Zapier hook URL is required")
        );
      }

      // Zapier expects a simple payload format
      const result = yield* WebhookService.sendWithRetry(
        config.zapierHookUrl,
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          funnel_id: data.funnelId,
          funnel_name: data.funnelName,
          submitted_at: new Date(data.submittedAt).toISOString(),
          ...data.formData,
        },
        {
          method: "POST",
          maxRetries: config.retryAttempts,
          timeout: config.timeout,
        }
      );

      return result;
    }),

  /**
   * Add subscriber to Mailchimp
   */
  mailchimp: (config: IntegrationConfig, data: FormSubmissionData) =>
    Effect.gen(function* () {
      if (!config.apiKey || !config.audienceId) {
        return yield* Effect.fail(
          new IntegrationConfigError("Mailchimp API key and audience ID are required")
        );
      }

      // Extract datacenter from API key (format: key-dc)
      const datacenter = config.apiKey.split("-")[1];
      const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${config.audienceId}/members`;

      const result = yield* WebhookService.sendWithRetry(
        url,
        {
          email_address: data.email,
          status: "subscribed",
          merge_fields: {
            FNAME: data.name?.split(" ")[0] || "",
            LNAME: data.name?.split(" ").slice(1).join(" ") || "",
            PHONE: data.phone || "",
          },
          tags: [data.funnelName || "funnel"],
        },
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
          maxRetries: config.retryAttempts,
          timeout: config.timeout,
        }
      );

      return result;
    }),

  /**
   * Add subscriber to ConvertKit
   */
  convertkit: (config: IntegrationConfig, data: FormSubmissionData) =>
    Effect.gen(function* () {
      if (!config.apiKey || !config.listId) {
        return yield* Effect.fail(
          new IntegrationConfigError("ConvertKit API key and list ID are required")
        );
      }

      const url = `https://api.convertkit.com/v3/forms/${config.listId}/subscribe`;

      const result = yield* WebhookService.sendWithRetry(
        url,
        {
          api_key: config.apiKey,
          email: data.email,
          first_name: data.name?.split(" ")[0] || "",
          fields: {
            phone: data.phone || "",
            funnel: data.funnelName || "",
          },
        },
        {
          method: "POST",
          maxRetries: config.retryAttempts,
          timeout: config.timeout,
        }
      );

      return result;
    }),

  /**
   * Add contact to ActiveCampaign
   */
  activecampaign: (config: IntegrationConfig, data: FormSubmissionData) =>
    Effect.gen(function* () {
      if (!config.apiKey || !config.crmDomain || !config.listId) {
        return yield* Effect.fail(
          new IntegrationConfigError(
            "ActiveCampaign API key, domain, and list ID are required"
          )
        );
      }

      const url = `https://${config.crmDomain}.api-us1.com/api/3/contacts`;

      const result = yield* WebhookService.sendWithRetry(
        url,
        {
          contact: {
            email: data.email,
            firstName: data.name?.split(" ")[0] || "",
            lastName: data.name?.split(" ").slice(1).join(" ") || "",
            phone: data.phone || "",
          },
        },
        {
          method: "POST",
          headers: {
            "Api-Token": config.apiKey,
          },
          maxRetries: config.retryAttempts,
          timeout: config.timeout,
        }
      );

      return result;
    }),

  /**
   * Create contact in HubSpot
   */
  hubspot: (config: IntegrationConfig, data: FormSubmissionData) =>
    Effect.gen(function* () {
      if (!config.apiKey) {
        return yield* Effect.fail(
          new IntegrationConfigError("HubSpot API key is required")
        );
      }

      const url = "https://api.hubapi.com/crm/v3/objects/contacts";

      const result = yield* WebhookService.sendWithRetry(
        url,
        {
          properties: {
            email: data.email,
            firstname: data.name?.split(" ")[0] || "",
            lastname: data.name?.split(" ").slice(1).join(" ") || "",
            phone: data.phone || "",
            hs_lead_status: "NEW",
          },
        },
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
          maxRetries: config.retryAttempts,
          timeout: config.timeout,
        }
      );

      return result;
    }),

  /**
   * Create lead in Salesforce
   */
  salesforce: (config: IntegrationConfig, data: FormSubmissionData) =>
    Effect.gen(function* () {
      if (!config.apiKey || !config.crmDomain) {
        return yield* Effect.fail(
          new IntegrationConfigError(
            "Salesforce API key (access token) and domain are required"
          )
        );
      }

      const url = `https://${config.crmDomain}.salesforce.com/services/data/v57.0/sobjects/Lead`;

      const result = yield* WebhookService.sendWithRetry(
        url,
        {
          FirstName: data.name?.split(" ")[0] || "",
          LastName: data.name?.split(" ").slice(1).join(" ") || "Unknown",
          Email: data.email,
          Phone: data.phone || "",
          Company: "Funnel Lead",
          LeadSource: "Website",
          Description: `Form submission from funnel: ${data.funnelName}`,
        },
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
          maxRetries: config.retryAttempts,
          timeout: config.timeout,
        }
      );

      return result;
    }),

  /**
   * Create person in Pipedrive
   */
  pipedrive: (config: IntegrationConfig, data: FormSubmissionData) =>
    Effect.gen(function* () {
      if (!config.apiKey || !config.crmDomain) {
        return yield* Effect.fail(
          new IntegrationConfigError("Pipedrive API key and domain are required")
        );
      }

      const url = `https://${config.crmDomain}.pipedrive.com/v1/persons?api_token=${config.apiKey}`;

      const result = yield* WebhookService.sendWithRetry(
        url,
        {
          name: data.name,
          email: [{ value: data.email, primary: true }],
          phone: data.phone ? [{ value: data.phone, primary: true }] : [],
        },
        {
          method: "POST",
          maxRetries: config.retryAttempts,
          timeout: config.timeout,
        }
      );

      return result;
    }),
};

// ============================================================================
// MAIN INTEGRATION TRIGGER
// ============================================================================

/**
 * Trigger all enabled integrations for a form submission
 */
export const triggerIntegrations = (
  integrations: IntegrationConfig[],
  submissionData: FormSubmissionData
) =>
  Effect.gen(function* () {
    const results: IntegrationResult[] = [];

    for (const integration of integrations) {
      if (!integration.enabled) {
        continue;
      }

      const startTime = Date.now();
      let result: IntegrationResult;

      try {
        // Select appropriate handler
        const handler = IntegrationHandlers[integration.type];
        if (!handler) {
          throw new IntegrationConfigError(
            `Unsupported integration type: ${integration.type}`
          );
        }

        // Execute integration
        const webhookResult = yield* handler(integration, submissionData);

        result = {
          success: true,
          integrationId: integration.name,
          integrationType: integration.type,
          timestamp: Date.now(),
          attempts: webhookResult.attempts,
          responseStatus: webhookResult.status,
          responseBody: webhookResult.body,
        };
      } catch (error: any) {
        result = {
          success: false,
          integrationId: integration.name,
          integrationType: integration.type,
          timestamp: Date.now(),
          attempts: error.attempts || 1,
          error: error.message || String(error),
          responseStatus: error.status,
        };
      }

      results.push(result);
    }

    return results;
  });

/**
 * Test a single integration
 */
export const testIntegration = (
  integration: IntegrationConfig,
  testData?: Partial<FormSubmissionData>
) =>
  Effect.gen(function* () {
    const data: FormSubmissionData = {
      name: testData?.name || "Test User",
      email: testData?.email || "test@example.com",
      phone: testData?.phone || "+1234567890",
      formData: testData?.formData || { test: true },
      submittedAt: Date.now(),
      funnelId: testData?.funnelId || "test-funnel-id",
      funnelName: testData?.funnelName || "Test Funnel",
      stepId: testData?.stepId || "test-step-id",
      stepName: testData?.stepName || "Test Step",
    };

    // Select appropriate handler
    const handler = IntegrationHandlers[integration.type];
    if (!handler) {
      return yield* Effect.fail(
        new IntegrationConfigError(
          `Unsupported integration type: ${integration.type}`
        )
      );
    }

    // Execute test
    const result = yield* handler(integration, data);

    return {
      success: true,
      message: "Integration test successful",
      result,
    };
  });
