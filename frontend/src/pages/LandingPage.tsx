import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCareerPaths } from '../api';
import AnimatedCounter from '../components/AnimatedCounter';
import LogoBadge from '../components/LogoBadge';
import MarketingNavbar from '../components/MarketingNavbar';
import Reveal from '../components/Reveal';
import { useAuth } from '../context/AuthContext';
import { CareerPath } from '../types';

const platformPillars = [
  {
    title: 'Role-level clarity',
    description:
      'Give every learner or candidate a precise picture of what the target role expects, from foundations to advanced capability gaps.',
    icon: 'CL',
  },
  {
    title: 'Assessment that feels actionable',
    description:
      'Replace generic scorecards with guided readiness analysis, missing-skill mapping, and practical next steps that are easy to follow.',
    icon: 'RA',
  },
  {
    title: 'Structured learning progression',
    description:
      'Turn role requirements into a sequenced roadmap so improvement plans feel deliberate instead of scattered across disconnected resources.',
    icon: 'RM',
  },
  {
    title: 'Decision-ready reporting',
    description:
      'Keep recent assessments, trend signals, and path comparisons in one workspace your team can use to make faster placement decisions.',
    icon: 'IQ',
  },
];

const audienceBadges = [
  'Career Services',
  'Placement Teams',
  'Learning Programs',
  'Internal Mobility',
  'Early Career Hiring',
];

const workflow = [
  {
    step: '01',
    title: 'Select a role that matters',
    description:
      'Start from curated career paths across software, engineering, and exam-focused tracks instead of guessing what a role requires.',
  },
  {
    step: '02',
    title: 'Capture capability honestly',
    description:
      'Mark existing skills at the right depth so the system can distinguish awareness, working confidence, and true readiness.',
  },
  {
    step: '03',
    title: 'Turn analysis into motion',
    description:
      'Use readiness scores, missing-skill insights, and roadmap sequencing to guide the next few weeks with less friction.',
  },
];

const testimonialCards = [
  {
    quote:
      'The product makes readiness conversations much easier because the learner sees what to prioritize next, not just a percentage.',
    name: 'Asha Patel',
    role: 'Career services lead',
  },
  {
    quote:
      'The experience feels credible in front of students and stakeholders. It gives us a cleaner story for role fit, progress, and timing.',
    name: 'Rohan Malhotra',
    role: 'Program director',
  },
  {
    quote:
      'It feels closer to a real talent intelligence product than a typical learning dashboard, which is exactly what we wanted for adoption.',
    name: 'Neha Iyer',
    role: 'Workforce strategy manager',
  },
];

