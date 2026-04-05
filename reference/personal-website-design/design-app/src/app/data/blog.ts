export const blogPosts = [
  {
    slug: "healthcare-pm-different",
    title: "Why Healthcare PM is Different",
    date: "2026-02-15",
    readingTime: "6 min read",
    tags: ["Product Management", "Healthcare", "MedTech"],
    excerpt: "Building health products isn't just about moving fast—it's about getting it right. Here's what I learned managing healthcare products across three continents.",
    content: `
# Why Healthcare PM is Different

Building health products isn't just about moving fast—it's about getting it right. After managing healthcare products across three continents, I've learned that healthcare PM requires a fundamentally different approach than consumer tech.

## The Stakes Are Higher

In consumer tech, a bug might frustrate users. In healthcare, it could harm patients. This reality changes everything about how we approach product development.

When I was working on the Inara Health progesterone monitoring system, we discovered a calibration issue during field testing. In a consumer app, we might have pushed a quick fix and monitored metrics. Instead, we pulled the devices, recalibrated with clinical oversight, and re-validated across our entire pilot cohort. It delayed our launch by three weeks, but it was the right call.

## Regulatory Complexity

Healthcare products operate in a heavily regulated environment—and for good reason. FDA approvals, HIPAA compliance, CE marking, and local regulations vary by country and product type.

During the Nursa AI TB project, we spent as much time on regulatory strategy as we did on product development. We had to:
- Define our regulatory pathway (FDA breakthrough device designation)
- Establish clinical validation protocols
- Document every algorithm decision point
- Create audit trails for model training and deployment

The lesson: Bring regulatory expertise into your product team early. They're not blockers—they're guides through a complex landscape.

## User Research is Clinical Research

Healthcare user research requires clinical protocols, IRB approvals, and often informed consent. You can't just "move fast and break things" when your users are patients.

For the LDS Church health features, we conducted studies across diverse user groups—from elderly members managing chronic conditions to young families tracking wellness. Each study required:
- IRB approval for research involving human subjects
- Informed consent processes
- Data privacy protections beyond standard tech requirements
- Clinical advisors to interpret health-related findings

## The Multi-Stakeholder Challenge

Healthcare products serve multiple constituencies with different needs:
- Patients want simple, accessible tools
- Clinicians need clinical-grade accuracy and workflow integration
- Administrators care about costs and outcomes
- Regulators require safety and efficacy evidence
- Payers want proof of value

Your product needs to satisfy all of them. This makes prioritization incredibly complex. I've learned to map features to stakeholder needs explicitly and ensure every major initiative serves multiple constituencies.

## Evidence-Based Everything

In healthcare, you need evidence for everything. Not just usage metrics, but clinical evidence of safety and efficacy.

For the TB detection AI, we couldn't just say "it works well." We needed:
- Sensitivity and specificity metrics
- Validation across diverse patient populations
- Comparison to gold standard diagnostics
- Evidence of clinical utility in real-world settings
- Publication in peer-reviewed journals

## The Reward

Despite these challenges—or perhaps because of them—healthcare PM is incredibly rewarding. When your product helps detect disease early, improves access to care, or reduces maternal mortality, the impact is tangible and profound.

The constraints of healthcare PM don't stifle innovation—they channel it toward solutions that truly improve lives.

---

*What aspects of healthcare PM would you like to hear more about? Connect with me on LinkedIn or email me at ps324@byu.edu.*
    `
  },
  {
    slug: "product-medical-divide",
    title: "Bridging the Product-Medical Divide",
    date: "2026-01-28",
    readingTime: "5 min read",
    tags: ["Product Management", "Healthcare", "Collaboration"],
    excerpt: "Doctors and PMs speak different languages. Here's how I learned to bridge the gap in healthcare product development.",
    content: `
# Bridging the Product-Medical Divide

"That's not how medicine works."

I heard that phrase a lot in my first few months managing healthcare products. Doctors and product managers speak different languages, value different things, and approach problems from different angles.

Here's what I learned about bridging that divide.

## Different Mental Models

**Product Managers think in:**
- User stories and personas
- MVPs and iterations
- Metrics and KPIs
- A/B tests and optimization

**Clinicians think in:**
- Differential diagnoses
- Evidence-based protocols
- Patient safety and outcomes
- Clinical guidelines and standards

Neither is wrong—they're just different frameworks for solving problems.

## The Translation Layer

I've found success by developing a "translation layer" between these worldviews:

### 1. Speak Their Language
Instead of "user journey," I say "clinical workflow." Instead of "feature," I say "intervention." Instead of "engagement metrics," I say "adherence rates."

When presenting the TB detection AI to radiologists, I didn't lead with accuracy metrics. I led with "How does this fit into your reading workflow?" and "How do we handle disagreements between the AI and your assessment?"

### 2. Invite Them Into Your Process
Clinicians often feel like they're consulted too late—after key decisions are made. I now involve clinical advisors from day one:
- In discovery, not just validation
- In prioritization, not just requirements
- In design sprints, not just design review

For Inara Health, our lead obstetrician joined weekly product meetings. She helped us understand not just what features to build, but why certain workflows matter and what's at stake when we get it wrong.

### 3. Learn Their Work
I spent two weeks shadowing clinicians in the field before finalizing the Inara Health product strategy. I watched prenatal visits, observed lab workflows, and saw firsthand where our solution would fit (or not fit) into real clinical practice.

That experience revealed assumptions we'd made in conference rooms that didn't survive contact with reality.

## The Trust Factor

Clinicians have seen too many tech companies promise healthcare innovation without understanding healthcare. You need to earn trust:

### Show You've Done Your Homework
- Understand the clinical literature
- Know the relevant guidelines and standards
- Use correct medical terminology
- Acknowledge what you don't know

### Demonstrate Clinical Rigor
- Validate your assumptions with evidence
- Design proper clinical studies
- Be transparent about limitations
- Prioritize patient safety above all

### Respect Clinical Judgment
Your AI model might be 92% accurate, but the clinician has context you can't capture: patient history, symptoms, physical exam findings. Your product should augment clinical judgment, not replace it.

## The Framework I Use

Here's the framework I now use for every healthcare product decision:

1. **Clinical Need**: What clinical problem are we solving?
2. **Clinical Evidence**: What does the research say?
3. **Clinical Workflow**: How does this fit into practice?
4. **Clinical Validation**: How do we prove it works?
5. **Clinical Adoption**: How do we get clinicians to use it?

Only after answering those five questions do I think about business metrics, go-to-market strategy, or technical architecture.

## The Payoff

When you successfully bridge the product-medical divide, magic happens:
- Clinicians become your biggest advocates
- Your product actually gets adopted
- You build solutions that improve patient outcomes
- You earn credibility in a skeptical industry

The divide is real, but it's not insurmountable. It just requires humility, curiosity, and a genuine commitment to understanding clinical practice.

---

*Working on a healthcare product? I'd love to compare notes. Reach out at ps324@byu.edu.*
    `
  },
  {
    slug: "ai-healthcare-product-thinking",
    title: "AI Needs Better Product Thinking",
    date: "2026-01-10",
    readingTime: "7 min read",
    tags: ["AI/ML", "Product Strategy", "Healthcare"],
    excerpt: "Most AI healthcare projects fail not because of bad algorithms, but because of bad product thinking. Here's what we get wrong.",
    content: `
# AI in Healthcare Needs Better Product Thinking

After building an AI diagnostic tool that's now deployed in multiple countries, I've noticed a pattern: most AI healthcare projects fail not because of bad algorithms, but because of bad product thinking.

## The Algorithm-First Trap

Too many AI healthcare projects start with "We have this cool ML model" instead of "We have this important clinical problem."

The conversation goes like this:
- "Our model achieves 95% accuracy on ImageNet!"
- "Great, but does it work on the grainy X-rays from rural clinics with 10-year-old equipment?"
- "..."

When we started Nursa AI, we didn't begin with model architecture. We began with:
- What causes diagnostic delays in TB detection?
- What resources do clinics actually have?
- What workflows can these clinics realistically adopt?

The AI came later, designed to fit the reality on the ground.

## The Integration Problem

An AI model is not a product. It's a component of a product. The real work is integration:

### Clinical Workflow Integration
- Where in the workflow does the AI fit?
- How do clinicians review AI outputs?
- What happens when the AI and clinician disagree?
- How do you handle edge cases?

### Technical Integration
- How does it connect to existing PACS systems?
- What happens when connectivity is spotty?
- How do you version and update models safely?
- What's your fallback when the AI service is down?

### Operational Integration
- Who maintains the system?
- How do you monitor performance drift?
- What's the escalation path for errors?
- How do you continuously improve?

For the TB detection tool, the AI analysis was maybe 30% of the work. The other 70% was building the infrastructure for:
- Secure image upload from low-bandwidth environments
- Radiologist review workflows
- Quality assurance processes
- Training and support for clinic staff
- Reporting and outcome tracking

## The Validation Gap

Here's what's not sufficient for healthcare AI validation:
- ❌ "92% accuracy on our test set"
- ❌ "Better than baseline"
- ❌ "Published in a conference paper"

Here's what is:
- ✅ Validated on diverse populations across multiple sites
- ✅ Tested on the actual equipment used in target settings
- ✅ Compared to practicing clinicians in realistic conditions
- ✅ Measured on patient outcomes, not just technical metrics
- ✅ Evaluated for bias and failure modes
- ✅ Published in peer-reviewed clinical journals

We spent 8 months developing the TB detection model and 12 months validating it properly across 5 clinical sites.

## The "95% Accuracy" Myth

Stop obsessing over accuracy numbers without context. Ask:

### 95% accurate at what?
- Detecting any abnormality? (too broad)
- Detecting TB specifically? (more useful)
- Detecting active vs. latent TB? (very specific)
- Ruling out TB? (different use case)

### 95% accurate compared to what?
- Compared to expert radiologists? (high bar)
- Compared to general practitioners? (different bar)
- Compared to no screening? (low bar)

### 95% accurate on which patients?
- On your carefully curated research dataset?
- On the actual patient population you'll serve?
- On edge cases and rare presentations?

For Nursa AI, we report sensitivity, specificity, positive predictive value, and negative predictive value—stratified by patient population, disease severity, and image quality. Because that's what clinicians need to know.

## The Deployment Reality Check

Building the model is step one. Deployment is steps two through one hundred:

### Technical Deployment
- Model serving infrastructure
- Monitoring and alerting
- Version control and rollback
- Security and privacy
- Regulatory compliance

### Clinical Deployment
- Clinician training
- Workflow redesign
- Change management
- Performance monitoring
- Continuous validation

### Operational Deployment
- Support and maintenance
- Bug fixes and updates
- Outcome tracking
- Stakeholder communication

We launched the TB detection pilot in 3 clinics initially. It took 6 months of daily support, weekly feedback sessions, and constant iteration before we felt confident scaling to 5 more sites.

## What Good AI Healthcare Product Thinking Looks Like

Here's my framework now:

1. **Start with the clinical problem**
   - What's broken in current care delivery?
   - What are the barriers to better outcomes?
   - Where does AI actually add value?

2. **Understand the deployment context**
   - What's the actual clinical workflow?
   - What resources are available?
   - What are the constraints?

3. **Design for integration**
   - How does AI fit into existing systems?
   - What's the clinician experience?
   - What's the patient experience?

4. **Validate rigorously**
   - Real-world data, not just research datasets
   - Clinical outcomes, not just technical metrics
   - Diverse populations and settings

5. **Plan for operations**
   - Monitoring and maintenance
   - Continuous improvement
   - Long-term sustainability

## The Bottom Line

AI in healthcare isn't primarily an AI problem—it's a product problem. The algorithm is important, but it's just one piece.

The products that succeed are those built by teams who understand:
- Clinical practice
- Healthcare operations
- Regulatory requirements
- Implementation science
- Product management

*And who start with the problem, not the algorithm.*

---

*Building AI healthcare products? I'd love to exchange ideas. Connect at ps324@byu.edu.*
    `
  }
];
