const mongoose = require('mongoose');
require('dotenv').config();

const FAQ = require('./src/models/faq.model');
const Answer = require('./src/models/answer.model');

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
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await FAQ.deleteMany({});
  await Answer.deleteMany({});
  console.log('Cleared existing data');

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
