# Oil Rig Staff Management System - 100-Cycle Implementation Plan

**Generated:** 2025-11-18
**System:** Multi-rig staff management with shift scheduling, certification tracking, safety compliance
**Total Cycles:** 100
**Estimated Duration:** 180 minutes (~3 hours)
**Estimated Cost:** $0.50

---

## Overview

A comprehensive staff management system for oil rig operations featuring multi-rig support, shift scheduling, certification tracking, safety compliance, real-time communication, and emergency protocols.

---

## 6-Dimension Ontology Validation ✅

### 1. GROUPS (Multi-Tenant Isolation)
```typescript
groups: [
  "oil_company",           // Top-level organization
  "oil_rig",              // Individual rig (infinite nesting)
  "department",           // Drilling, Engineering, Safety, Maintenance
  "shift_team",           // Day shift, Night shift, Rotating
  "emergency_response"    // Emergency teams per rig
]
```

**Hierarchy Example:**
```
Shell Oil Company
├── North Sea Rig Alpha
│   ├── Drilling Department
│   │   ├── Day Shift Team
│   │   └── Night Shift Team
│   ├── Safety Department
│   └── Maintenance Department
└── Gulf of Mexico Rig Bravo
    └── [same structure]
```

### 2. PEOPLE (Authorization & Governance)
```typescript
roles: [
  "platform_owner",       // System administrator
  "company_manager",      // Oil company executive (org_owner)
  "rig_manager",          // Rig supervisor (org_owner at rig level)
  "shift_supervisor",     // Shift lead (org_user)
  "worker",              // Rig worker (org_user)
  "contractor",          // External contractor (customer)
  "safety_officer",      // Safety compliance officer (org_user)
  "emergency_coordinator" // Emergency response coordinator (org_user)
]
```

### 3. THINGS (All Entities)
```typescript
things: [
  // Staff records
  "staff_member",        // Worker profile
  "certification",       // Safety certifications, licenses
  "medical_clearance",   // Medical fitness records
  "emergency_contact",   // Emergency contact information

  // Equipment & Assets
  "equipment",          // Safety gear, tools, PPE
  "vehicle",           // Helicopters, boats, transport

  // Scheduling
  "shift_schedule",    // Shift assignments
  "rotation_plan",     // Multi-week rotation schedules
  "time_off_request",  // Leave requests

  // Safety & Compliance
  "safety_record",     // Incident reports
  "drill_record",      // Safety drill participation
  "inspection_report", // Equipment inspections
  "compliance_doc",    // Regulatory compliance documents

  // Training
  "training_module",   // Safety training content
  "training_record",   // Training completion records

  // Communication
  "announcement",      // General announcements
  "emergency_alert",   // Emergency notifications
  "shift_handover"     // Shift handover notes
]
```

### 4. CONNECTIONS (All Relationships)
```typescript
connections: [
  // Staff assignments
  "works_at",           // staff_member → oil_rig
  "assigned_to",        // staff_member → shift_team
  "manages",           // supervisor → staff_member
  "reports_to",        // staff_member → supervisor

  // Certifications
  "certified_for",     // staff_member → certification
  "requires",          // position → certification

  // Equipment
  "operates",          // staff_member → equipment
  "issued_to",         // equipment → staff_member

  // Training
  "completed",         // staff_member → training_module
  "teaches",           // instructor → training_module

  // Safety
  "responded_to",      // staff_member → emergency_alert
  "participated_in"    // staff_member → drill_record
]
```

### 5. EVENTS (Complete Audit Trail)
```typescript
events: [
  // Shift events
  "shift_started",
  "shift_ended",
  "shift_handover_created",
  "shift_swap_requested",
  "shift_swap_approved",

  // Certification events
  "certification_issued",
  "certification_renewed",
  "certification_expired",
  "certification_revoked",

  // Training events
  "training_started",
  "training_completed",
  "training_failed",

  // Safety events
  "incident_reported",
  "incident_investigated",
  "incident_resolved",
  "drill_conducted",
  "drill_completed",

  // Equipment events
  "equipment_checked_out",
  "equipment_returned",
  "equipment_inspected",
  "equipment_maintenance_scheduled",

  // Emergency events
  "emergency_declared",
  "emergency_response_initiated",
  "evacuation_ordered",
  "all_clear_issued",

  // Compliance events
  "inspection_scheduled",
  "inspection_completed",
  "violation_detected",
  "violation_resolved",

  // Personnel events
  "staff_onboarded",
  "staff_offboarded",
  "medical_clearance_issued",
  "medical_clearance_expired"
]
```

