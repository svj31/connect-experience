# Demo data

`people.json` holds 55 demo members (14 core members with history, plus 41 "crowd" members marked `"crowd": true` so Discover feels busy) and the demo admin that the backend loads on first start
(or with `npm run seed`). Every account uses the password in the file (`saathverse123`) and the reserved
`saathverse.test` email domain, so no real inbox is ever involved.

The seed (`backend/src/demo.ts`) also creates:

- Connections for Ava with Rohan (Orbit bond, 4 day streak) and Mira (Spark), plus Rohan with Ishita
- Two requests waiting for Ava (Kabir, Arjun) and one she sent (Zoya)
- Messages and moments spread over the past week, so dashboards, streaks and charts have shape
- Four open tables in the Together hub, two of them locked to one activity
- Three reports (two about Dev, one about Aditya) for the admin moderation queue

The profiles are invented for the demo. Edit the JSON to change them, then run `npm run reset-db`.

## Demo accounts you can sign in as
The sign in page lists six personas (Ava, Rohan, Mira, Kabir, Zoya, Arjun), each with different matches,
likes and history. All use the password `saathverse123` with emails like `rohan@saathverse.test`.
The admin demo is `admin@saathverse.test`.

## Endless Discover
When you have seen everyone, Discover brings back the people you passed on (likes are never recycled), so
you can keep testing the deck. Photos are free portraits from Unsplash and pravatar.cc.
