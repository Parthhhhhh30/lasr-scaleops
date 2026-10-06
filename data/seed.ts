import { APPLICATION_STAGES, type Dataset } from "@/domain/types";
export const DEMO_NOW = "2027-01-11T09:00:00.000Z";
const names = [
  "Maya Chen",
  "Elias Morgan",
  "Nadia Rahman",
  "Theo Laurent",
  "Amara Okafor",
  "Jonas Berg",
  "Leila Haddad",
  "Oliver Shaw",
  "Sofia Reyes",
  "Arjun Mehta",
  "Clara Weiss",
  "Daniel Park",
  "Iris Patel",
  "Felix Stone",
  "Noor Ali",
  "Oscar Silva",
  "Ada Brooks",
  "Samir Khan",
  "Eva Rossi",
  "Louis Hart",
  "Zara Ahmed",
  "Leo Fischer",
  "Ana Costa",
  "Ravi Desai",
];
const focuses = [
  "Evaluation & robustness",
  "Interpretability",
  "AI governance",
  "Scalable oversight",
];
const owners = ["Priya Shah", "Alex Turner", "Morgan Ellis"];
const date = (days: number, hours = 0) =>
  new Date(
    Date.parse(DEMO_NOW) + days * 86400000 + hours * 3600000,
  ).toISOString();