### 6. KNOWLEDGE (Labels, Vectors, RAG)
```typescript
knowledge: [
  // Skill taxonomy
  "skill:drilling",
  "skill:welding",
  "skill:electrical",
  "skill:mechanical",
  "skill:safety",
  "skill:first_aid",
  "skill:firefighting",

  // Certification categories
  "cert:offshore_safety",
  "cert:h2s_awareness",
  "cert:confined_space",
  "cert:helicopter_safety",
  "cert:crane_operation",

  // Safety procedures (RAG-enabled)
  "Emergency Response Procedures",
  "Equipment Operating Manuals",
  "Safety Protocols Database",
  "Regulatory Compliance Documents",
  "Incident Investigation Reports",

  // Training materials
  "Training Videos Library",
  "Safety Training Manuals",
  "Equipment Training Guides"
]
```

---

## 100-Cycle Execution Plan

### Phase 0: Foundation & Setup (Cycles 1-10)

#### Cycle 1-2: Ontology Design
**Assigned to:** agent-ontology
**Deliverables:**
- Complete schema design for 5 tables (groups, things, connections, events, knowledge)
- Define indexes for multi-rig queries
- Design hierarchy for company → rig → department → shift
- Create type definitions for all thing types

#### Cycle 3-5: Multi-Tenant Group Structure
**Assigned to:** agent-backend
**Deliverables:**
- Implement hierarchical groups (company → rig → department → shift)
- Create group-scoped queries with `groupId` filtering
- Implement role-based access control per group level
- Add group invitation system

#### Cycle 6-8: Authentication & Roles
**Assigned to:** agent-backend (existing system)
**Deliverables:**
- Integrate Better Auth (already implemented)
- Configure 8 role types (platform_owner → contractor)
- Add permission checks for rig-specific operations
- Implement emergency override permissions

#### Cycle 9-10: Design System & Brand
**Assigned to:** agent-designer
**Deliverables:**
- Extend 6-color design system for industrial theme
- Create oil rig color palette (safety orange, industrial blue)
- Design status indicators (active, standby, emergency)
- Create icon set for safety, equipment, shifts

---

### Phase 1: Backend Foundation (Cycles 11-40)

#### Cycle 11-15: Staff Management Service
**Assigned to:** agent-backend
**Deliverables:**
- Create `StaffService` (Effect.ts)
  - `createStaff()`
  - `updateStaff()`
  - `assignToRig()`
  - `assignToShift()`
  - `getStaffByRig()`
- Implement mutations/queries (Convex)
- Add staff search by skills, certifications, availability
- Create staff profile validation

#### Cycle 16-20: Certification Tracking Service
**Assigned to:** agent-backend
**Deliverables:**
- Create `CertificationService` (Effect.ts)
  - `issueCertification()`
  - `renewCertification()`
  - `checkExpiry()`
  - `getExpiringSoon()` (30-day warning)
- Implement auto-expiry notifications
- Add certification requirement validation
- Create certification history tracking

#### Cycle 21-25: Shift Scheduling Service
**Assigned to:** agent-backend
**Deliverables:**
- Create `ShiftService` (Effect.ts)
  - `createShiftSchedule()`
  - `assignStaffToShift()`
  - `requestShiftSwap()`
  - `approveShiftSwap()`
  - `generateRotationPlan()` (multi-week)
- Implement shift conflict detection
- Add overtime calculation
- Create shift handover system

#### Cycle 26-30: Safety & Compliance Service
**Assigned to:** agent-backend
**Deliverables:**
- Create `SafetyService` (Effect.ts)
  - `reportIncident()`
  - `scheduleInspection()`
  - `conductDrill()`
  - `trackCompliance()`
  - `generateSafetyReport()`
- Implement incident investigation workflow
- Add compliance deadline tracking
- Create regulatory reporting exports

#### Cycle 31-35: Equipment Management Service
**Assigned to:** agent-backend
**Deliverables:**
- Create `EquipmentService` (Effect.ts)
  - `checkOutEquipment()`
  - `returnEquipment()`
  - `scheduleInspection()`
  - `trackMaintenance()`
- Implement equipment availability tracking
- Add PPE assignment by role
- Create maintenance scheduling

#### Cycle 36-40: Emergency Response Service
**Assigned to:** agent-backend
**Deliverables:**
- Create `EmergencyService` (Effect.ts)
  - `declareEmergency()`
  - `initiateEvacuation()`
  - `sendMassNotification()`
  - `trackMusterPoint()`
  - `issueAllClear()`