const planCards = [
  {
    name: 'Starter',
    price: '$0',
    cadence: '/ trial',
    description: 'For individuals validating role fit and building the first readiness baseline.',
    cta: 'Try Now',
    highlight: false,
    features: ['1 workspace', 'Core career library', 'Guided readiness analysis', 'Saved assessment history'],
  },
  {
    name: 'Growth',
    price: '$39',
    cadence: '/ month',
    description: 'For coaches and learning teams running structured readiness workflows at higher volume.',
    cta: 'Get Started',
    highlight: true,
    features: ['Everything in Starter', 'Team-ready reporting', 'Expanded path coverage', 'Priority product support'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: '',
    description: 'For institutions and companies aligning talent programs, mobility pathways, and internal role readiness.',
    cta: 'Book Demo',
    highlight: false,
    features: ['Multi-team deployment', 'Implementation guidance', 'Custom path modeling', 'Priority roadmap access'],
  },
];

const faqs = [
  {
    question: 'Who is this product designed for?',
    answer:
      'CareerLab works well for ambitious individuals, training programs, universities, and talent teams that need a more structured way to evaluate readiness for defined roles.',
  },
  {
    question: 'What makes the experience different from a generic skill checklist?',
    answer:
      'The product combines role definitions, proficiency-aware assessment, roadmap sequencing, and progress visibility in one place, so the output is far more decision-friendly than a flat checklist.',
  },
  {
    question: 'Can teams use it for multiple domains and role families?',
    answer:
      'Yes. The current library already spans software, core engineering, and government exam tracks, and the interface is designed to support a broader role catalog cleanly.',
  },
  {
    question: 'Is dark mode included in the redesign?',
    answer:
      'Yes. The public site, auth experience, and workspace surfaces all inherit the shared theme system so the product feels consistent in either mode.',
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <div className="theme-chip">{eyebrow}</div>
      <h2 className="mt-5 text-balance font-['Sora'] text-2xl font-semibold leading-tight tracking-tight text-[color:var(--text-main)] sm:text-3xl lg:text-[2.35rem]">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[color:var(--text-soft)]">{description}</p>
    </div>
  );
}

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="marketing-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[color:var(--text-main)]">{question}</span>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] text-[color:var(--text-main)]">
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </span>
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-70'}`}>
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-7 text-[color:var(--text-soft)] sm:px-6 sm:text-base">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const loadPaths = async () => {
      try {
        const res = await getCareerPaths();
        setPaths(res.data);
      } catch {
        setPaths([]);
      } finally {
        setLoading(false);
      }
    };

    void loadPaths();
  }, []);

  const stats = useMemo(() => {
    const totalSkills = paths.reduce((sum, path) => sum + (path.roadmap?.length || 0), 0);
    const months =
      paths.length > 0
        ? Math.round(paths.reduce((sum, path) => sum + (path.estimatedMonths || 0), 0) / paths.length)
        : 6;

    return {
      careerPaths: paths.length || 10,
      domains: new Set(paths.map(path => path.domain)).size || 4,
      totalSkills: totalSkills || 100,
      averageMonths: months || 6,
    };
  }, [paths]);

  const featuredPaths = paths.slice(0, 3);
  const primaryCta = user ? '/workspace' : '/auth';

  return (
    <div className="landing-page min-h-screen">
      <MarketingNavbar />

      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-24 lg:pt-6">
          <div className="mx-auto grid max-w-7xl items-stretch gap-8 lg:grid-cols-[1.02fr_0.98fr]">
            <Reveal className="relative h-full">
              <div className="hero-panel relative h-full overflow-hidden rounded-[28px] p-6 sm:p-8 lg:p-10">
                <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)]" />
                <div className="theme-chip">Career readiness intelligence</div>
                <h1 className="mt-6 max-w-3xl text-balance font-['Sora'] text-4xl font-semibold leading-[1.08] tracking-tight text-[color:var(--text-main)] sm:text-5xl lg:text-[3.45rem] xl:text-[3.75rem]">
                  Turn role ambiguity into a product-grade readiness plan.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--text-soft)] sm:text-[1.05rem]">
                  CareerLab helps learners, coaches, and talent teams map current capability against real career paths,
                  surface the gaps that matter, and move forward with a more confident plan.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link to={primaryCta} className="btn-primary">
                    Get Started
                  </Link>
                  <a href="#pricing" className="btn-secondary text-center">
                    Book Demo
                  </a>
                  <Link to={user ? '/career-paths' : '/auth'} className="btn-ghost text-center">
                    Try Now
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: 'Career paths', value: stats.careerPaths, suffix: '+' },
                    { label: 'Domains covered', value: stats.domains, suffix: '' },
                    { label: 'Skills mapped', value: stats.totalSkills, suffix: '+' },
                    { label: 'Avg plan horizon', value: stats.averageMonths, suffix: ' mo' },
                  ].map(item => (
                    <div key={item.label} className="stat-shell flex min-h-[112px] flex-col justify-between">
                      <div className="text-[11px] font-semibold uppercase leading-5 tracking-[0.16em] text-[color:var(--text-muted)]">
                        {item.label}
                      </div>
                      <AnimatedCounter
                        value={item.value}
                        suffix={item.suffix}
                        className="mt-3 block text-[2rem] font-semibold leading-none tracking-tight text-[color:var(--text-main)]"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {audienceBadges.map(item => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-4 py-2 text-sm text-[color:var(--text-soft)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal className="h-full" delay={120}>
              <div className="relative h-full">
                <div className="marketing-card relative flex h-full flex-col overflow-hidden rounded-[28px] p-5 sm:p-6 lg:p-7">
                  <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,77,77,0.12),transparent)]" />
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-[color:var(--text-muted)]">
                          Live product preview
                        </div>
                        <div className="mt-2 max-w-3xl text-xl font-semibold leading-tight tracking-tight text-[color:var(--text-main)] sm:text-2xl">
                          One workspace for discovery, analysis, and next-step planning
                        </div>
                      </div>
                      <div className="shrink-0 rounded-full border border-emerald-500/18 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Readiness model active
                      </div>
                    </div>

                    <div className="mt-6 grid flex-1 gap-4 lg:grid-cols-[0.78fr_1.22fr]">
                      <div className="premium-panel flex h-full min-w-0 flex-col p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] uppercase leading-5 tracking-[0.18em] text-[color:var(--text-muted)]">Readiness summary</div>
                            <div className="mt-2 text-lg font-semibold leading-snug text-[color:var(--text-main)]">AI/ML Engineer</div>
                          </div>
                          <div className="shrink-0 rounded-full bg-[color:var(--brand-strong)] px-4 py-2 text-sm font-semibold text-white">
                            78%
                          </div>
                        </div>

                        <div className="mt-5 space-y-4">
                          {[
                            { label: 'Foundational coverage', value: '88%' },
                            { label: 'Core capability depth', value: '76%' },
                            { label: 'Advanced readiness', value: '63%' },
                          ].map(item => (
                            <div key={item.label}>
                              <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="min-w-0 leading-5 text-[color:var(--text-soft)]">{item.label}</span>
                                <span className="shrink-0 font-semibold text-[color:var(--text-main)]">{item.value}</span>
                              </div>
                              <div className="mt-2 h-2.5 rounded-full bg-[color:var(--surface-muted)]">
                                <div
                                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-strong),var(--brand-accent))]"
                                  style={{ width: item.value }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 grid gap-2">
                          {[
                            'Missing MLOps deployment experience',
                            'Prioritize model monitoring and data pipelines',
                            'Estimated timeline to improve: 8 weeks',
                            'Recent assessment saved automatically',
                          ].map(item => (
                            <div
                              key={item}
                              className="flex min-h-[58px] items-center rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--text-soft)]"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-col gap-4">
                        <div className="premium-panel p-5">
                          <div className="text-[11px] uppercase leading-5 tracking-[0.18em] text-[color:var(--text-muted)]">Role pipeline</div>
                          <div className="mt-4 space-y-3">
                            {(featuredPaths.length
                              ? featuredPaths
                              : [
                                  { _id: '1', name: 'Frontend Developer', domain: 'Software/IT', icon: 'FE' },
                                  { _id: '2', name: 'Data Scientist', domain: 'Software/IT', icon: 'DS' },
                                  { _id: '3', name: 'Civil Engineer', domain: 'Core Engineering', icon: 'CE' },
                                ]
                            ).map(path => (
                              <div
                                key={path._id}
                                className="flex min-h-[76px] items-center justify-between gap-3 rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-4 py-3"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <LogoBadge
                                    label={path.icon || path.name.slice(0, 2)}
                                    className="h-11 w-11 rounded-[14px] bg-[color:var(--surface-muted)] text-[10px] text-[color:var(--text-main)]"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold leading-snug text-[color:var(--text-main)]">{path.name}</div>
                                    <div className="mt-0.5 text-xs text-[color:var(--text-muted)]">{path.domain}</div>
                                  </div>
                                </div>
                                <span className="shrink-0 rounded-full border border-[color:var(--border-soft)] px-3 py-1 text-xs font-medium text-[color:var(--text-soft)]">
                                  Ready
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="premium-dark-panel flex flex-1 flex-col p-5">
                          <div className="text-[11px] uppercase leading-5 tracking-[0.18em] text-white/58">Executive summary</div>
                          <div className="mt-3 text-xl font-semibold leading-tight text-white sm:text-2xl">Move from vague ambition to measurable role progression.</div>
                          <p className="mt-3 text-sm leading-7 text-white/72">
                            The redesign brings together higher-conviction copy, stronger product framing, and a cleaner
                            buying path for both end users and enterprise stakeholders.
                          </p>
                          <div className="mt-auto grid grid-cols-3 gap-3 pt-5">
                            {[
                              { label: 'Actions', value: '12' },
                              { label: 'Signals', value: '4' },
                              { label: 'Views', value: '1' },
                            ].map(item => (
                              <div key={item.label} className="flex min-h-[88px] flex-col justify-center rounded-lg border border-white/10 bg-white/6 px-3 py-4 text-center">
                                <div className="text-2xl font-semibold leading-none text-white">{item.value}</div>
                                <div className="mt-2 text-[10px] uppercase leading-4 tracking-[0.12em] text-white/48">{item.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="platform" className="scroll-mt-28 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                eyebrow="Platform"
                title="Built like a serious software product, not a one-page assessment gimmick."
                description="Every section is designed to communicate confidence: clear product value, structured workflow, premium visual hierarchy, and enough detail to satisfy both customers and investors."
              />
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {platformPillars.map((item, index) => (
                <Reveal key={item.title} delay={index * 90}>
                  <div className="marketing-card flex h-full min-w-0 flex-col p-6">
                    <LogoBadge
                      label={item.icon}
                      className="h-12 w-12 rounded-[16px] bg-[color:var(--surface-muted)] text-[10px] text-[color:var(--text-main)]"
                    />
                    <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-[color:var(--text-main)]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--text-soft)]">{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="marketing-card h-full p-6 sm:p-8">
                <SectionHeading
                  eyebrow="Workflow"
                  title="A simpler path from self-assessment to focused improvement."
                  description="The product flow is intentionally compact. A learner can arrive, pick a role, mark capability depth, and leave with a more defensible plan in minutes."
                />

                <div className="mt-8 space-y-4">
                  {workflow.map(item => (
                    <div key={item.step} className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-5">
                      <div className="text-[11px] font-semibold uppercase leading-5 tracking-[0.18em] text-[color:var(--brand-strong)]">
                        Step {item.step}
                      </div>
                      <div className="mt-2 text-lg font-semibold leading-snug text-[color:var(--text-main)]">{item.title}</div>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="marketing-card h-full overflow-hidden p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-[color:var(--text-muted)]">
                      Featured tracks
                    </div>
                    <div className="mt-2 max-w-2xl text-xl font-semibold leading-tight tracking-tight text-[color:var(--text-main)] sm:text-2xl">
                      Premium discovery cards for the first decision that matters
                    </div>
                  </div>
                  <Link to={user ? '/career-paths' : '/auth'} className="btn-ghost">
                    Explore Library
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {loading
                    ? [...Array(3)].map((_, index) => (
                        <div key={index} className="premium-panel animate-pulse p-5">
                          <div className="h-12 w-12 rounded-[14px] bg-[color:var(--surface-muted)]" />
                          <div className="mt-5 h-5 w-2/3 rounded-full bg-[color:var(--surface-muted)]" />
                          <div className="mt-3 h-4 w-full rounded-full bg-[color:var(--surface-muted)]" />
                          <div className="mt-2 h-4 w-5/6 rounded-full bg-[color:var(--surface-muted)]" />
                          <div className="mt-5 h-10 rounded-[16px] bg-[color:var(--surface-muted)]" />
                        </div>
                      ))
                    : (featuredPaths.length
                        ? featuredPaths
                        : [
                            {
                              _id: 'fe',
                              name: 'Frontend Developer',
                              domain: 'Software/IT',
                              description: 'Craft responsive interfaces, component systems, and polished user flows.',
                              tags: ['React', 'Design systems', 'Performance'],
                              icon: 'FE',
                            },
                            {
                              _id: 'ml',
                              name: 'AI/ML Engineer',
                              domain: 'Software/IT',
                              description: 'Build data pipelines, models, and deployment workflows with production awareness.',
                              tags: ['Python', 'MLOps', 'Data'],
                              icon: 'ML',
                            },
                            {
                              _id: 'ce',
                              name: 'Civil Engineer',
                              domain: 'Core Engineering',
                              description: 'Map structural, planning, and project delivery skills into a clearer progression.',
                              tags: ['Planning', 'Structures', 'Field skills'],
                              icon: 'CE',
                            },
                          ]
                      ).map(path => (
                        <div key={path._id} className="premium-panel flex h-full min-w-0 flex-col p-5">
                          <div className="flex items-center justify-between gap-3">
                            <LogoBadge
                              label={path.icon || path.name.slice(0, 2)}
                              className="h-12 w-12 rounded-[16px] bg-[color:var(--surface-muted)] text-[10px] text-[color:var(--text-main)]"
                            />
                            <span className="max-w-[9rem] rounded-full border border-[color:var(--border-soft)] px-3 py-1.5 text-xs font-medium leading-4 text-[color:var(--text-soft)]">
                              {path.domain}
                            </span>
                          </div>
                          <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-[color:var(--text-main)]">{path.name}</h3>
                          <p className="mt-3 flex-1 text-sm leading-6 text-[color:var(--text-soft)]">{path.description}</p>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {path.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs leading-4 text-[color:var(--text-muted)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="results" className="scroll-mt-28 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                eyebrow="Results"
                title="Position the product as trustworthy to buyers and useful to actual users."
                description="This redesign balances conversion and clarity. The marketing story is sharper, while the product preview still feels grounded in a real assessment workflow."
                align="center"
              />
            </Reveal>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {testimonialCards.map((item, index) => (
                <Reveal key={item.name} delay={index * 90}>
                  <div className="marketing-card h-full p-6">
                    <div className="text-4xl leading-none text-[color:var(--brand-strong)]">"</div>
                    <p className="mt-4 text-base leading-7 text-[color:var(--text-soft)]">{item.quote}</p>
                    <div className="mt-6">
                      <div className="text-base font-semibold text-[color:var(--text-main)]">{item.name}</div>
                      <div className="text-sm text-[color:var(--text-muted)]">{item.role}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div className="mt-10 grid gap-4 lg:grid-cols-4">
                {[
                  { label: 'Product story', value: 'Clear' },
                  { label: 'Buyer confidence', value: 'Higher' },
                  { label: 'First-click friction', value: 'Lower' },
                  { label: 'Enterprise posture', value: 'Stronger' },
                ].map(item => (
                  <div key={item.label} className="premium-panel p-5 text-center">
                    <div className="text-[11px] uppercase leading-5 tracking-[0.16em] text-[color:var(--text-muted)]">{item.label}</div>
                    <div className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--text-main)] sm:text-3xl">{item.value}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-28 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                eyebrow="Pricing"
                title="Pricing architecture that feels credible in a real SaaS buying motion."
                description="The section is structured to support trial conversion, team expansion, and enterprise conversations without breaking the premium visual tone of the site."
                align="center"
              />
            </Reveal>

            <div className="mt-10 grid gap-4 xl:grid-cols-3">
              {planCards.map((plan, index) => (
                <Reveal key={plan.name} delay={index * 90}>
                  <div className={`marketing-card h-full p-6 ${plan.highlight ? 'ring-1 ring-[color:var(--brand-strong)]' : ''}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-[color:var(--text-muted)]">
                          {plan.name}
                        </div>
                        <div className="mt-4 flex items-end gap-1">
                          <span className="text-3xl font-semibold tracking-tight text-[color:var(--text-main)] sm:text-4xl">{plan.price}</span>
                          {plan.cadence && <span className="pb-1 text-sm text-[color:var(--text-muted)]">{plan.cadence}</span>}
                        </div>
                      </div>
                      {plan.highlight && (
                        <span className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1.5 text-[11px] font-semibold uppercase leading-4 tracking-[0.14em] text-[color:var(--brand-strong)]">
                          Most popular
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-sm leading-6 text-[color:var(--text-soft)]">{plan.description}</p>

                    <Link to={primaryCta} className={`mt-6 ${plan.highlight ? 'btn-primary' : 'btn-secondary'} w-full justify-center`}>
                      {plan.cta}
                    </Link>

                    <div className="mt-6 space-y-3">
                      {plan.features.map(item => (
                        <div key={item} className="flex items-start gap-3 text-sm leading-6 text-[color:var(--text-soft)]">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]">
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="m5 13 4 4L19 7" />
                            </svg>
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-28 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <SectionHeading
                eyebrow="FAQ"
                title="Answer the buying and adoption questions before they slow anyone down."
                description="A premium enterprise site should reduce uncertainty early. This section is designed to address adoption, fit, product depth, and implementation expectations with less friction."
                align="center"
              />
            </Reveal>

            <div className="mt-10 space-y-4">
              {faqs.map((faq, index) => (
                <Reveal key={faq.question} delay={index * 60}>
                  <FaqItem
                    question={faq.question}
                    answer={faq.answer}
                    open={openFaq === index}
                    onToggle={() => setOpenFaq(current => (current === index ? -1 : index))}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="marketing-card overflow-hidden rounded-[32px] p-6 sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <LogoBadge label="CL" className="h-12 w-12 rounded-[16px] bg-[color:var(--brand-strong)] text-[10px] text-white" />
                    <div>
                      <div className="font-['Sora'] text-xl font-semibold tracking-tight text-[color:var(--text-main)]">CareerLab</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Premium readiness platform</div>
                    </div>
                  </div>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--text-soft)] sm:text-base">
                    CareerLab helps people and teams evaluate role readiness with more precision, better product design,
                    and a workflow that feels investor-ready from the first screen onward.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to={primaryCta} className="btn-primary">
                      Open Product
                    </Link>
                    <Link to="/auth" className="btn-secondary">
                      Sign In
                    </Link>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  {[
                    {
                      title: 'Platform',
                      links: [
                        { label: 'Product Overview', href: '#platform' },
                        { label: 'Results', href: '#results' },
                        { label: 'Pricing', href: '#pricing' },
                      ],
                    },
                    {
                      title: 'Workspace',
                      links: [
                        { label: 'Career Paths', href: user ? '/career-paths' : '/auth' },
                        { label: 'Roadmaps', href: user ? '/roadmaps' : '/auth' },
                        { label: 'Dashboard', href: user ? '/dashboard' : '/auth' },
                      ],
                    },
                    {
                      title: 'Company',
                      links: [
                        { label: 'FAQ', href: '#faq' },
                        { label: 'Get Started', href: primaryCta },
                        { label: 'Log In', href: '/auth' },
                      ],
                    },
                  ].map(group => (
                    <div key={group.title}>
                      <div className="text-xs font-semibold uppercase leading-5 tracking-[0.16em] text-[color:var(--text-muted)]">{group.title}</div>
                      <div className="mt-4 space-y-3">
                        {group.links.map(link => (
                          link.href.startsWith('#') ? (
                            <a key={link.label} href={link.href} className="block text-sm text-[color:var(--text-soft)] transition hover:text-[color:var(--text-main)]">
                              {link.label}
                            </a>
                          ) : (
                            <Link key={link.label} to={link.href} className="block text-sm text-[color:var(--text-soft)] transition hover:text-[color:var(--text-main)]">
                              {link.label}
                            </Link>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-[color:var(--border-soft)] pt-6 text-sm text-[color:var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
                <div>Copyright {new Date().getFullYear()} CareerLab. All rights reserved.</div>
                <div>Designed for confident role discovery, sharper assessment, and cleaner decision-making.</div>
              </div>
            </div>
          </Reveal>
        </div>
      </footer>
    </div>
  );
}
