---
title: "Agent Payments Protocol"
description: "Secure agent-led payments with cryptographic trust. Verifiable credentials, autonomous transactions, multi-platform bookings. Credit cards, crypto, bank transfers."
protocol: "ap2"
category: "payments"
organization: "Google + 60 Organizations"
ontologyDimensions: ["Things", "Events", "Connections", "Knowledge"]
createdAt: 2025-10-30T00:00:00Z
specification:
  version: "1.0"
  status: "stable"
  standards:
    - "Google"
    - "Multi-organization consortium"
    - "Cryptographic verification"
features:
  - name: "Verifiable Credentials"
    description: "Cryptographically signed payment intent with W3C standards"
  - name: "Autonomous Transactions"
    description: "Agents can execute payments without human intervention within limits"
  - name: "Multi-Platform Support"
    description: "Credit cards, crypto, bank transfers, digital wallets"
  - name: "Intent-Based Payments"
    description: "Express payment intent (what, amount, purpose) separately from execution"
ontologyMapping:
  groups: "Payment intents scoped to groups with spending policies"
  people: "Agents have payment authority based on roles and mandates"
  things: "Intent mandates stored as things with cryptographic proofs"
  connections: "Payment relationships track who paid whom for what"
  events: "Payment events with full audit trail (intent, execution, settlement)"
  knowledge: "Payment history and agent credibility stored for risk assessment"
useCases:
  - title: "Agent-Executed Travel Booking"
    description: "Agent books flights, hotels, and rentals within approved budget"
    protocols: ["ap2", "a2a", "mcp"]
  - title: "Autonomous SaaS Subscriptions"
    description: "Agents subscribe to services with pre-approved budgets"
    protocols: ["ap2"]
  - title: "Vendor Payments"
    description: "Agents pay vendors based on pre-approved cost conditions"
    protocols: ["ap2", "acp"]
  - title: "Microtransactions & Micropayments"
    description: "Small autonomous payments for API calls, data, or services"
    protocols: ["ap2", "x402"]