- Implement emergency contact cascade
- Add real-time personnel accountability
- Create emergency drill simulation

---

### Phase 2: Frontend UI (Cycles 41-70)

#### Cycle 41-45: Staff Dashboard
**Assigned to:** agent-frontend
**Deliverables:**
- Create `/staff/dashboard` page (Astro)
- Staff roster with search/filter (React island)
- Staff detail cards (`ThingCard` pattern)
  - Photo, name, role, certifications
  - Current shift, location
  - Certification status badges
- Real-time availability indicators

#### Cycle 46-50: Shift Scheduling UI
**Assigned to:** agent-frontend
**Deliverables:**
- Create `/shifts/schedule` page (Astro)
- Interactive shift calendar (React island)
  - Drag-and-drop shift assignments
  - Color-coded by department
  - Conflict warnings
- Shift swap request workflow
- Rotation plan generator

#### Cycle 51-55: Certification Management UI
**Assigned to:** agent-frontend
**Deliverables:**
- Create `/certifications/tracker` page (Astro)
- Certification dashboard (React island)
  - Expiring certifications list (30/60/90 days)
  - Certification status by staff member
  - Renewal workflow
- Upload certification documents
- Print certification cards

#### Cycle 56-60: Safety Compliance Dashboard
**Assigned to:** agent-frontend
**Deliverables:**
- Create `/safety/compliance` page (Astro)
- Incident reporting form (React island)
- Safety metrics dashboard
  - Days since last incident
  - Drill participation rates
  - Compliance status by regulation
- Inspection scheduling interface

#### Cycle 61-65: Equipment Tracking UI
**Assigned to:** agent-frontend
**Deliverables:**
- Create `/equipment/inventory` page (Astro)
- Equipment checkout system (React island)
  - Barcode scanning support
  - Availability status
  - Maintenance schedules
- PPE assignment by role
- Equipment inspection checklist

#### Cycle 66-70: Emergency Response Interface
**Assigned to:** agent-frontend
**Deliverables:**
- Create `/emergency/response` page (Astro)
- Emergency alert panel (React island, `client:load`)
  - One-click emergency declaration
  - Mass notification sender
  - Muster point tracking
- Personnel accountability board
  - Real-time check-in status
  - Missing personnel alerts
- Emergency contact display

---

### Phase 3: Integration & Real-Time Features (Cycles 71-85)

#### Cycle 71-75: Real-Time Communication
**Assigned to:** agent-integrator
**Deliverables:**
- Integrate Convex real-time subscriptions
  - Live shift updates
  - Emergency alert broadcasts
  - Equipment status changes
- Add push notifications (web + mobile)
- Implement shift handover chat
- Create announcement system

#### Cycle 76-80: Regulatory Compliance Integration
**Assigned to:** agent-integrator
**Deliverables:**
- Export compliance reports (PDF)
  - OSHA recordkeeping
  - Personnel certifications
  - Safety drill records
- Generate regulatory filings
- Integrate with external compliance APIs
- Schedule automated reports

#### Cycle 81-85: Mobile Optimization
**Assigned to:** agent-frontend
**Deliverables:**
- Responsive design for tablets/phones
- Offline support for shift schedules
- QR code scanning for equipment checkout
- Mobile-optimized emergency alerts
- Progressive Web App (PWA) configuration

---

### Phase 4: Quality Assurance (Cycles 86-95)

#### Cycle 86-88: Unit & Integration Tests
**Assigned to:** agent-quality
**Deliverables:**
- Test all services (StaffService, CertificationService, etc.)
- Test role-based access control
- Test shift conflict detection
- Test emergency response workflow
- Test certification expiry alerts

#### Cycle 89-91: Security & Compliance Testing
**Assigned to:** agent-quality
**Deliverables:**
- Penetration testing for emergency override
- Audit trail verification
- Data privacy compliance (GDPR/CCPA)
- Role permission validation
- Multi-tenant isolation testing

#### Cycle 92-95: Performance & Load Testing
**Assigned to:** agent-quality
**Deliverables:**
- Test real-time updates at scale (100+ concurrent users)
- Test emergency alert broadcast speed
- Optimize shift calendar rendering
- Load test compliance report generation
- Verify offline functionality

---

### Phase 5: Documentation & Deployment (Cycles 96-100)

#### Cycle 96-97: User Documentation
**Assigned to:** agent-documenter
**Deliverables:**
- Admin guide (rig manager, safety officer)
- Worker guide (shift scheduling, certification tracking)
- Emergency response procedures
- API documentation for integrations

