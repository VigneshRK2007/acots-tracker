export type Status = 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
export type Application = { id: string; company: string; role: string; status: Status; score: number; color: string; appliedDate?: string };
export const applications: Application[] = [
  { id:'1', company:'Google', role:'Frontend Engineer', status:'Interviewing', score:92, color:'#4285F4', appliedDate:'2026-09-28' },
  { id:'2', company:'Microsoft', role:'Software Engineer', status:'Applied', score:88, color:'#00A4EF', appliedDate:'2026-09-24' },
  { id:'3', company:'Amazon', role:'Full Stack Developer', status:'Interviewing', score:84, color:'#FF9900', appliedDate:'2026-09-20' },
  { id:'4', company:'Meta', role:'React Developer', status:'Offer', score:90, color:'#0866FF', appliedDate:'2026-09-17' },
  { id:'5', company:'Netflix', role:'UI Engineer', status:'Applied', score:76, color:'#E50914', appliedDate:'2026-09-13' },
  { id:'6', company:'Spotify', role:'Web Developer', status:'Saved', score:0, color:'#1DB954' },
  { id:'7', company:'Stripe', role:'Frontend Engineer', status:'Applied', score:81, color:'#635BFF', appliedDate:'2026-09-08' },
  { id:'8', company:'Airbnb', role:'Product Engineer', status:'Rejected', score:68, color:'#FF5A5F', appliedDate:'2026-09-04' },
  { id:'9', company:'Tesla', role:'Software Developer', status:'Saved', score:0, color:'#CC0000' },
  { id:'10', company:'Adobe', role:'React Engineer', status:'Rejected', score:71, color:'#FF0000', appliedDate:'2026-08-29' },
];
export const suggestions = [
  ['Add measurable achievements','Replace "responsible for" with quantified results like "Increased page load speed by 40%".','High Priority'],
  ['Include missing keywords','Your resume lacks: TypeScript, CI/CD, GraphQL. Add them to pass ATS filters.','High Priority'],
  ['Strengthen summary section','Your summary is generic. Tailor it to highlight 3+ years of frontend experience.','Medium'],
  ['Optimize formatting','Avoid tables and text boxes — some ATS systems cannot parse them correctly.','Low'],
  ['Add GitHub portfolio link','Including a portfolio link increases interview callback rate by 30%.','Medium'],
] as const;
export const requiredSkills = ['JavaScript','React','Node.js','CSS/Tailwind','TypeScript','GraphQL','AWS','Docker','CI/CD','Python'];
export const presentSkills = ['JavaScript','React','Node.js','CSS/Tailwind'];
export const resources = [
 ['TypeScript','TypeScript Official Handbook','typescriptlang.org/docs','2 weeks'], ['GraphQL','Apollo GraphQL Tutorial','apollographql.com/tutorials','1 week'], ['AWS','AWS Cloud Practitioner Essentials','aws.amazon.com/training','4 weeks'], ['Docker','Docker Getting Started Guide','docker.com/get-started','2 weeks'], ['CI/CD','GitHub Actions Tutorial','docs.github.com/actions','1 week'], ['Python','Python for Everybody (Coursera)','coursera.org','6 weeks'],
] as const;
export const technicalQuestions = [
 ['Explain the difference between let, const, and var in JavaScript.','Easy'], ['What is the virtual DOM and how does React use it to optimize rendering?','Medium'], ['Write a function to reverse a linked list. What is the time complexity?','Medium'], ['Explain event delegation and how it works in the browser.','Easy'], ['How would you optimize a web application that loads slowly? Walk through your approach.','Hard'], ['What is the difference between SQL and NoSQL databases? When would you choose each?','Medium'],
] as const;
export const hrQuestions = [
 ['Tell me about yourself and your background.','Easy'], ['Why are you interested in this company and this role specifically?','Easy'], ['Describe a challenging project you worked on and how you overcame obstacles.','Medium'], ['How do you handle conflicts with team members?','Medium'], ['Where do you see yourself in 5 years?','Easy'], ['Tell me about a time you failed. What did you learn from it?','Medium'],
] as const;
