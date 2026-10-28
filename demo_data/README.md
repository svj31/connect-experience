# Demo data

`people.json` holds the 14 demo members and the demo admin that the backend loads on first start
(or with `npm run seed`). Every account uses the password in the file (`saathverse123`) and the reserved
`saathverse.test` email domain, so no real inbox is ever involved.

The seed (`backend/src/demo.ts`) also creates:

- Connections for Ava with Rohan (Orbit bond, 4 day streak) and Mira (Spark), plus Rohan with Ishita
- Two requests waiting for Ava (Kabir, Arjun) and one she sent (Zoya)
- Messages and moments spread over the past week, so dashboards, streaks and charts have shape
- Four open tables in the Together hub, two of them locked to one activity
- Three reports (two about Dev, one about Aditya) for the admin moderation queue

The profiles are invented for the demo. Edit the JSON to change them, then run `npm run reset-db`.
