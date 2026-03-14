import { PrismaClient, PaperStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Deterministic helpers (mirrors the MySQL seed logic without randomness)
function det(i: number, mod: number) {
  return i % mod;
}

const BASE_TITLES = [
  "Edge Genomics Workflows",
  "Auditable Responsible AI Pipelines",
  "Clinical LLM Copilots",
  "Embodied Field Robotics",
  "Self-Healing Distributed Systems",
  "Geospatial Change Detection",
  "Autonomous Fleet Safety",
  "Energy-Twin Analytics",
  "Human-AI Decision Studios",
  "Extreme Weather Digital Twins",
  "Neural Cellular Biofoundry",
  "Coastal Resilience Observatories",
  "Planetary Health Monitoring Stack",
  "Bio-inspired Soft Manipulation",
  "Quantum-Assisted Climate Forecasts",
];

const FOCUS_LABELS = [
  "MIT CSAIL",
  "Stanford HAI",
  "Berkeley Sky Computing",
  "CMU Robotics Institute",
  "Oxford Big Data Institute",
  "UT Austin Energy Consortium",
  "EPFL Alpine Research",
  "UC Chile Andes Lab",
  "Tokyo U Autonomous Systems",
  "UChicago Data Science Institute",
];

const TOPIC_LABELS = [
  "climate modeling at continental scales",
  "transparent AI governance",
  "clinical documentation support",
  "portable genomics analyses",
  "field robotics deployments",
  "distributed infrastructure reliability",
  "planetary geospatial intelligence",
  "autonomy verification",
  "adaptive energy models",
  "human-AI teaming",
];

const STATUSES: PaperStatus[] = [
  ...Array(35).fill("Published"),
  ...Array(20).fill("Rejected"),
  ...Array(15).fill("Draft"),
  ...Array(10).fill("Submitted"),
  ...Array(10).fill("UnderReview"),
  ...Array(7).fill("Accepted"),
  ...Array(3).fill("Withdrawn"),
] as PaperStatus[];

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding roles...");
  await prisma.role.createMany({
    data: [
      { id: 1, roleName: "Research Admin" },
      { id: 2, roleName: "Principal Investigator" },
      { id: 3, roleName: "Contributor" },
      { id: 4, roleName: "Viewer" },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding venues...");
  await prisma.venue.createMany({
    data: [
      { id: 1, venueName: "Nature Machine Intelligence", type: "Journal", ranking: "Q1" },
      { id: 2, venueName: "ICML (International Conference on Machine Learning)", type: "Conference", ranking: "A*" },
      { id: 3, venueName: "NeurIPS", type: "Conference", ranking: "A*" },
      { id: 4, venueName: "AAAI Conference on Artificial Intelligence", type: "Conference", ranking: "A" },
      { id: 5, venueName: "ACM SIGGRAPH Asia", type: "Conference", ranking: "A" },
      { id: 6, venueName: "IEEE Robotics and Automation Letters", type: "Journal", ranking: "Q1" },
      { id: 7, venueName: "Science Translational Medicine", type: "Journal", ranking: "Q1" },
      { id: 8, venueName: "USENIX NSDI", type: "Conference", ranking: "A*" },
      { id: 9, venueName: "KDD (Knowledge Discovery and Data Mining)", type: "Conference", ranking: "A*" },
      { id: 10, venueName: "Nature Climate Change", type: "Journal", ranking: "Q1" },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding topics...");
  await prisma.topic.createMany({
    data: [
      { id: 1, topicName: "Climate Modeling" },
      { id: 2, topicName: "Responsible AI" },
      { id: 3, topicName: "Clinical Informatics" },
      { id: 4, topicName: "Computational Genomics" },
      { id: 5, topicName: "Embodied Robotics" },
      { id: 6, topicName: "Distributed Systems" },
      { id: 7, topicName: "Geospatial Intelligence" },
      { id: 8, topicName: "Autonomous Vehicles" },
      { id: 9, topicName: "Sustainable Energy Systems" },
      { id: 10, topicName: "Human-AI Collaboration" },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding grants...");
  await prisma.grant.createMany({
    data: [
      { id: 1, grantName: "NSF CNS-23190 SecureEdge", sponsor: "National Science Foundation", startDate: new Date("2023-01-01"), endDate: new Date("2026-12-31"), reportingRequirements: "Annual research and financial report" },
      { id: 2, grantName: "DARPA AIRLIFT", sponsor: "U.S. DARPA", startDate: new Date("2022-09-01"), endDate: new Date("2025-08-31"), reportingRequirements: "Quarterly milestone briefings" },
      { id: 3, grantName: "Chan Zuckerberg Biohub Microbiome", sponsor: "CZI", startDate: new Date("2023-04-01"), endDate: new Date("2026-03-31"), reportingRequirements: "Semi-annual progress update" },
      { id: 4, grantName: "DOE Climate Futures Initiative", sponsor: "Department of Energy", startDate: new Date("2021-07-01"), endDate: new Date("2024-06-30"), reportingRequirements: "Annual impact statement" },
      { id: 5, grantName: "Wellcome Trust Digital Health Frontier", sponsor: "Wellcome Trust", startDate: new Date("2022-02-01"), endDate: new Date("2025-01-31"), reportingRequirements: "Annual ethics statement" },
      { id: 6, grantName: "Toyota Research Embodied AI", sponsor: "Toyota Research Institute", startDate: new Date("2023-06-01"), endDate: new Date("2026-05-31"), reportingRequirements: "Quarterly progress demos" },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding users...");
  await prisma.user.createMany({
    data: [
      { id: 100, userName: "PaperTrail Admin", email: "admin@papertrail.local", password: "pass", roleId: 1, affiliation: "PaperTrail Program Office" },
      { id: 400, userName: "Advisory Viewer", email: "viewer@papertrail.local", password: "pass", roleId: 4, affiliation: "External Advisory Board" },
      { id: 200, userName: "Dr. Priya Natarajan", email: "priya.natarajan@yale.edu", password: "pass", roleId: 2, affiliation: "Yale Cognitive Systems Lab", orcid: "0000-0002-1825-0097" },
      { id: 201, userName: "Dr. Miguel Alvarez", email: "miguel.alvarez@mit.edu", password: "pass", roleId: 2, affiliation: "MIT CSAIL", orcid: "0000-0002-7746-9232" },
      { id: 202, userName: "Dr. Helena Park", email: "helena.park@stanford.edu", password: "pass", roleId: 2, affiliation: "Stanford HAI", orcid: "0000-0003-4521-1121" },
      { id: 203, userName: "Dr. Omar Rahman", email: "omar.rahman@uchicago.edu", password: "pass", roleId: 2, affiliation: "UChicago Data Science Institute", orcid: "0000-0002-7784-8871" },
      { id: 204, userName: "Dr. Aisha Mensah", email: "aisha.mensah@berkeley.edu", password: "pass", roleId: 2, affiliation: "Berkeley Sky Computing", orcid: "0000-0003-1901-5533" },
      { id: 205, userName: "Dr. Rui Tan", email: "rui.tan@cmu.edu", password: "pass", roleId: 2, affiliation: "CMU Robotics Institute", orcid: "0000-0001-2222-3333" },
      { id: 206, userName: "Dr. Mateo Garcia", email: "mateo.garcia@ox.ac.uk", password: "pass", roleId: 2, affiliation: "Oxford Big Data Institute", orcid: "0000-0001-1098-2245" },
      { id: 207, userName: "Dr. Emily Cho", email: "emily.cho@utoronto.ca", password: "pass", roleId: 2, affiliation: "University of Toronto Vector Lab", orcid: "0000-0002-3566-9988" },
      { id: 208, userName: "Dr. Leila Farah", email: "leila.farah@epfl.ch", password: "pass", roleId: 2, affiliation: "EPFL AI Center", orcid: "0000-0001-5520-8874" },
      { id: 209, userName: "Dr. Noah Trivedi", email: "noah.trivedi@cmu.edu", password: "pass", roleId: 2, affiliation: "CMU Robotics Institute", orcid: "0000-0001-4444-1234" },
      { id: 210, userName: "Dr. Sofia Duarte", email: "sofia.duarte@usp.br", password: "pass", roleId: 2, affiliation: "USP Smart Cities Lab", orcid: "0000-0002-0404-5566" },
      { id: 211, userName: "Dr. Ethan Morales", email: "ethan.morales@usc.edu", password: "pass", roleId: 2, affiliation: "USC Climate Futures", orcid: "0000-0002-7654-3311" },
      { id: 212, userName: "Dr. Luna Petrov", email: "luna.petrov@microsoft.com", password: "pass", roleId: 2, affiliation: "Microsoft Research AI for Good", orcid: "0000-0003-7654-9087" },
      { id: 213, userName: "Dr. Olivia Strauss", email: "olivia.strauss@cornell.edu", password: "pass", roleId: 2, affiliation: "Cornell Tech Urban Tech Hub", orcid: "0000-0003-1199-8876" },
      { id: 214, userName: "Dr. Kai Matsuda", email: "kai.matsuda@tokyo-u.ac.jp", password: "pass", roleId: 2, affiliation: "UTokyo Autonomous Systems", orcid: "0000-0002-8888-4444" },
      { id: 215, userName: "Dr. Amara Li", email: "amara.li@ust.hk", password: "pass", roleId: 2, affiliation: "HKUST Robotics Lab", orcid: "0000-0001-5555-1212" },
      { id: 216, userName: "Dr. Jasper Osei", email: "jasper.osei@kaist.ac.kr", password: "pass", roleId: 2, affiliation: "KAIST AI Institute", orcid: "0000-0003-0101-0101" },
      { id: 217, userName: "Dr. Chiara Romano", email: "chiara.romano@polimi.it", password: "pass", roleId: 2, affiliation: "Polimi Intelligent Systems", orcid: "0000-0002-2222-4545" },
      { id: 218, userName: "Dr. Isaac Adeyemi", email: "isaac.adeyemi@uib.no", password: "pass", roleId: 2, affiliation: "UiB Climate Analytics", orcid: "0000-0002-1299-8876" },
      { id: 219, userName: "Dr. Harper Quinn", email: "harper.quinn@utexas.edu", password: "pass", roleId: 2, affiliation: "UT Austin Heart Lab", orcid: "0000-0002-8263-1176" },
      { id: 220, userName: "Dr. Damien Rousseau", email: "damien.rousseau@inria.fr", password: "pass", roleId: 2, affiliation: "INRIA RobotLearn", orcid: "0000-0001-7755-4499" },
      { id: 221, userName: "Dr. Saanvi Rao", email: "saanvi.rao@iitd.ac.in", password: "pass", roleId: 2, affiliation: "IIT Delhi Sustainable Tech Lab", orcid: "0000-0003-8855-4499" },
      { id: 222, userName: "Dr. Gabriel Mendes", email: "gabriel.mendes@uc.cl", password: "pass", roleId: 2, affiliation: "UC Chile Andes Computing", orcid: "0000-0001-1122-9933" },
      { id: 223, userName: "Dr. Vera Klug", email: "vera.klug@tum.de", password: "pass", roleId: 2, affiliation: "TUM Autonomous Systems Lab", orcid: "0000-0002-3333-2154" },
      { id: 300, userName: "Lena Becker", email: "lena.becker@tum.de", password: "pass", roleId: 3, affiliation: "TUM Autonomous Systems Lab" },
      { id: 301, userName: "Jonas Weaver", email: "jonas.weaver@berkeley.edu", password: "pass", roleId: 3, affiliation: "Berkeley Sky Computing" },
      { id: 302, userName: "Sara Keita", email: "sara.keita@ox.ac.uk", password: "pass", roleId: 3, affiliation: "Oxford Big Data Institute" },
      { id: 303, userName: "Noah Trivedi Jr.", email: "noah.trivedi.jr@cmu.edu", password: "pass", roleId: 3, affiliation: "CMU Robotics Institute" },
      { id: 304, userName: "Priya Sethi", email: "priya.sethi@iitd.ac.in", password: "pass", roleId: 3, affiliation: "IIT Delhi Sustainable Tech Lab" },
      { id: 305, userName: "Andre Pacheco", email: "andre.pacheco@usp.br", password: "pass", roleId: 3, affiliation: "USP Smart Cities Lab" },
      { id: 306, userName: "Emily Vance", email: "emily.vance@utexas.edu", password: "pass", roleId: 3, affiliation: "UT Austin Heart Lab" },
      { id: 307, userName: "Hiro Asakura", email: "hiro.asakura@tokyo-u.ac.jp", password: "pass", roleId: 3, affiliation: "UTokyo Autonomous Systems" },
      { id: 308, userName: "Maria Chen", email: "maria.chen@stanford.edu", password: "pass", roleId: 3, affiliation: "Stanford HAI" },
      { id: 309, userName: "David Ortiz", email: "david.ortiz@usc.edu", password: "pass", roleId: 3, affiliation: "USC Climate Futures" },
      { id: 310, userName: "Chloe Renaud", email: "chloe.renaud@inria.fr", password: "pass", roleId: 3, affiliation: "INRIA RobotLearn" },
      { id: 311, userName: "Nikhil Deshmukh", email: "nikhil.deshmukh@cmu.edu", password: "pass", roleId: 3, affiliation: "CMU Robotics Institute" },
      { id: 312, userName: "Izzy Khan", email: "izzy.khan@utexas.edu", password: "pass", roleId: 3, affiliation: "UT Austin Heart Lab" },
      { id: 313, userName: "Selene Ortega", email: "selene.ortega@cornell.edu", password: "pass", roleId: 3, affiliation: "Cornell Tech Urban Tech Hub" },
      { id: 314, userName: "Renata Silva", email: "renata.silva@usp.br", password: "pass", roleId: 3, affiliation: "USP Smart Cities Lab" },
      { id: 315, userName: "Yuki Matsumoto", email: "yuki.matsumoto@tokyo-u.ac.jp", password: "pass", roleId: 3, affiliation: "UTokyo Autonomous Systems" },
      { id: 316, userName: "Tessa Briggs", email: "tessa.briggs@ucl.ac.uk", password: "pass", roleId: 3, affiliation: "UCL AI Centre" },
      { id: 317, userName: "Omar Aliyu", email: "omar.aliyu@uib.no", password: "pass", roleId: 3, affiliation: "UiB Climate Analytics" },
      { id: 318, userName: "Maeve Ross", email: "maeve.ross@berkeley.edu", password: "pass", roleId: 3, affiliation: "Berkeley Sky Computing" },
      { id: 319, userName: "Malik Johnson", email: "malik.johnson@columbia.edu", password: "pass", roleId: 3, affiliation: "Columbia Zuckerman Institute" },
      { id: 320, userName: "Ivy Zhang", email: "ivy.zhang@ust.hk", password: "pass", roleId: 3, affiliation: "HKUST Robotics Lab" },
      { id: 321, userName: "Leo Raman", email: "leo.raman@iitd.ac.in", password: "pass", roleId: 3, affiliation: "IIT Delhi Sustainable Tech Lab" },
      { id: 322, userName: "Anya Kuznetsov", email: "anya.kuznetsov@epfl.ch", password: "pass", roleId: 3, affiliation: "EPFL AI Center" },
      { id: 323, userName: "Victor Nwosu", email: "victor.nwosu@kaist.ac.kr", password: "pass", roleId: 3, affiliation: "KAIST AI Institute" },
      { id: 324, userName: "Greta Ivanova", email: "greta.ivanova@polimi.it", password: "pass", roleId: 3, affiliation: "Polimi Intelligent Systems" },
      { id: 325, userName: "Caleb Thornton", email: "caleb.thornton@usc.edu", password: "pass", roleId: 3, affiliation: "USC Climate Futures" },
      { id: 326, userName: "Lara Kline", email: "lara.kline@microsoft.com", password: "pass", roleId: 3, affiliation: "Microsoft Research AI for Good" },
      { id: 327, userName: "Andre Liu", email: "andre.liu@cmu.edu", password: "pass", roleId: 3, affiliation: "CMU Robotics Institute" },
      { id: 328, userName: "Sahana Prakash", email: "sahana.prakash@iitd.ac.in", password: "pass", roleId: 3, affiliation: "IIT Delhi Sustainable Tech Lab" },
      { id: 329, userName: "Tariq Mahmood", email: "tariq.mahmood@asu.edu", password: "pass", roleId: 3, affiliation: "ASU Solar Futures Lab" },
      { id: 330, userName: "Bianca Costa", email: "bianca.costa@uc.cl", password: "pass", roleId: 3, affiliation: "UC Chile Andes Computing" },
      { id: 331, userName: "Riley Thompson", email: "riley.thompson@utexas.edu", password: "pass", roleId: 3, affiliation: "UT Austin Heart Lab" },
      { id: 332, userName: "Helena Zhou", email: "helena.zhou@mit.edu", password: "pass", roleId: 3, affiliation: "MIT CSAIL" },
      { id: 333, userName: "Mateo Velasquez", email: "mateo.velasquez@utoronto.ca", password: "pass", roleId: 3, affiliation: "Vector Institute" },
      { id: 334, userName: "Keiko Yamashita", email: "keiko.yamashita@tokyo-u.ac.jp", password: "pass", roleId: 3, affiliation: "UTokyo Autonomous Systems" },
      { id: 335, userName: "Nora Kassim", email: "nora.kassim@ust.hk", password: "pass", roleId: 3, affiliation: "HKUST Robotics Lab" },
      { id: 336, userName: "Diego Fuentes", email: "diego.fuentes@kaist.ac.kr", password: "pass", roleId: 3, affiliation: "KAIST AI Institute" },
      { id: 337, userName: "Ivana Jovic", email: "ivana.jovic@polimi.it", password: "pass", roleId: 3, affiliation: "Polimi Intelligent Systems" },
      { id: 338, userName: "Lucas Barrett", email: "lucas.barrett@ox.ac.uk", password: "pass", roleId: 3, affiliation: "Oxford Big Data Institute" },
      { id: 339, userName: "Mira Schultz", email: "mira.schultz@cmu.edu", password: "pass", roleId: 3, affiliation: "CMU Robotics Institute" },
      { id: 340, userName: "Aditya Menon", email: "aditya.menon@iitd.ac.in", password: "pass", roleId: 3, affiliation: "IIT Delhi Sustainable Tech Lab" },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding 150 papers...");
  const baseDate = new Date("2020-01-01");

  for (let i = 0; i < 150; i++) {
    const paperId = 2000 + i;
    const status = STATUSES[det(i, STATUSES.length)];
    const topicId = det(i, 4) < det(i % 10, 10) ? (det(i, 4) + 1) : (det(i, 6) + 5);
    const secondaryTopicId = ((topicId + 2 - 1) % 10) + 1;
    const venueId = i % 2 === 0 ? (det(i, 3) + 1) : (det(i, 7) + 4);
    const grantId = i % 10 < 4 ? 1 : (det(i, 6) + 1);
    const submissionDate = addDays(baseDate, i * 7);
    const publicationDate =
      status === "Accepted" || status === "Published"
        ? addDays(submissionDate, 90 + det(i, 180))
        : null;
    const piId = 200 + det(i, 24);
    const contribA = 300 + det(i, 40);
    const contribB = 320 + det(i, 20);
    const baseTitle = BASE_TITLES[det(i, 15)];
    const focusLabel = FOCUS_LABELS[det(Math.floor(i / 15), 10)];
    const title = `${baseTitle} - ${focusLabel} Cohort ${2020 + det(i, 5)} | Program ${String(i + 1).padStart(3, "0")}`;
    const abstract = `Longitudinal study "${baseTitle}" exploring ${TOPIC_LABELS[topicId - 1]} and led with ${focusLabel}, leveraging datasets gathered between ${2020 + det(i, 3)} and ${2023 + det(i, 3)}.`.slice(0, 191);
    const versionLabel = `v${(det(i, 3) + 1)}.0`;

    await prisma.paper.create({
      data: {
        id: paperId,
        title,
        abstract,
        status,
        submissionDate,
        publicationDate,
        primaryContactId: piId,
        venueId,
        isDeleted: false,
        topics: {
          create: [
            { topic: { connect: { id: topicId } } },
            ...(secondaryTopicId !== topicId
              ? [{ topic: { connect: { id: secondaryTopicId } } }]
              : []),
          ],
        },
        grants: {
          create: [{ grant: { connect: { id: grantId } } }],
        },
        authors: {
          create: [
            { userId: piId, authorOrder: 1, contributionNotes: "Principal investigator and correspondence" },
            { userId: contribA, authorOrder: 2, contributionNotes: "Lead engineer / first author" },
            { userId: contribB, authorOrder: 3, contributionNotes: "Experimentation and evaluation" },
          ].filter((a, idx, arr) => arr.findIndex((b) => b.userId === a.userId) === idx),
        },
        revisions: {
          create: [
            {
              versionLabel,
              notes: `Iteration ${versionLabel} prepared for ${status} stage.`,
              authorId: contribA,
              createdAt: addDays(submissionDate, 7),
            },
          ],
        },
        activityLogs: {
          create: [
            { userId: piId, actionType: "PAPER_CREATED", actionDetail: "Record created through seed script.", timestamp: submissionDate },
            { userId: piId, actionType: "PAPER_STATUS_UPDATED", actionDetail: `Status set to ${status}`, timestamp: addDays(submissionDate, 5) },
          ],
        },
      },
    });

    if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/150 papers seeded`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