#### Cycle 98-99: Training Materials
**Assigned to:** agent-documenter
**Deliverables:**
- Video tutorials (shift scheduling, incident reporting)
- Quick reference cards for emergency procedures
- Certification renewal workflows
- Equipment checkout guides

#### Cycle 100: Deployment & Launch
**Assigned to:** agent-ops
**Deliverables:**
- Deploy to Cloudflare Pages (frontend)
- Deploy to Convex Cloud (backend)
- Configure production environment variables
- Set up monitoring & alerting
- Execute go-live checklist

---

## Ontology Mapping Summary

| Dimension | Count | Examples |
|-----------|-------|----------|
| **Groups** | 5 types | oil_company, oil_rig, department, shift_team, emergency_response |
| **People** | 8 roles | platform_owner, company_manager, rig_manager, shift_supervisor, worker, contractor, safety_officer, emergency_coordinator |
| **Things** | 17 types | staff_member, certification, shift_schedule, safety_record, equipment, emergency_alert, training_module, compliance_doc |
| **Connections** | 10 types | works_at, assigned_to, manages, certified_for, operates, completed, responded_to, participated_in, reports_to, requires |
| **Events** | 30 types | shift_started, certification_issued, incident_reported, drill_conducted, emergency_declared, staff_onboarded, equipment_inspected |
| **Knowledge** | 3 categories | Skills taxonomy, Certification categories, Safety procedures (RAG-enabled) |

---

## Key Features Implemented

### 1. Multi-Rig Support
- Hierarchical group structure (company → rig → department → shift)
- Cross-rig personnel transfers
- Rig-specific compliance tracking
- Consolidated company-wide reporting

### 2. Shift Scheduling
- 24/7 shift coverage planning
- Multi-week rotation schedules
- Shift swap requests with approval workflow
- Conflict detection (double-booking, overtime limits)
- Shift handover notes

### 3. Certification Tracking
- 30/60/90-day expiry warnings
- Automatic renewal notifications
- Certification requirement enforcement
- Document upload and storage
- Certification history audit trail

### 4. Safety Compliance
- Incident reporting with investigation workflow
- Safety drill scheduling and tracking
- Equipment inspection checklists
- Regulatory compliance dashboard
- Automated compliance report generation

### 5. Real-Time Communication
- Emergency alert broadcasts
- Live shift updates
- Equipment availability status
- Personnel check-in tracking
- Announcement system

### 6. Emergency Protocols
- One-click emergency declaration
- Mass notification system
- Muster point accountability
- Real-time personnel tracking
- Emergency contact cascade
- All-clear issuance

---

## Technology Stack

**Frontend:**
- Astro 5 (SSR pages)
- React 19 (interactive islands)
- Tailwind v4 (styling)
- shadcn/ui (components)
- Convex React hooks (`useQuery`, `useMutation`)

**Backend:**
- Convex (real-time database)
- Effect.ts (business logic services)
- Better Auth (authentication)
- 6-dimension ontology schema

**Integration:**
- Real-time subscriptions (Convex)
- Push notifications
- PDF report generation
- QR code scanning
- PWA offline support

---

## Success Criteria

- [ ] All features map to 6-dimension ontology
- [ ] Multi-rig hierarchical groups implemented
- [ ] 8 role types with granular permissions
- [ ] Real-time shift updates functioning
- [ ] Certification expiry alerts working
- [ ] Emergency response workflow tested
- [ ] Regulatory compliance reports generating
- [ ] Mobile-responsive design verified
- [ ] Offline support for critical features
- [ ] Load tested for 100+ concurrent users
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Training materials delivered
- [ ] Production deployment successful

---

## Cost Breakdown

| Phase | Cycles | Duration | Cost |
|-------|--------|----------|------|
| Foundation | 1-10 | ~20 min | $0 |
| Backend | 11-40 | ~60 min | $0 |
| Frontend | 41-70 | ~60 min | $0 |
| Integration | 71-85 | ~30 min | $0.40 (PDF generation, push notifications) |
| Quality | 86-95 | ~20 min | $0 |
| Deployment | 96-100 | ~10 min | $0.10 (monitoring setup) |
| **Total** | **100** | **~180 min (3 hours)** | **$0.50** |

---

## Next Steps

1. **Validate this plan** with stakeholders
2. **Begin Cycle 1** (Ontology Design)
3. **Assign specialists** to each phase
4. **Track progress** via events and cycle completion
5. **Iterate** based on feedback

---

**This plan follows the 6-dimension ontology and enables 98% AI code generation accuracy through pattern convergence.**
