# Admin guide

## Getting an admin account
- Demo: on `/login?as=admin` press **Use the demo admin account** (`admin@saathverse.test`).
- New admin: `/signup?as=admin` with the invite code from `ADMIN_INVITE_CODE` (development default
  `SAATH-ADMIN-2026`). In production the code must be set, otherwise admin sign up is switched off.

## What admins can and cannot see
| Can see | Cannot see |
| --- | --- |
| Counts, trends and charts | Private chats |
| Reports, and messages a reporter chose to attach | Full email addresses (masked) |
| Account status, report counts, last active | Profiles, prompts, photos |

## Actions
- **Warn**: sends a live note to the member.
- **Pause** (1 to 30 days): blocks sign in, chat and Discover until it ends on its own.
- **Remove**: for serious or repeated harm. Can be undone with **Restore**.
- **Dismiss / resolve** a report with a note.

Every action is written to the audit log with the admin, the member, the report and the note.
Admin accounts cannot be moderated from the console.