examples:
  - title: "Create Payment Intent Mandate"
    language: "typescript"
    code: |
      // Create intent mandate for agent payment authority
      const mandate = {
        agentId: "agent_travel_planner",
        maxAmount: 5000,
        currency: "USD",
        allowedPaymentMethods: ["credit_card", "bank_transfer"],
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        constraints: {
          perTransaction: 1000,
          perDay: 3000,
          requireApprovalAbove: 2000
        },
        purpose: "Travel booking for employees",
        approverSignature: crypto.sign(mandateData)
      };

      // Store mandate as thing
      const mandateId = await ctx.db.insert("things", {
        type: "intent_mandate",
        name: `Payment Mandate for ${mandate.agentId}`,
        groupId: ctx.auth?.getOrganizationId?.(),
        properties: {
          protocols: {
            ap2: {
              agentId: mandate.agentId,
              maxAmount: mandate.maxAmount,
              currency: mandate.currency,
              constraints: mandate.constraints,
              approverSignature: mandate.approverSignature,
              credentialHash: crypto.hash(JSON.stringify(mandate))
            }
          }
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Log mandate creation
      await ctx.db.insert("events", {
        type: "payment_intent_created",
        groupId: ctx.auth?.getOrganizationId?.(),
        actorId: ctx.auth?.getUserId?.(),
        targetId: mandateId,
        metadata: {
          protocol: "ap2",
          mandateId: mandateId,
          agentId: mandate.agentId,
          maxAmount: mandate.maxAmount
        },
        timestamp: Date.now()
      });

  - title: "Execute Agent Payment"
    language: "typescript"
    code: |
      // Agent executes payment within mandate limits
      const payment = {
        mandateId: "mandate_123",
        agentId: "agent_travel_planner",
        amount: 899.99,
        currency: "USD",
        paymentMethod: "credit_card",
        merchant: "flightbooking.com",
        purpose: "Flight booking for employee_456",
        transactionId: "txn_abc123"
      };

      // Validate against mandate
      const mandate = await ctx.db.get(payment.mandateId);
      if (!validatePaymentAgainstMandate(payment, mandate.properties.protocols.ap2)) {
        throw new Error("Payment violates mandate constraints");
      }

      // Create transaction thing
      const transactionId = await ctx.db.insert("things", {
        type: "payment_transaction",
        name: `Payment to ${payment.merchant}`,
        groupId: ctx.auth?.getOrganizationId?.(),
        properties: {
          protocols: {
            ap2: {
              mandateId: payment.mandateId,
              amount: payment.amount,
              currency: payment.currency,
              merchant: payment.merchant,
              purpose: payment.purpose,
              status: "pending"
            }
          }
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Execute payment
      const result = await executePaymentWithAP2(payment);

      // Update transaction status
      await ctx.db.patch(transactionId, {
        properties: {
          protocols: {
            ap2: {
              ...mandate.properties.protocols.ap2,
              status: result.success ? "completed" : "failed",
              settlementTime: result.settlementTime,
              confirmationId: result.confirmationId
            }
          }
        }
      });

      // Create payment connection
      await ctx.db.insert("connections", {
        type: "transacted",
        fromId: payment.agentId,
        toId: "merchant_" + payment.merchant,
        groupId: ctx.auth?.getOrganizationId?.(),
        metadata: {
          protocol: "ap2",
          transactionId: transactionId,
          amount: payment.amount,
          currency: payment.currency,
          purpose: payment.purpose
        },
        validFrom: Date.now()
      });

      // Log payment event
      await ctx.db.insert("events", {
        type: "payment_executed",
        groupId: ctx.auth?.getOrganizationId?.(),
        actorId: payment.agentId,
        targetId: transactionId,
        metadata: {
          protocol: "ap2",
          amount: payment.amount,
          merchant: payment.merchant,
          status: result.success ? "completed" : "failed"
        },
        timestamp: Date.now()
      });

  - title: "Payment with Human Approval"
    language: "typescript"
    code: |
      // Payment that requires human approval
      const paymentRequest = {
        mandateId: "mandate_123",
        amount: 2500, // Above approval threshold
        merchant: "premium-vendor.com",
        agentId: "agent_purchasing",
        requiresApproval: true
      };

      // Agent initiates but pauses for approval
      const approvalId = await ctx.db.insert("things", {
        type: "payment_approval",
        name: `Approval required for $${paymentRequest.amount} payment`,
        groupId: ctx.auth?.getOrganizationId?.(),
        properties: {
          protocols: {
            ap2: {
              status: "pending_approval",
              payment: paymentRequest,
              requestedAt: Date.now(),
              requestedBy: paymentRequest.agentId
            }
          }
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Human approves
      if (await humanApproves(approvalId)) {
        // Execute payment
        const result = await executePaymentWithAP2(paymentRequest);
        console.log(`Payment approved and executed: ${result.confirmationId}`);
      }
prerequisites:
  - "Payment processor integration (Stripe, PayPal, etc)"
  - "Cryptographic infrastructure for signatures"
  - "Agent identity and role management"
  - "Spending policy definitions"
integrationLevel: "enterprise"
standards:
  - "W3C Verifiable Credentials"
  - "Google AP2 Specification"
  - "PCI Compliance"
  - "Cryptographic standards (RSA, ECDSA)"
organizations:
  - "Google"
  - "Stripe"
  - "Square"
  - "PayPal"
  - "60+ other payment organizations"
draft: false
---

## Overview

AP2 (Agent Payments Protocol) enables autonomous agents to execute payments securely and reliably. The protocol separates the payment **intent** (what the agent wants to pay for) from **execution** (actually processing the payment), allowing for flexible approval workflows.

## Key Characteristics

### Intent-Based Architecture
- **Mandate Creation**: Define payment authority with cryptographic proof
- **Intent Expression**: Agent expresses what it wants to pay for
- **Flexible Approval**: Human approval when needed
- **Autonomous Execution**: Execute within approved limits

### Verifiable Credentials
- W3C standard credentials
- Cryptographic signatures
- Tamper-proof proof of intent
- Complete audit trail

### Multi-Platform Support
- Credit cards and debit cards
- ACH bank transfers
- Cryptocurrency (stablecoins)
- Digital wallets
- Proprietary payment systems

## Payment Flow

```
Agent              Intent Mandate         Approval Flow          Payment Execution
  │                     │                      │                        │
  ├─ Create mandate ──→ [Storage]              │                        │
  │                                            │                        │
  ├─ Request payment ──────────────────────→ [Check limits]            │
  │                                            │                        │
  │                                    ┌─ High amount?                 │
  │                                    │  ├─ Human approval            │
  │                                    │  └─ Approved                  │
  │                                            │                        │
  └─ Execute ────────────────────────────────→ [Process payment] ──→ Settlement
```

## Ontology Integration

AP2 integrates with the 6-dimension ontology for complete payment tracking:

### Things
- **intent_mandate**: Signed payment authorization
- **payment_transaction**: Individual payment execution
- **payment_approval**: Human approval request
- All scoped to group for multi-tenancy

### Connections
- **transacted**: Links agent to merchant with payment details
- **authorized_by**: Links payment to mandating authority
- **approved_by**: Links approval request to approver

### Events
- **payment_intent_created**: Mandate created
- **payment_initiated**: Agent started payment
- **payment_approved**: Human approved payment
- **payment_executed**: Payment processed
- **payment_settled**: Settlement confirmed

### Knowledge
- **Payment history**: All past transactions
- **Agent credibility**: Success rate and compliance
- **Spending patterns**: Understand normal vs anomalous
- **Risk assessment**: ML models for fraud detection

## Security Model

AP2 implements multiple security layers:

1. **Mandate Signing**: Cryptographic proof of authority
2. **Amount Limits**: Per-transaction and per-period caps
3. **Merchant Restrictions**: Only approved vendors
4. **Approval Workflows**: Human review for large amounts
5. **Audit Logging**: Complete transaction history
6. **Fraud Detection**: ML-based anomaly detection

## Mandate Structure

```typescript
Mandate {
  agentId: string;              // Which agent can pay
  maxAmount: number;            // Total authorized
  currency: string;             // Currency (USD, EUR, etc)
  validFrom: Date;              // When mandate starts
  validUntil: Date;             // When mandate expires
  allowedMethods: string[];     // Payment methods allowed
  constraints: {
    perTransaction: number;     // Max per single payment
    perDay: number;             // Max per day
    perMonth: number;           // Max per month
    requireApprovalAbove: number;
  };
  allowedMerchants?: string[];  // Optional whitelist
  approverSignature: string;    // Cryptographic signature
}
```

## Payment Methods

AP2 supports multiple payment methods:

- **Credit/Debit Cards**: Visa, Mastercard, Amex
- **Bank Transfers**: ACH (US), SEPA (EU), faster payment rails
- **Crypto**: Stablecoins (USDC, USDT) on blockchain
- **Digital Wallets**: PayPal, Apple Pay, Google Pay
- **Proprietary**: Business-specific payment systems

## Risk Management

AP2 includes built-in risk management:

- **Velocity Checks**: Detect unusually rapid payments
- **Amount Anomalies**: Flag transactions outside normal ranges
- **Merchant Reputation**: Score merchants for risk
- **Geographic Checks**: Detect unusual locations
- **Device Fingerprinting**: Identify unusual devices
- **Behavioral Analysis**: Learn normal patterns

## Comparison with Other Protocols

| Aspect | AP2 | X402 | ACP |
|--------|-----|------|-----|
| **Primary Use** | Agent payments | Micropayments | Messaging |
| **Payment Type** | Full payments | Tiny payments | N/A |
| **Intent** | Explicit mandate | Implicit per-call | N/A |
| **Settlement** | Minutes to hours | Seconds | N/A |

## Use Cases at Scale

### Travel Agent Scenario
1. Create mandate: $5000/month for travel bookings
2. Agent searches and books flights (ACP to search agents)
3. Agent coordinates hotel and rental (A2A workflow)
4. Agent executes payments within mandate (AP2)
5. All tracked in events for audit

### Vendor Purchasing
1. CFO creates spending mandates for each employee
2. Employees' agents autonomously order approved vendors
3. Payments execute automatically
4. Finance team reviews all transactions
5. System learns and optimizes spending

## Getting Started

1. Set up payment processor integration
2. Define your spending policies
3. Create mandates for your agents
4. Implement approval workflows
5. Deploy agent with payment capability
6. Monitor and refine policies

## Compliance Considerations

- **PCI DSS**: Ensure payment data security
- **SOX**: Financial transaction controls
- **GDPR**: Data privacy for payment data
- **Local Laws**: Payment regulations vary by region
- **Audit Requirements**: Maintain complete trails

## Related Resources

- **AP2 Specification**: [Google AP2 Spec](https://ap2.ai)
- **Payment Integration**: [Stripe, PayPal, Square guides](https://one.ie/connections/ap2.md)
- **Compliance Guide**: [PCI DSS & Financial Regulations](https://one.ie/knowledge)
- **Examples**: [Travel booking, vendor payment](https://github.com/one-ie/ap2-examples)
