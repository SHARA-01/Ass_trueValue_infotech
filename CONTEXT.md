# Domain Glossary

> Ubiquitous language for the Support Ticket Management System.
> All code, comments, and documentation should use these terms exactly.

---

## Core Concepts

**User** — a registered member of the public who raises support requests. Has the `user` role. Can create, view, edit, and delete their own Tickets. Can add Comments to their own Tickets.

**Admin** — a privileged User with the `admin` role. Can view all Tickets, change any Ticket's Status or Priority, respond to any Ticket via Comments, and manage the full lifecycle.

**Ticket** — the primary unit of work in the system. Represents a single support request raised by a User. Has a Title, Description, Category, Priority, Status, and belongs to exactly one User (the Submitter).

**Submitter** — the User who originally created a Ticket. Distinct from Admin, who may manage Tickets they did not submit.

**Comment** — a text message attached to a Ticket, written by either a User (the Submitter) or an Admin. Each Comment records its author and the timestamp it was created.

**Activity Log** — an append-only record of system events. Each entry captures the Event type, the actor (User or Admin), the affected Ticket, and a timestamp. Never modified after creation.

**Status** — the lifecycle state of a Ticket. Valid values (in order): `Open` → `In-Progress` → `On-Hold` → `Resolved` → `Closed`. Only Admins may change Status.

**Priority** — the urgency level of a Ticket, set by the Submitter at creation and updatable by Admins. Valid values: `Low | Medium | High | Critical`.

**Category** — the topic area of a Ticket. Valid values: `Technical Support | Billing | General Enquiry | Bug Report | Feature Request`.

**Event** — a named occurrence triggered when a significant action happens. Events are emitted by the application and consumed by the Activity Log handler. Named events: `ticket.created`, `ticket.updated`, `ticket.status_changed`, `comment.added`, `ticket.resolved`.

**Activity Log Entry** — a single record written by an Event handler. Contains: event name, actor ID, Ticket ID, metadata payload, and timestamp.

**JWT** — the authentication token issued at login. Encodes the User's ID and role. Validated on every protected request by the auth middleware.

**Role** — either `user` or `admin`. Encoded in the JWT. Guards access to routes and operations.

---

## Relationships

- A **User** submits zero or more **Tickets**.
- A **Ticket** has zero or more **Comments** (referenced, not embedded).
- A **Comment** belongs to exactly one **Ticket** and one **User** (the author).
- Each domain **Event** produces exactly one **Activity Log Entry**.

---

## Out of Scope

- Email notifications (not in this build).
- Multi-tenant workspaces.
- Ticket assignment to specific Admins.
- SLA tracking.