export function createSeed(): Dataset {
  const data: Dataset = {
    now: DEMO_NOW,
    cohorts: [
      {
        id: "winter",
        name: "Winter ’27",
        dates: "25 Jan — 19 Mar 2027",
        launch: date(14),
        stage: "Onboard",
        capacity: 24,
        location: "London · Research studio",
      },
      {
        id: "summer",
        name: "Summer ’27",
        dates: "7 Jun — 30 Jul 2027",
        launch: date(147),
        stage: "Screen",
        capacity: 32,
        location: "London · Research studio",
      },
      {
        id: "autumn",
        name: "Autumn ’27",
        dates: "20 Sep — 12 Nov 2027",
        launch: date(252),
        stage: "Recruit",
        capacity: 40,
        location: "London · Research studio",
      },
    ],
    applicants: [],
    participants: [],
    tasks: [],
    support: [],
    rooms: [
      { id: "studio", name: "Studio A", capacity: 30 },
      { id: "seminar", name: "Seminar room", capacity: 16 },
      { id: "workshop", name: "Workshop room", capacity: 40 },
    ],
    events: [],
    risks: [],
    milestones: [],
    audit: [],
  };
  for (const [c, cohort] of data.cohorts.entries()) {
    const count = [24, 18, 12][c];
    for (let i = 0; i < count; i++)
      data.applicants.push({
        id: `${cohort.id}-a${i}`,
        cohortId: cohort.id,
        name: names[(i + c * 5) % names.length],
        email: `candidate${i + 1}@example.com`,
        focus: focuses[i % 4],
        stage:
          APPLICATION_STAGES[
            c === 0
              ? Math.min(5, Math.floor(i / 4))
              : c === 1
                ? Math.min(3, Math.floor(i / 5))
                : i < 9
                  ? 0
                  : 1
          ],
        stageEntered: date(-(i % 6) - 1),
        owner: owners[i % 3],
        complete: i % 7 !== 0,
        feedback: i % 4 !== 1,
      });
    const participants = [12, 5, 2][c];
    const launchOffset = [14, 147, 252][c];
    for (let i = 0; i < participants; i++) {
      const id = `${cohort.id}-p${i}`;
      data.participants.push({
        owner: owners[i % 3],
        id,
        cohortId: cohort.id,
        name: names[(i + c * 4) % names.length],
        email: `participant${i + 1}@example.com`,
        focus: focuses[i % 4],
        stage: i < 3 ? "Visa" : "Onboard",
        team: ["Robustness Lab", "Alignment Studio", "Governance Group"][i % 3],
        supervisor: ["Dr. Rowan Bell", "Dr. Alex Reed", "Dr. Harper Lane"][
          i % 3
        ],
        arrival: date(launchOffset - 2 + (i % 3)),
        requirements: [
          {
            id: "identity",
            label: "Identity document received",
            kind: "document",
            complete: i % 5 !== 0,
          },
          {
            id: "admin",
            label: "Visa/admin information reviewed by coordinator",
            kind: "document",
            complete: i % 4 !== 0,
          },
          {
            id: "access",
            label: "Workspace access confirmed",
            kind: "onboarding",
            complete: i % 3 !== 0,
          },
          {
            id: "orientation",
            label: "Orientation attendance confirmed",
            kind: "onboarding",
            complete: i % 4 !== 0,
          },
          {
            id: "team",
            label: "Team & supervisor allocation confirmed",
            kind: "allocation",
            complete: true,
          },
        ],
      });
      if (i % 3 === 0)
        data.tasks.push({
          id: `${cohort.id}-t${i}`,
          cohortId: cohort.id,
          participantId: id,
          title:
            i === 0
              ? `Confirm arrival details with ${names[(i + c * 4) % names.length].split(" ")[0]}`
              : "Check outstanding onboarding items",
          owner: owners[i % 3],
          due: date(i === 0 ? -2 : i - 2),
          priority: i === 0 ? "high" : "medium",
          stage: "Onboard",
          complete: false,
        });
    }
    data.tasks.push({
      id: `${cohort.id}-t-room`,
      cohortId: cohort.id,
      title: "Confirm orientation room and access plan",
      owner: "Alex Turner",
      due: date(3 + c * 20),
      priority: "medium",
      stage: "Launch",
      complete: false,
    });
    const supportTitles = [
      "Travel documentation question",
      "Workspace access invitation missing",
      "Request for a confidential welfare conversation",
    ];
    for (let i = 0; i < Math.min(3, participants); i++)
      data.support.push({
        id: `${cohort.id}-s${i}`,
        cohortId: cohort.id,
        participantId: `${cohort.id}-p${i}`,
        title: supportTitles[i],
        detail:
          i === 0
            ? "Participant asks who can review their travel documentation. Route to the programme coordinator; no eligibility assessment."
            : i === 1
              ? "Participant has not received the workspace invitation. Confirm email and re-issue through the access administrator."
              : "Participant requests a private conversation. Do not collect sensitive information in this demonstration workspace.",
        category: i === 0 ? "visa" : i === 1 ? "access" : "welfare",
        owner: owners[i],
        opened: date(-2 - i),
        resolved: c === 2 && i === 1,
      });
    data.events.push(
      {
        id: `${cohort.id}-e0`,
        cohortId: cohort.id,
        title: "Cohort orientation",
        roomId: "studio",
        start: date(launchOffset, 1),
        end: date(launchOffset, 3),
        owner: "Alex Turner",
      },
      {
        id: `${cohort.id}-e1`,
        cohortId: cohort.id,
        title: "Supervisor briefing",
        roomId: c === 0 ? "studio" : "seminar",
        start: date(launchOffset, 2),
        end: date(launchOffset, 4),
        owner: "Morgan Ellis",
      },
      {
        id: `${cohort.id}-e2`,
        cohortId: cohort.id,
        title: "Research methods workshop",
        roomId: "workshop",
        start: date(launchOffset + 2, 1),
        end: date(launchOffset + 2, 3),
        owner: "Priya Shah",
      },
    );
    data.risks.push({
      id: `${cohort.id}-r0`,
      cohortId: cohort.id,
      title:
        c === 0
          ? "Arrival coordination has no backup owner"
          : "Reviewer capacity needs confirmation",
      detail:
        c === 0
          ? "A single coordinator covers arrival day. Confirm a named backup before launch."
          : "Screening volume is increasing. Agree additional reviewer capacity before the next batch.",
      owner: "Morgan Ellis",
      priority: "medium",
      acknowledged: false,
      stage: c === 0 ? "Launch" : "Screen",
    });
    data.milestones.push(
      {
        id: `${cohort.id}-m0`,
        cohortId: cohort.id,
        title: "Document check-in",
        due: date(launchOffset - 10),
        stage: "Visa",
      },
      {
        id: `${cohort.id}-m1`,
        cohortId: cohort.id,
        title: "Onboarding closes",
        due: date(launchOffset - 4),
        stage: "Onboard",
      },
      {
        id: `${cohort.id}-m2`,
        cohortId: cohort.id,
        title: "Programme launch",
        due: cohort.launch,
        stage: "Launch",
      },
    );
  }
  return data;
}
