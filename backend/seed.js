const mongoose = require('mongoose');
require('dotenv').config();

const FAQ = require('./src/models/faq.model');
const Answer = require('./src/models/answer.model');
const User = require('./src/models/user.model');
const crypto = require('crypto');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/samagama';

const faqs = [
  {
    title: 'What is the registration deadline for Samagama?',
    description: 'I want to know when is the last date to register for the fest. Is there any late registration option available?',
    category: 'Registration',
    author: { name: 'Priya Sharma', email: 'priya@example.com' },
    upvoteCount: 24,
    viewCount: 102,
    tags: ['deadline', 'registration'],
  },
  {
    title: 'How many members can a team have for technical events?',
    description: 'For hackathon and other technical competitions, is there a minimum or maximum team size? Can I participate solo?',
    category: 'Technical Events',
    author: { name: 'Rahul Verma' },
    upvoteCount: 18,
    viewCount: 87,
    tags: ['team', 'hackathon'],
  },
  {
    title: 'Is accommodation available for outstation participants?',
    description: 'I am travelling from another city. Does the college provide accommodation inside campus or do we need to arrange our own?',
    category: 'Accommodation',
    author: { name: 'Anjali Singh' },
    upvoteCount: 31,
    viewCount: 145,
    tags: ['accommodation', 'outstation'],
  },
  {
    title: 'What is the nearest railway station and how to reach the venue?',
    description: 'Could you share directions from the nearest railway station and bus stand to reach the campus?',
    category: 'Transportation',
    author: { name: 'Kiran Patel' },
    upvoteCount: 12,
    viewCount: 58,
    tags: ['transport', 'directions'],
  },
  {
    title: 'Can first-year students participate in cultural events?',
    description: 'Are there any restrictions on participation based on year of study? Specifically for dance and music competitions.',
    category: 'Cultural Events',
    author: { name: 'Sneha Reddy' },
    upvoteCount: 9,
    viewCount: 44,
    tags: ['cultural', 'eligibility'],
  },
  {
    title: 'Is there a registration fee for events?',
    description: 'What is the registration fee structure? Is it per-event or a flat pass for all events?',
    category: 'Registration',
    author: { name: 'Mohit Kumar' },
    upvoteCount: 41,
    viewCount: 210,
    tags: ['fee', 'payment'],
  },
  {
    title: 'What programming languages are allowed in the coding contest?',
    description: 'For the competitive programming event, which languages are accepted? Is there a specific IDE provided or should we bring our own setup?',
    category: 'Technical Events',
    author: { name: 'Divya Nair' },
    upvoteCount: 15,
    viewCount: 73,
    tags: ['coding', 'languages'],
  },
  {
    title: 'Are non-engineering students eligible to participate?',
    description: 'I am a student from a commerce background. Can I register and participate in any of the events?',
    category: 'General Information',
    author: { name: 'Arjun Mehta' },
    upvoteCount: 7,
    viewCount: 36,
    tags: ['eligibility', 'general'],
  },
  {
    title: 'What is the Vicharanashala internship (VINS)?',
    description: 'Can you describe the VINS internship program, its phases (Bronze, Silver, Gold, Platinum), and what badges stand for?',
    category: 'General Information',
    author: { name: 'Sudarshan Iyengar', email: 'sudarshan@iitrpr.ac.in' },
    upvoteCount: 45,
    viewCount: 280,
    tags: ['internship', 'vicharanashala', 'badges'],
  },
  {
    title: 'When can I start the internship and how long is the duration?',
    description: 'Is there a flexible starting window for the internship? What is the duration and optional grace period?',
    category: 'General Information',
    author: { name: 'Amit Roy' },
    upvoteCount: 38,
    viewCount: 195,
    tags: ['timing', 'duration', 'start-date'],
  },
  {
    title: 'Who is eligible to sign the institutional NOC (No Objection Certificate)?',
    description: 'Which academic officials can sign my NOC? Does it need to be physically signed and stamped?',
    category: 'Registration',
    author: { name: 'Sneha Gupta' },
    upvoteCount: 52,
    viewCount: 310,
    tags: ['noc', 'document', 'verification'],
  },
  {
    title: 'What is Rosetta and why does this thinking journal exist?',
    description: 'Why do interns need to fill out a daily thinking routine journal called Rosetta? What is the purpose?',
    category: 'General Information',
    author: { name: 'Preeti Das' },
    upvoteCount: 29,
    viewCount: 154,
    tags: ['rosetta', 'journal', 'thinking-routine'],
  }
];

