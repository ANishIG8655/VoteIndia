export const indiaElections = {
  process: [
    { 
      step: "Election Announcement", 
      what: "ECI issues formal notification and Model Code of Conduct (MCC) begins.", 
      who: "Election Commission of India", 
      why: "Ensures a level playing field and official timeline."
    },
    { 
      step: "Nomination of Candidates", 
      what: "Candidates file nomination papers and affidavits.", 
      who: "Returning Officers and Candidates", 
      why: "Official entry point for the democratic contest."
    },
    { 
      step: "Scrutiny & Withdrawal", 
      what: "Returning Officers verify papers; candidates can withdraw.", 
      who: "Returning Officers", 
      why: "Ensures only valid, eligible candidates remain."
    },
    { 
      step: "Election Campaign", 
      what: "Parties hold rallies, manifestos, and public debates.", 
      who: "Political Parties and Citizens", 
      why: "Allows voters to compare ideologies and promises."
    },
    { 
      step: "Voting Process (EVM + VVPAT)", 
      what: "Voters cast secret ballots at polling stations.", 
      who: "Voters and Polling Officials", 
      why: "The core act of democratic choice."
    },
    { 
      step: "Vote Counting", 
      what: "EVMs are unsealed and votes tabulated.", 
      who: "Counting Agents and ECI officials", 
      why: "Translates votes into numerical data."
    },
    { 
      step: "Result Declaration", 
      what: "Official winners are announced for each seat.", 
      who: "Returning Officers", 
      why: "Determines the representational makeup of the house."
    },
    { 
      step: "Government Formation", 
      what: "Majority party/alliance is invited to form the government.", 
      who: "President (Lok Sabha) / Governor (Vidhan Sabha)", 
      why: "Establishes the executive leadership."
    }
  ],
  types: {
    lokSabha: {
      title: "Lok Sabha (Central)",
      desc: "Elections to choose 543 Members of Parliament (MPs). The party with 272+ seats forms the Central Government."
    },
    vidhanSabha: {
      title: "Vidhan Sabha (State)",
      desc: "Elections for State Legislative Assemblies. The majority party forms the State Government and chooses the Chief Minister."
    }
  },
  pastResults: [
    { year: 2019, type: "Lok Sabha", turnout: "67.4%", status: "Completed" },
    { year: 2024, type: "Lok Sabha", turnout: "66.3%", status: "Completed" }
  ],
  upcoming: [
    { state: "General Elections", expected: "2029", type: "Lok Sabha" },
    { state: "State Assembly", expected: "Late 2026", type: "Vidhan Sabha" }
  ],
  manifestos: [
    { category: "Economy", point: "Focus on GDP growth and industrial corridors." },
    { category: "Jobs", point: "Emphasis on skill development and startup ecosystems." },
    { category: "Welfare", point: "Universal healthcare and rural housing schemes." }
  ],
  trends: [
    { title: "Voter Turnout Dynamics", insight: "Rural turnout has consistently outperformed urban turnout in the last decade, highlighting deep democratic engagement at the grassroots." },
    { title: "Regional Power Shifts", insight: "Alliance shifts in key states like Maharashtra and Bihar often determine the final national seat distribution." },
    { title: "Youth Participation", insight: "First-time voters (18-22 years) now constitute a massive voting bloc, shifting campaign focus toward employment." },
    { title: "Women as Decisive Voters", insight: "Women voter turnout surpassed male turnout recently, leading to a surge in targeted welfare schemes." },
    { title: "Digital Campaigning", insight: "Social media penetration in tier-2 and tier-3 cities has revolutionized how regional parties compete." },
    { title: "Anti-Incumbency Waves", insight: "State-level anti-incumbency remains strong, with voters frequently changing governments every five years in states like Rajasthan." },
    { title: "Freebie Economics", insight: "Pre-election welfare promises (free electricity, cash transfers) have become the primary deciding factor in southern states." },
    { title: "Caste-Census Demands", insight: "Regional parties are increasingly demanding caste-based censuses to recalibrate reservation quotas and consolidate OBC votes." },
    { title: "Farm Bloc Influence", insight: "Agrarian distress and MSP guarantees deeply influence voting patterns in Punjab, Haryana, and Western UP." },
    { title: "The Urban Apathy", insight: "Despite higher literacy, major metros like Mumbai and Bengaluru continue to record the lowest voter turnouts nationally." },
    { title: "Rise of Local Influencers", insight: "Political parties are shifting ad budgets from traditional media to local YouTube and Instagram influencers." },
    { title: "Religion vs. Caste", insight: "The ideological battle often oscillates between broader religious consolidation and micro-caste level engineering." },
    { title: "South-North Political Divide", insight: "Voting patterns show a stark contrast; national issues dominate the North, while regional identity and language dominate the South." },
    { title: "EVM Trust Factors", insight: "Debates around VVPAT counting and EVM security continue to mobilize opposition narratives during polling phases." },
    { title: "Coalition Resurgence", single: true, insight: "The era of single-party dominance is being challenged by highly organized, multi-state opposition alliances." }
  ],
};

