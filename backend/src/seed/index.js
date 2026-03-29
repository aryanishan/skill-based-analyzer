require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const CareerPath = require('../models/CareerPath');

const connectDB = require('../config/db');

const seedData = async () => {
  await connectDB();
  await Skill.deleteMany({});
  await CareerPath.deleteMany({});
  console.log('Cleared existing data');

  // ─────────────────────────────────────────────
  // SKILLS: SOFTWARE / IT — Web Dev / Full Stack
  // ─────────────────────────────────────────────
  const webDevSkills = await Skill.insertMany([
    { name: 'HTML & CSS', type: 'skill', domain: 'Web Dev', category: 'Foundation', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Building block of every website', whereUsed: 'Frontend roles, web apps' }, tags: ['frontend'] },
    { name: 'JavaScript', type: 'skill', domain: 'Web Dev', category: 'Foundation', weight: 10, importanceLevel: 'critical', tooltip: { whyItMatters: 'Core language of the web', whereUsed: 'All web roles, Node.js, React' }, tags: ['frontend', 'backend'] },
    { name: 'Git & Version Control', type: 'skill', domain: 'Web Dev', category: 'Foundation', weight: 7, importanceLevel: 'critical', tooltip: { whyItMatters: 'Industry-standard for code collaboration', whereUsed: 'Every software role' }, tags: ['devtools'] },
    { name: 'React.js', type: 'skill', domain: 'Web Dev', category: 'Core', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Most popular frontend library', whereUsed: 'Frontend developer, Full Stack roles' }, tags: ['frontend'] },
    { name: 'Node.js', type: 'skill', domain: 'Web Dev', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'JavaScript on the server side', whereUsed: 'Backend, Full Stack roles' }, tags: ['backend'] },
    { name: 'Express.js', type: 'skill', domain: 'Web Dev', category: 'Core', weight: 7, importanceLevel: 'critical', tooltip: { whyItMatters: 'Standard Node.js web framework', whereUsed: 'Backend APIs, REST services' }, tags: ['backend'] },
    { name: 'MongoDB', type: 'skill', domain: 'Web Dev', category: 'Core', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Flexible NoSQL database for modern apps', whereUsed: 'MERN stack, Backend roles' }, tags: ['database'] },
    { name: 'REST APIs', type: 'skill', domain: 'Web Dev', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Standard for web communication', whereUsed: 'All backend roles, integrations' }, tags: ['backend', 'api'] },
    { name: 'TypeScript', type: 'skill', domain: 'Web Dev', category: 'Core', weight: 6, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Type-safe JavaScript for scalable apps', whereUsed: 'Enterprise frontend, Angular, React' }, tags: ['frontend'] },
    { name: 'Next.js', type: 'skill', domain: 'Web Dev', category: 'Advanced', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'React framework for SSR/SSG', whereUsed: 'Full Stack, SEO-sensitive apps' }, tags: ['frontend'] },
    { name: 'Docker & Containers', type: 'skill', domain: 'Web Dev', category: 'Advanced', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Containerization for deployment consistency', whereUsed: 'DevOps, Backend, Full Stack' }, tags: ['devops'] },
    { name: 'CI/CD Pipelines', type: 'skill', domain: 'Web Dev', category: 'Advanced', weight: 6, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Automated testing and deployment', whereUsed: 'DevOps, Senior Dev roles' }, tags: ['devops'] },
    { name: 'System Design', type: 'skill', domain: 'Web Dev', category: 'Advanced', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Required for senior/FAANG interviews', whereUsed: 'System design interviews, architect roles' }, tags: ['backend'] },
    { name: 'Data Structures & Algorithms', type: 'skill', domain: 'Web Dev', category: 'Foundation', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Core of technical interviews', whereUsed: 'FAANG, product companies' }, tags: ['cs-fundamentals'] },
  ]);

  // ─────────────────────────────────────────────
  // SKILLS: SOFTWARE / IT — Android Development
  // ─────────────────────────────────────────────
  const androidSkills = await Skill.insertMany([
    { name: 'Programming Basics', type: 'skill', domain: 'Android Dev', category: 'Foundation', weight: 7, importanceLevel: 'critical', tooltip: { whyItMatters: 'Builds the logic and problem-solving base needed for app development', whereUsed: 'All Android developer roles' }, tags: ['programming'] },
    { name: 'Kotlin', type: 'skill', domain: 'Android Dev', category: 'Foundation', weight: 10, importanceLevel: 'critical', tooltip: { whyItMatters: 'Primary modern language for Android apps', whereUsed: 'Native Android development' }, tags: ['programming', 'android'] },
    { name: 'Android Studio', type: 'skill', domain: 'Android Dev', category: 'Foundation', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Official IDE for building, running, and debugging Android apps', whereUsed: 'All Android projects' }, tags: ['tools', 'android'] },
    { name: 'Git & Version Control (Android)', type: 'skill', domain: 'Android Dev', category: 'Foundation', weight: 7, importanceLevel: 'critical', tooltip: { whyItMatters: 'Helps you collaborate safely and manage app code history', whereUsed: 'Team-based Android development' }, tags: ['devtools'] },
    { name: 'Object-Oriented Programming', type: 'skill', domain: 'Android Dev', category: 'Foundation', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Android apps rely heavily on classes, objects, and modular design', whereUsed: 'App architecture, reusable code' }, tags: ['programming'] },
    { name: 'Android Fundamentals', type: 'skill', domain: 'Android Dev', category: 'Core', weight: 10, importanceLevel: 'critical', tooltip: { whyItMatters: 'Covers activities, intents, fragments, and app lifecycle', whereUsed: 'Every Android application' }, tags: ['android'] },
    { name: 'Jetpack Compose', type: 'skill', domain: 'Android Dev', category: 'Core', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Modern toolkit for building native Android UI', whereUsed: 'Contemporary Android app interfaces' }, tags: ['android', 'ui'] },
    { name: 'XML Layouts', type: 'skill', domain: 'Android Dev', category: 'Core', weight: 6, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Many existing apps still use XML-based UI screens', whereUsed: 'Legacy and hybrid Android codebases' }, tags: ['android', 'ui'] },
    { name: 'Android Jetpack', type: 'skill', domain: 'Android Dev', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Provides lifecycle-aware components and app architecture support', whereUsed: 'Navigation, ViewModel, Room, WorkManager' }, tags: ['android', 'architecture'] },
    { name: 'REST APIs & JSON', type: 'skill', domain: 'Android Dev', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Most mobile apps need backend communication and data parsing', whereUsed: 'Networking, external services, app integrations' }, tags: ['api', 'networking'] },
    { name: 'Room Database', type: 'skill', domain: 'Android Dev', category: 'Core', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Enables structured local storage in Android apps', whereUsed: 'Offline-first and cached mobile apps' }, tags: ['database', 'android'] },
    { name: 'Firebase', type: 'skill', domain: 'Android Dev', category: 'Core', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Speeds up auth, analytics, notifications, and backend features', whereUsed: 'Mobile MVPs and production apps' }, tags: ['backend', 'cloud'] },
    { name: 'MVVM Architecture', type: 'skill', domain: 'Android Dev', category: 'Advanced', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Keeps Android code maintainable and testable at scale', whereUsed: 'Professional Android teams and large apps' }, tags: ['architecture'] },
    { name: 'Dependency Injection', type: 'skill', domain: 'Android Dev', category: 'Advanced', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Improves modularity and testability of app components', whereUsed: 'Scalable Android codebases' }, tags: ['architecture'] },
    { name: 'Coroutines & Flow', type: 'skill', domain: 'Android Dev', category: 'Advanced', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Handles asynchronous work cleanly in Android apps', whereUsed: 'Networking, state updates, background tasks' }, tags: ['kotlin', 'concurrency'] },
    { name: 'Android Testing', type: 'skill', domain: 'Android Dev', category: 'Advanced', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Reduces regressions across UI and business logic changes', whereUsed: 'Unit tests, UI tests, release quality' }, tags: ['testing'] },
    { name: 'Play Store Deployment', type: 'skill', domain: 'Android Dev', category: 'Advanced', weight: 6, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Publishing is part of shipping a real Android product', whereUsed: 'Releases, app signing, rollout management' }, tags: ['deployment', 'android'] },
  ]);

  // ─────────────────────────────────────────────
  // SKILLS: AI/ML
  // ─────────────────────────────────────────────
  const aiSkills = await Skill.insertMany([
    { name: 'Python', type: 'skill', domain: 'AI/ML', category: 'Foundation', weight: 10, importanceLevel: 'critical', tooltip: { whyItMatters: 'Primary language for ML/AI', whereUsed: 'All AI/ML roles, Data Science' }, tags: ['programming'] },
    { name: 'Statistics & Probability', type: 'subject', domain: 'AI/ML', category: 'Foundation', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Mathematical foundation of ML', whereUsed: 'ML, Data Science, Research' }, tags: ['math'] },
    { name: 'Linear Algebra', type: 'subject', domain: 'AI/ML', category: 'Foundation', weight: 7, importanceLevel: 'critical', tooltip: { whyItMatters: 'Underpins neural networks and transformations', whereUsed: 'Deep Learning, Computer Vision' }, tags: ['math'] },
    { name: 'NumPy & Pandas', type: 'skill', domain: 'AI/ML', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Data manipulation libraries', whereUsed: 'Data Science, ML preprocessing' }, tags: ['python'] },
    { name: 'Machine Learning', type: 'skill', domain: 'AI/ML', category: 'Core', weight: 10, importanceLevel: 'critical', tooltip: { whyItMatters: 'Core of AI-driven applications', whereUsed: 'ML Engineer, Data Scientist' }, tags: ['ml'] },
    { name: 'Deep Learning', type: 'skill', domain: 'AI/ML', category: 'Core', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Powers computer vision, NLP, generation', whereUsed: 'AI Research, ML Engineer' }, tags: ['ml', 'dl'] },
    { name: 'Scikit-learn', type: 'skill', domain: 'AI/ML', category: 'Core', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Standard ML library for classic algorithms', whereUsed: 'Data Science, ML roles' }, tags: ['python', 'ml'] },
    { name: 'TensorFlow/PyTorch', type: 'skill', domain: 'AI/ML', category: 'Advanced', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Industry-standard deep learning frameworks', whereUsed: 'DL Research, AI Engineer' }, tags: ['dl'] },
    { name: 'NLP', type: 'skill', domain: 'AI/ML', category: 'Advanced', weight: 8, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Powers chatbots, language models, translation', whereUsed: 'LLM roles, NLP Engineer' }, tags: ['ml', 'nlp'] },
    { name: 'MLOps', type: 'skill', domain: 'AI/ML', category: 'Advanced', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Deploy and monitor ML models in production', whereUsed: 'Senior ML roles, AI Platform' }, tags: ['devops', 'ml'] },
  ]);

  // ─────────────────────────────────────────────
  // SKILLS: CYBERSECURITY
  // ─────────────────────────────────────────────
  const cyberSkills = await Skill.insertMany([
    { name: 'Networking Fundamentals', type: 'subject', domain: 'Cybersecurity', category: 'Foundation', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'TCP/IP, DNS, HTTP are security attack surfaces', whereUsed: 'All security roles' }, tags: ['networking'] },
    { name: 'Linux Administration', type: 'skill', domain: 'Cybersecurity', category: 'Foundation', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Most servers run Linux; essential for pentesting', whereUsed: 'SOC, Penetration Testing' }, tags: ['os'] },
    { name: 'Cryptography', type: 'subject', domain: 'Cybersecurity', category: 'Foundation', weight: 7, importanceLevel: 'critical', tooltip: { whyItMatters: 'Foundation of secure communication', whereUsed: 'Security engineer, cryptographer' }, tags: ['theory'] },
    { name: 'Ethical Hacking & Pentesting', type: 'skill', domain: 'Cybersecurity', category: 'Core', weight: 10, importanceLevel: 'critical', tooltip: { whyItMatters: 'Simulating attacks to find vulnerabilities', whereUsed: 'Pen Tester, Red Team' }, tags: ['offensive'] },
    { name: 'Security Information & Event Management (SIEM)', type: 'skill', domain: 'Cybersecurity', category: 'Core', weight: 8, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Monitor and analyze security events', whereUsed: 'SOC Analyst' }, tags: ['defensive'] },
    { name: 'Web Application Security (OWASP)', type: 'skill', domain: 'Cybersecurity', category: 'Core', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'OWASP Top 10 covers most exploited vulnerabilities', whereUsed: 'App Sec, Pen Testing' }, tags: ['offensive', 'web'] },
    { name: 'Incident Response', type: 'skill', domain: 'Cybersecurity', category: 'Advanced', weight: 8, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Managing security breaches effectively', whereUsed: 'SOC, CISO roles' }, tags: ['defensive'] },
    { name: 'Reverse Engineering & Malware Analysis', type: 'skill', domain: 'Cybersecurity', category: 'Advanced', weight: 7, importanceLevel: 'optional', tooltip: { whyItMatters: 'Analyze malicious software', whereUsed: 'Malware Analyst, Threat Intelligence' }, tags: ['offensive'] },
  ]);

  // ─────────────────────────────────────────────
  // SKILLS: DATA SCIENCE
  // ─────────────────────────────────────────────
  const dsSkills = await Skill.insertMany([
    { name: 'SQL', type: 'skill', domain: 'Data Science', category: 'Foundation', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Most data lives in relational databases', whereUsed: 'Data Analyst, Data Scientist, BI' }, tags: ['database'] },
    { name: 'Excel & Spreadsheets', type: 'skill', domain: 'Data Science', category: 'Foundation', weight: 5, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Quick data exploration tool', whereUsed: 'Business Analyst, Data Analyst' }, tags: ['tools'] },
    { name: 'Data Visualization', type: 'skill', domain: 'Data Science', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Communicate insights effectively', whereUsed: 'Data Analyst, BI Developer' }, tags: ['visualization'] },
    { name: 'Feature Engineering', type: 'skill', domain: 'Data Science', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Creates better inputs for ML models', whereUsed: 'Data Scientist, ML Engineer' }, tags: ['ml'] },
    { name: 'A/B Testing & Experimentation', type: 'skill', domain: 'Data Science', category: 'Advanced', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Data-driven decision making', whereUsed: 'Product Analytics, Data Science' }, tags: ['analytics'] },
    { name: 'Big Data (Spark, Hadoop)', type: 'skill', domain: 'Data Science', category: 'Advanced', weight: 7, importanceLevel: 'optional', tooltip: { whyItMatters: 'Processing large-scale datasets', whereUsed: 'Data Engineer, Big Data roles' }, tags: ['bigdata'] },
  ]);

  // ─────────────────────────────────────────────
  // SKILLS: MECHANICAL ENGINEERING
  // ─────────────────────────────────────────────
  const mechSkills = await Skill.insertMany([
    { name: 'Engineering Mathematics', type: 'subject', domain: 'Mechanical', category: 'Foundation', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Foundation for all engineering computations', whereUsed: 'GATE, PSU exams, all mech domains' }, tags: ['math'] },
    { name: 'Engineering Mechanics', type: 'subject', domain: 'Mechanical', category: 'Foundation', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Statics and dynamics of physical systems', whereUsed: 'Structural, Automotive, GATE' }, tags: ['core'] },
    { name: 'Strength of Materials', type: 'subject', domain: 'Mechanical', category: 'Core', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Stress, strain, and failure analysis', whereUsed: 'Design, GATE Mechanical' }, tags: ['core'] },
    { name: 'Thermodynamics', type: 'subject', domain: 'Mechanical', category: 'Core', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Laws governing heat and energy', whereUsed: 'Power plants, GATE, PSU' }, tags: ['core'] },
    { name: 'Heat Transfer', type: 'subject', domain: 'Mechanical', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Thermal analysis of systems', whereUsed: 'Thermal Engineering, GATE' }, tags: ['core'] },
    { name: 'Fluid Mechanics', type: 'subject', domain: 'Mechanical', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Behavior of liquids and gases', whereUsed: 'GATE, aerospace, hydraulics' }, tags: ['core'] },
    { name: 'Machine Design', type: 'subject', domain: 'Mechanical', category: 'Core', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Designing mechanical components', whereUsed: 'Design Engineer, GATE' }, tags: ['design'] },
    { name: 'Manufacturing Processes', type: 'subject', domain: 'Mechanical', category: 'Core', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Understanding production methods', whereUsed: 'Production, GATE, PSU' }, tags: ['manufacturing'] },
    { name: 'CAD (SolidWorks/AutoCAD)', type: 'skill', domain: 'Mechanical', category: 'Core', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Industry tool for design and modeling', whereUsed: 'Design roles, Product companies' }, tags: ['tools'] },
    { name: 'Finite Element Analysis (FEA)', type: 'skill', domain: 'Mechanical', category: 'Advanced', weight: 6, importanceLevel: 'optional', tooltip: { whyItMatters: 'Simulation of structural systems', whereUsed: 'Simulation Engineer, R&D' }, tags: ['simulation'] },
    { name: 'Industrial Engineering', type: 'subject', domain: 'Mechanical', category: 'Advanced', weight: 6, importanceLevel: 'optional', tooltip: { whyItMatters: 'Optimizing production systems', whereUsed: 'Operations, GATE IE' }, tags: ['operations'] },
  ]);

  // ─────────────────────────────────────────────
  // SKILLS: ELECTRICAL ENGINEERING
  // ─────────────────────────────────────────────
  const elecSkills = await Skill.insertMany([
    { name: 'Circuit Theory', type: 'subject', domain: 'Electrical', category: 'Foundation', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Fundamental to all electrical analysis', whereUsed: 'GATE EE, Electronics, Power' }, tags: ['core'] },
    { name: 'Electromagnetic Theory', type: 'subject', domain: 'Electrical', category: 'Foundation', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Maxwell equations, wave propagation', whereUsed: 'GATE EE, Communication, Power' }, tags: ['core'] },
    { name: 'Electrical Machines', type: 'subject', domain: 'Electrical', category: 'Core', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Transformers, motors, generators', whereUsed: 'GATE EE, Power sector PSU' }, tags: ['machines'] },
    { name: 'Power Systems', type: 'subject', domain: 'Electrical', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Grid, transmission, distribution', whereUsed: 'Power utilities, GATE EE' }, tags: ['power'] },
    { name: 'Control Systems', type: 'subject', domain: 'Electrical', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Feedback and stability theory', whereUsed: 'GATE EE/ECE, Automation' }, tags: ['control'] },
    { name: 'Signal Processing', type: 'subject', domain: 'Electrical', category: 'Core', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'DSP, filters, frequency domain', whereUsed: 'GATE, Telecom, Embedded' }, tags: ['signal'] },
    { name: 'Power Electronics', type: 'subject', domain: 'Electrical', category: 'Advanced', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Converters, inverters, EV technology', whereUsed: 'EV sector, Renewable energy' }, tags: ['power'] },
  ]);

  // ─────────────────────────────────────────────
  // SKILLS: CIVIL ENGINEERING
  // ─────────────────────────────────────────────
  const civilSkills = await Skill.insertMany([
    { name: 'Structural Analysis', type: 'subject', domain: 'Civil', category: 'Foundation', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Core of structural design', whereUsed: 'GATE CE, Structural Engineer' }, tags: ['structural'] },
    { name: 'Concrete Technology', type: 'subject', domain: 'Civil', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Materials and mix design', whereUsed: 'Construction, GATE CE' }, tags: ['construction'] },
    { name: 'Soil Mechanics', type: 'subject', domain: 'Civil', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Foundation design and stability', whereUsed: 'Geotechnical, GATE CE' }, tags: ['geotechnical'] },
    { name: 'Hydraulics & Fluid Mechanics', type: 'subject', domain: 'Civil', category: 'Core', weight: 7, importanceLevel: 'critical', tooltip: { whyItMatters: 'Water flow design', whereUsed: 'Irrigation, Water resources, GATE' }, tags: ['hydraulics'] },
    { name: 'Transportation Engineering', type: 'subject', domain: 'Civil', category: 'Core', weight: 6, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Road and highway design', whereUsed: 'NHAI, PWD, GATE CE' }, tags: ['transportation'] },
    { name: 'AutoCAD for Civil', type: 'skill', domain: 'Civil', category: 'Core', weight: 6, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Drawing and design tool', whereUsed: 'Design offices, Construction' }, tags: ['tools'] },
  ]);

  // ─────────────────────────────────────────────
  // SKILLS: UPSC
  // ─────────────────────────────────────────────
  const upscSkills = await Skill.insertMany([
    { name: 'Indian Polity & Constitution', type: 'topic', domain: 'UPSC', category: 'Foundation', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Highest weightage in Prelims & Mains', whereUsed: 'UPSC CSE Prelims GS1, Mains GS2' }, tags: ['gs'] },
    { name: 'Indian History', type: 'topic', domain: 'UPSC', category: 'Foundation', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Ancient, Medieval, Modern history is heavily tested', whereUsed: 'UPSC Prelims GS1, Mains GS1' }, tags: ['gs'] },
    { name: 'Geography (India & World)', type: 'topic', domain: 'UPSC', category: 'Foundation', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Physical, human, and economic geography', whereUsed: 'UPSC Prelims, Mains GS1' }, tags: ['gs'] },
    { name: 'Indian Economy', type: 'topic', domain: 'UPSC', category: 'Core', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Economic policies and development', whereUsed: 'UPSC Prelims, Mains GS3' }, tags: ['gs'] },
    { name: 'Environment & Ecology', type: 'topic', domain: 'UPSC', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Biodiversity, climate, conservation', whereUsed: 'UPSC Prelims, Mains GS3' }, tags: ['gs'] },
    { name: 'Science & Technology', type: 'topic', domain: 'UPSC', category: 'Core', weight: 7, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Space, defense, biotech current affairs', whereUsed: 'UPSC Prelims, Mains GS3' }, tags: ['gs'] },
    { name: 'Current Affairs', type: 'topic', domain: 'UPSC', category: 'Core', weight: 10, importanceLevel: 'critical', tooltip: { whyItMatters: 'Links static portions to real questions', whereUsed: 'UPSC Prelims, Mains, Interview' }, tags: ['csat'] },
    { name: 'Ethics, Integrity & Aptitude (GS4)', type: 'topic', domain: 'UPSC', category: 'Advanced', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Entire GS Paper 4 + interview', whereUsed: 'UPSC Mains GS4' }, tags: ['mains'] },
    { name: 'Essay Writing', type: 'topic', domain: 'UPSC', category: 'Advanced', weight: 7, importanceLevel: 'critical', tooltip: { whyItMatters: 'Dedicated 250-mark paper', whereUsed: 'UPSC Mains Essay Paper' }, tags: ['mains'] },
    { name: 'Answer Writing Practice', type: 'skill', domain: 'UPSC', category: 'Advanced', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Differentiates toppers from qualifiers', whereUsed: 'UPSC Mains scoring' }, tags: ['practice'] },
    { name: 'CSAT (Reasoning + Math)', type: 'topic', domain: 'UPSC', category: 'Foundation', weight: 6, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Qualifying paper in Prelims', whereUsed: 'UPSC CSE Prelims Paper 2' }, tags: ['csat'] },
  ]);

  // ─────────────────────────────────────────────
  // SKILLS: SSC / BANKING
  // ─────────────────────────────────────────────
  const sscSkills = await Skill.insertMany([
    { name: 'Quantitative Aptitude', type: 'topic', domain: 'SSC/Banking', category: 'Foundation', weight: 10, importanceLevel: 'critical', tooltip: { whyItMatters: 'Highest weight section in almost all govt exams', whereUsed: 'SSC CGL, IBPS PO, SBI PO, RRB' }, tags: ['aptitude'] },
    { name: 'Reasoning Ability', type: 'topic', domain: 'SSC/Banking', category: 'Foundation', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'Tests logical ability', whereUsed: 'SSC, Banking, Railways exams' }, tags: ['reasoning'] },
    { name: 'English Language', type: 'topic', domain: 'SSC/Banking', category: 'Foundation', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Grammar, comprehension, vocabulary tested', whereUsed: 'All SSC and Banking exams' }, tags: ['english'] },
    { name: 'General Awareness & GK', type: 'topic', domain: 'SSC/Banking', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Current affairs + static GK', whereUsed: 'SSC CGL, IBPS, SBI, RBI' }, tags: ['gk'] },
    { name: 'Computer Knowledge', type: 'topic', domain: 'SSC/Banking', category: 'Core', weight: 5, importanceLevel: 'recommended', tooltip: { whyItMatters: 'Basic Computer awareness for banking exams', whereUsed: 'IBPS PO, SBI PO, Clerk' }, tags: ['computer'] },
    { name: 'Banking & Finance Awareness', type: 'topic', domain: 'SSC/Banking', category: 'Advanced', weight: 7, importanceLevel: 'critical', tooltip: { whyItMatters: 'Required for professional knowledge in banking tests', whereUsed: 'IBPS PO, SBI PO, RBI Grade B' }, tags: ['banking'] },
  ]);

  // ─────────────────────────────────────────────
  // SKILLS: GATE
  // ─────────────────────────────────────────────
  const gateSkills = await Skill.insertMany([
    { name: 'General Aptitude', type: 'topic', domain: 'GATE', category: 'Foundation', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: '15 marks in GATE from aptitude + English', whereUsed: 'GATE all papers' }, tags: ['aptitude'] },
    { name: 'Engineering Mathematics (GATE)', type: 'subject', domain: 'GATE', category: 'Foundation', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: '15% weight in GATE CS, EE, ME', whereUsed: 'GATE CS, EE, ME, CE' }, tags: ['math'] },
    { name: 'Data Structures (GATE CS)', type: 'subject', domain: 'GATE', category: 'Core', weight: 9, importanceLevel: 'critical', tooltip: { whyItMatters: 'High-weight topic in GATE CS', whereUsed: 'GATE CS/IT' }, tags: ['cs'] },
    { name: 'Operating Systems (GATE CS)', type: 'subject', domain: 'GATE', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Recurring topic in GATE CS', whereUsed: 'GATE CS' }, tags: ['cs'] },
    { name: 'Database Management (GATE CS)', type: 'subject', domain: 'GATE', category: 'Core', weight: 7, importanceLevel: 'critical', tooltip: { whyItMatters: 'SQL, ER model, normalization in GATE', whereUsed: 'GATE CS' }, tags: ['cs'] },
    { name: 'Computer Networks (GATE CS)', type: 'subject', domain: 'GATE', category: 'Core', weight: 8, importanceLevel: 'critical', tooltip: { whyItMatters: 'Protocols, routing, TCP/IP in GATE', whereUsed: 'GATE CS' }, tags: ['cs'] },
    { name: 'Previous Year Papers Practice', type: 'skill', domain: 'GATE', category: 'Advanced', weight: 10, importanceLevel: 'critical', tooltip: { whyItMatters: 'Most reliable way to improve GATE score', whereUsed: 'GATE all papers' }, tags: ['practice'] },
  ]);

  // ─────────────────────────────────────────────
  // NOW SET DEPENDENCIES
  // ─────────────────────────────────────────────
  const jsSkill = webDevSkills.find(s => s.name === 'JavaScript');
  const htmlSkill = webDevSkills.find(s => s.name === 'HTML & CSS');
  const reactSkill = webDevSkills.find(s => s.name === 'React.js');
  const nodeSkill = webDevSkills.find(s => s.name === 'Node.js');
  const nextSkill = webDevSkills.find(s => s.name === 'Next.js');
  const dockerSkill = webDevSkills.find(s => s.name === 'Docker & Containers');
  const tsSkill = webDevSkills.find(s => s.name === 'TypeScript');
  const cicdSkill = webDevSkills.find(s => s.name === 'CI/CD Pipelines');
  const dsaSkill = webDevSkills.find(s => s.name === 'Data Structures & Algorithms');

  const programmingBasicsSkill = androidSkills.find(s => s.name === 'Programming Basics');
  const kotlinSkill = androidSkills.find(s => s.name === 'Kotlin');
  const androidFundamentalsSkill = androidSkills.find(s => s.name === 'Android Fundamentals');
  const composeSkill = androidSkills.find(s => s.name === 'Jetpack Compose');
  const jetpackSkill = androidSkills.find(s => s.name === 'Android Jetpack');
  const roomSkill = androidSkills.find(s => s.name === 'Room Database');
  const firebaseSkill = androidSkills.find(s => s.name === 'Firebase');
  const mvvmSkill = androidSkills.find(s => s.name === 'MVVM Architecture');
  const diSkill = androidSkills.find(s => s.name === 'Dependency Injection');
  const coroutinesSkill = androidSkills.find(s => s.name === 'Coroutines & Flow');
  const testingSkill = androidSkills.find(s => s.name === 'Android Testing');
  const deploymentSkill = androidSkills.find(s => s.name === 'Play Store Deployment');

  const pythonSkill = aiSkills.find(s => s.name === 'Python');
  const numpySkill = aiSkills.find(s => s.name === 'NumPy & Pandas');
  const mlSkill = aiSkills.find(s => s.name === 'Machine Learning');
  const dlSkill = aiSkills.find(s => s.name === 'Deep Learning');
  const tfSkill = aiSkills.find(s => s.name === 'TensorFlow/PyTorch');
  const nlpSkill = aiSkills.find(s => s.name === 'NLP');
  const mlopsSkill = aiSkills.find(s => s.name === 'MLOps');

  const thermoSkill = mechSkills.find(s => s.name === 'Thermodynamics');
  const heatSkill = mechSkills.find(s => s.name === 'Heat Transfer');
  const mechMathSkill = mechSkills.find(s => s.name === 'Engineering Mathematics');
  const somSkill = mechSkills.find(s => s.name === 'Strength of Materials');
  const engMechSkill = mechSkills.find(s => s.name === 'Engineering Mechanics');

  const circuitSkill = elecSkills.find(s => s.name === 'Circuit Theory');
  const emSkill = elecSkills.find(s => s.name === 'Electromagnetic Theory');
  const machinesSkill = elecSkills.find(s => s.name === 'Electrical Machines');
  const gateMathSkill = gateSkills.find(s => s.name === 'Engineering Mathematics (GATE)');

  await Skill.findByIdAndUpdate(reactSkill._id, { dependencies: [jsSkill._id, htmlSkill._id] });
  await Skill.findByIdAndUpdate(nodeSkill._id, { dependencies: [jsSkill._id] });
  await Skill.findByIdAndUpdate(nextSkill._id, { dependencies: [reactSkill._id] });
  await Skill.findByIdAndUpdate(tsSkill._id, { dependencies: [jsSkill._id] });
  await Skill.findByIdAndUpdate(dockerSkill._id, { dependencies: [nodeSkill._id] });
  await Skill.findByIdAndUpdate(cicdSkill._id, { dependencies: [dockerSkill._id] });

  await Skill.findByIdAndUpdate(kotlinSkill._id, { dependencies: [programmingBasicsSkill._id] });
  await Skill.findByIdAndUpdate(androidFundamentalsSkill._id, { dependencies: [kotlinSkill._id] });
  await Skill.findByIdAndUpdate(composeSkill._id, { dependencies: [androidFundamentalsSkill._id] });
  await Skill.findByIdAndUpdate(jetpackSkill._id, { dependencies: [androidFundamentalsSkill._id] });
  await Skill.findByIdAndUpdate(roomSkill._id, { dependencies: [androidFundamentalsSkill._id, jetpackSkill._id] });
  await Skill.findByIdAndUpdate(firebaseSkill._id, { dependencies: [androidFundamentalsSkill._id] });
  await Skill.findByIdAndUpdate(mvvmSkill._id, { dependencies: [androidFundamentalsSkill._id, jetpackSkill._id] });
  await Skill.findByIdAndUpdate(diSkill._id, { dependencies: [mvvmSkill._id] });
  await Skill.findByIdAndUpdate(coroutinesSkill._id, { dependencies: [kotlinSkill._id, androidFundamentalsSkill._id] });
  await Skill.findByIdAndUpdate(testingSkill._id, { dependencies: [mvvmSkill._id, coroutinesSkill._id] });
  await Skill.findByIdAndUpdate(deploymentSkill._id, { dependencies: [testingSkill._id] });

  await Skill.findByIdAndUpdate(numpySkill._id, { dependencies: [pythonSkill._id] });
  await Skill.findByIdAndUpdate(mlSkill._id, { dependencies: [pythonSkill._id, numpySkill._id] });
  await Skill.findByIdAndUpdate(dlSkill._id, { dependencies: [mlSkill._id] });
  await Skill.findByIdAndUpdate(tfSkill._id, { dependencies: [dlSkill._id] });
  await Skill.findByIdAndUpdate(nlpSkill._id, { dependencies: [dlSkill._id, pythonSkill._id] });
  await Skill.findByIdAndUpdate(mlopsSkill._id, { dependencies: [mlSkill._id] });

  await Skill.findByIdAndUpdate(somSkill._id, { dependencies: [engMechSkill._id, mechMathSkill._id] });
  await Skill.findByIdAndUpdate(heatSkill._id, { dependencies: [thermoSkill._id] });
  await Skill.findByIdAndUpdate(machinesSkill._id, { dependencies: [circuitSkill._id, emSkill._id] });

  // ─────────────────────────────────────────────
  // CAREER PATHS
  // ─────────────────────────────────────────────
  const careerPaths = await CareerPath.insertMany([
    {
      name: 'Full Stack Developer',
      domain: 'Software/IT',
      subdomain: 'Web Dev',
      description: 'Build end-to-end web applications using modern JavaScript/TypeScript stack',
      icon: 'FS',
      tags: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      estimatedMonths: 10,
      roadmap: webDevSkills.map(s => s._id)
    },
    {
      name: 'AI/ML Engineer',
      domain: 'Software/IT',
      subdomain: 'AI/ML',
      description: 'Build and deploy machine learning and deep learning models',
      icon: 'AI',
      tags: ['Python', 'TensorFlow', 'Deep Learning', 'NLP'],
      estimatedMonths: 14,
      roadmap: aiSkills.map(s => s._id)
    },
    {
      name: 'Cybersecurity Specialist',
      domain: 'Software/IT',
      subdomain: 'Cybersecurity',
      description: 'Protect systems and networks from attacks and vulnerabilities',
      icon: 'CY',
      tags: ['Pentesting', 'Networking', 'SIEM', 'OWASP'],
      estimatedMonths: 12,
      roadmap: cyberSkills.map(s => s._id)
    },
    {
      name: 'Android Developer',
      domain: 'Software/IT',
      subdomain: 'Android Dev',
      description: 'Build native Android applications with Kotlin, Jetpack, and modern mobile architecture',
      icon: 'AD',
      tags: ['Kotlin', 'Jetpack Compose', 'Firebase', 'Android'],
      estimatedMonths: 9,
      roadmap: [...androidSkills.map(s => s._id), dsaSkill._id]
    },
    {
      name: 'Data Scientist',
      domain: 'Software/IT',
      subdomain: 'Data Science',
      description: 'Analyze data and build predictive models to drive business decisions',
      icon: 'DS',
      tags: ['Python', 'SQL', 'Machine Learning', 'Visualization'],
      estimatedMonths: 12,
      roadmap: [...dsSkills.map(s => s._id), pythonSkill._id, mlSkill._id]
    },
    {
      name: 'Mechanical Engineer (GATE)',
      domain: 'Core Engineering',
      subdomain: 'Mechanical',
      description: 'Prepare for GATE ME and PSU positions in core mechanical engineering',
      icon: 'ME',
      tags: ['Thermodynamics', 'FEA', 'GATE', 'CAD'],
      estimatedMonths: 18,
      roadmap: mechSkills.map(s => s._id)
    },
    {
      name: 'Electrical Engineer (GATE)',
      domain: 'Core Engineering',
      subdomain: 'Electrical',
      description: 'Prepare for GATE EE and power sector jobs in electrical engineering',
      icon: 'EE',
      tags: ['Power Systems', 'Machines', 'Control Systems', 'GATE'],
      estimatedMonths: 18,
      roadmap: elecSkills.map(s => s._id)
    },
    {
      name: 'Civil Engineer (GATE)',
      domain: 'Core Engineering',
      subdomain: 'Civil',
      description: 'Prepare for GATE CE and government infrastructure roles',
      icon: 'CE',
      tags: ['Structural', 'Soil Mechanics', 'GATE', 'AutoCAD'],
      estimatedMonths: 18,
      roadmap: civilSkills.map(s => s._id)
    },
    {
      name: 'UPSC CSE Aspirant',
      domain: 'Government Exams',
      subdomain: 'UPSC',
      description: 'Comprehensive preparation for India\'s most prestigious civil services exam',
      icon: 'UP',
      tags: ['GS', 'Current Affairs', 'Ethics', 'Mains'],
      estimatedMonths: 24,
      roadmap: upscSkills.map(s => s._id)
    },
    {
      name: 'SSC / Banking Aspirant',
      domain: 'Government Exams',
      subdomain: 'SSC/Banking',
      description: 'Prepare for SSC CGL, IBPS PO, SBI PO and other banking examinations',
      icon: 'SB',
      tags: ['Aptitude', 'Reasoning', 'English', 'Banking'],
      estimatedMonths: 8,
      roadmap: sscSkills.map(s => s._id)
    },
    {
      name: 'GATE CS Aspirant',
      domain: 'Government Exams',
      subdomain: 'GATE',
      description: 'Ace GATE CS/IT for M.Tech admissions and PSU job opportunities',
      icon: 'GC',
      tags: ['GATE', 'CS', 'DSA', 'OS', 'DBMS'],
      estimatedMonths: 12,
      roadmap: [...gateSkills.map(s => s._id), dsaSkill._id]
    }
  ]);

  console.log(`Seeded ${careerPaths.length} career paths`);
  console.log(`Seeded ${await Skill.countDocuments()} skills/subjects/topics`);
  console.log('Seed complete');
  mongoose.connection.close();
};

seedData().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