const answers = [
  {
    faqIndex: 0,
    content: 'The registration deadline is 15th February 2025. Late registration with an additional fee of ₹100 is available until 18th February. After that, spot registration may be possible for select events at the venue.',
    author: { name: 'Samagama Organizers', email: 'org@samagama.in' },
    isAccepted: true,
    upvoteCount: 14,
  },
  {
    faqIndex: 1,
    content: 'Teams can have a minimum of 2 members and a maximum of 4 members for most technical events. Solo participation is allowed only for specific individual events like the algorithm challenge. Please check the event-specific rules on the official page.',
    author: { name: 'Technical Team Lead' },
    isAccepted: true,
    upvoteCount: 11,
  },
  {
    faqIndex: 2,
    content: 'Yes! Accommodation is available inside the campus for outstation participants. Boys hostel and girls hostel are both available. The cost is ₹200 per night. You must register for accommodation separately through the accommodation portal at the time of registration.',
    author: { name: 'Accommodation Coordinator' },
    isAccepted: true,
    upvoteCount: 19,
  },
  {
    faqIndex: 5,
    content: 'The registration fee is ₹150 for a single event and ₹300 for an all-events pass (recommended). Payment can be done online via the registration portal or in cash at the registration desk. Team events may have a flat team fee — check the individual event pages.',
    author: { name: 'Finance Committee' },
    isAccepted: true,
    upvoteCount: 28,
  },
  {
    faqIndex: 6,
    content: 'The accepted languages are C, C++, Python 3, Java, and JavaScript. The contest platform will be HackerRank and computers will be provided. You can bring your own laptop as well if you prefer your own setup.',
    author: { name: 'Coding Event Coordinator' },
    isAccepted: true,
    upvoteCount: 8,
  },
  {
    faqIndex: 8,
    content: 'VINS is a two-month, full-time online engagement at the Vicharanashala Lab, IIT Ropar. You will work on real open-source projects under a mentor. It features 4 phases: Bronze (Bronze - Tailored Coursework/Training), Silver (Silver - Core Project Contributions), Gold (Gold - Exceptional Feature Contribution Recognition), and Platinum (Platinum - Visit invitation to the IIT Ropar lab). The program is completely free.',
    author: { name: 'Vicharanashala Team', email: 'sudarshan@iitrpr.ac.in' },
    isAccepted: true,
    upvoteCount: 42,
  },
  {
    faqIndex: 9,
    content: 'VINS is highly flexible — you can start any time in 2026. The duration is exactly two months from your chosen start date, with an optional one-month grace period if required. A hard rule is that the internship must complete on or before 31 December 2026.',
    author: { name: 'Program Coordinator' },
    isAccepted: true,
    upvoteCount: 33,
  },
  {
    faqIndex: 10,
    content: 'Any authorized academic signatory at your institution can sign the NOC: HOD, Acting HOD, Principal, Dean, Director, or the Training & Placement Officer (TPO). It must carry the signatory\'s handwritten signature, an official rubber stamp, and their email address for validation.',
    author: { name: 'Verification Office' },
    isAccepted: true,
    upvoteCount: 49,
  },
  {
    faqIndex: 11,
    content: 'Rosetta is a daily thinking journal containing a 65-day private routine completed by the intern. It helps you process, articulate, and reflect on what you learned, while providing the lab qualitative insights on how to improve the cohort experience.',
    author: { name: 'L&D Mentor' },
    isAccepted: true,
    upvoteCount: 25,
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await FAQ.deleteMany({});
  await Answer.deleteMany({});
  await User.deleteMany({});
  console.log('Cleared existing data');

  // Insert preseeded admin and student
  const adminPasswordHash = crypto.createHash('sha256').update('admin123').digest('hex');
  const studentPasswordHash = crypto.createHash('sha256').update('student123').digest('hex');

  const seedUsers = [
    {
      name: 'Admin Director',
      email: 'admin@samagama.com',
      password: adminPasswordHash,
      role: 'admin',
    },
    {
      name: 'Jane Student',
      email: 'student@samagama.com',
      password: studentPasswordHash,
      role: 'student',
    }
  ];

  const createdUsers = await User.insertMany(seedUsers);
  console.log(`Inserted ${createdUsers.length} seed users (Admin & Student)`);

  const createdFAQs = await FAQ.insertMany(faqs);
  console.log(`Inserted ${createdFAQs.length} FAQs`);

  const answersToInsert = answers.map(a => ({
    ...a,
    faqId: createdFAQs[a.faqIndex]._id,
    faqIndex: undefined,
  }));

  const createdAnswers = await Answer.insertMany(answersToInsert);
  console.log(`Inserted ${createdAnswers.length} answers`);

  // Update FAQ statuses
  for (const ans of createdAnswers) {
    await FAQ.findByIdAndUpdate(ans.faqId, { status: 'Answered' });
  }
  console.log('Updated FAQ statuses');

  console.log('✓ Seed complete');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