export const electionQuiz = [
  {
    question: "What is the minimum age to vote in Indian General Elections?",
    options: ["16 Years", "18 Years", "21 Years", "25 Years"],
    correct: 1,
    explanation: "The 61st Amendment Act, 1988 reduced the voting age from 21 to 18 years."
  },
  {
    question: "What does VVPAT stand for?",
    options: ["Voter Verified Paper Audit Trail", "Voter Verifiable Paper Account Track", "Voter Verified Print Audit Tool", "Voter Verifiable Paper Audit Trail"],
    correct: 3,
    explanation: "VVPAT allows voters to verify that their vote was cast correctly."
  },
  {
    question: "How many Lok Sabha constituencies are there in India?",
    options: ["545", "543", "550", "552"],
    correct: 1,
    explanation: "There are 543 elected constituencies in the Lok Sabha."
  },
  {
    question: "Who appoints the Chief Election Commissioner of India?",
    options: ["Prime Minister", "Chief Justice of India", "President of India", "Parliament"],
    correct: 2,
    explanation: "The President of India appoints the CEC and other Election Commissioners."
  },
  {
    question: "What is the maximum limit of seats in the Lok Sabha as per the Constitution?",
    options: ["543", "550", "552", "560"],
    correct: 2,
    explanation: "The maximum strength is 552 (530 from states, 20 from UTs, and 2 nominated)."
  },
  {
    question: "In which year were the first General Elections held in India?",
    options: ["1947", "1950", "1951-52", "1955"],
    correct: 2,
    explanation: "The first general elections were held between Oct 1951 and Feb 1952."
  },
  {
    question: "What is the 'Model Code of Conduct'?",
    options: ["A set of laws", "Guidelines for candidates/parties", "A voting procedure", "A security protocol"],
    correct: 1,
    explanation: "MCC is a set of guidelines issued by ECI for conduct of parties and candidates during elections."
  },
  {
    question: "Which ink is used to mark the finger of a voter?",
    options: ["Silver Nitrate Ink", "Iron Oxide Ink", "Potassium Permanganate", "Indelible Blue Ink"],
    correct: 0,
    explanation: "Indelible ink contains silver nitrate, which reacts with skin to leave a semi-permanent mark."
  },
  {
    question: "What is the tenure of a Member of the Rajya Sabha?",
    options: ["4 Years", "5 Years", "6 Years", "Permanent"],
    correct: 2,
    explanation: "Rajya Sabha members are elected for a 6-year term, with 1/3rd members retiring every 2 years."
  },
  {
    question: "Which article of the Constitution provides for the Election Commission?",
    options: ["Article 324", "Article 370", "Article 356", "Article 280"],
    correct: 0,
    explanation: "Article 324 provides for the power of superintendence, direction, and control of elections."
  }
];

export const kycDatabase = {
  "varanasi": [
    { name: "Narendra Modi", party: "BJP", education: "Post Graduate", assets: "₹2.2 Crore", cases: 0, attendance: "N/A (PM)" },
    { name: "Ajay Rai", party: "INC", education: "Graduate", assets: "₹1.5 Crore", cases: 3, attendance: "78%" }
  ],
  "wayanad": [
    { name: "Rahul Gandhi", party: "INC", education: "M.Phil", assets: "₹15 Crore", cases: 5, attendance: "52%" },
    { name: "Annie Raja", party: "CPI", education: "Graduate", assets: "₹75 Lakh", cases: 1, attendance: "N/A" }
  ],
  "new delhi": [
    { name: "Bansuri Swaraj", party: "BJP", education: "Barrister-at-Law", assets: "₹11 Crore", cases: 0, attendance: "N/A (New)" },
    { name: "Somnath Bharti", party: "AAP", education: "M.Sc, LLB", assets: "₹3 Crore", cases: 2, attendance: "89%" }
  ],
  "gandhinagar": [
    { name: "Amit Shah", party: "BJP", education: "B.Sc", assets: "₹38 Crore", cases: 4, attendance: "85%" },
    { name: "Sonal Patel", party: "INC", education: "B.Arch", assets: "₹5 Crore", cases: 0, attendance: "N/A" }
  ]
};

export const modes = [
  { id: 'my_constituency', label: 'My Constituency (Personalized)', icon: '📍' },
  { id: 'upcoming', label: 'Upcoming Elections', icon: '📅' },
  { id: 'past', label: 'Past Results', icon: '🏆' },
  { id: 'manifesto', label: 'Manifesto Comparison', icon: '📜' },
  { id: 'process', label: 'Election Process', icon: '⚙️' },
  { id: 'trends', label: 'Trend Analysis', icon: '📈' }
];

export const getPersonalizedData = (state, constituency) => {
  return {
    candidates: [
      { party: "Party A", name: "Candidate X", focus: "Infrastructure & IT Parks" },
      { party: "Party B", name: "Candidate Y", focus: "Welfare & Local Business" },
      { party: "Party C", name: "Candidate Z", focus: "Youth Employment" }
    ],
    cm_pm_prospects: `In ${state}, the state assembly elections determine the CM. At the central level, the alliance winning the most Lok Sabha seats from states like ${state} highly influences the PM choice.`,
    manifesto_highlight: `For ${constituency}, parties are heavily focusing on urban infrastructure and water management in their local manifestos.`
  };
};

