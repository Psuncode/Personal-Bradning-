# Portfolio Content Template Guide

This guide shows you exactly how to add new projects, blog posts, and update content across your portfolio.

---

## 📁 File Structure

```
/src/app/data/
  ├── projects.ts    → All project data
  └── blog.ts        → All blog post data
```

---

## 🚀 Adding a New Project

Open `/src/app/data/projects.ts` and add a new object to the `projectsData` array:

### Template

```typescript
{
  slug: "your-project-slug",  // URL-friendly name (lowercase, hyphens)
  title: "Your Project Title",
  subtitle: "Project Category/Type",
  category: "Category Badge",  // Shows on project card
  tags: ["Tag1", "Tag2", "Tag3", "Tag4"],
  shortDescription: "Brief one-line description for project cards.",
  
  metrics: [
    { value: "100K+", label: "Users" },
    { value: "50%", label: "Growth" },
    { value: "4.8/5", label: "Rating" },
    { value: "6 months", label: "Timeline" }
  ],
  
  problem: "Detailed description of the problem you were solving. This appears on the detail page under 'The Challenge' section.",
  
  role: "Your Role Title (e.g., 'Product Manager & Strategy Lead')",
  
  approach: "Detailed description of your approach and methodology. This appears under 'My Approach' on the detail page. Describe what you did, how you worked with teams, and the process you followed.",
  
  outcomes: [
    "First specific outcome with metrics",
    "Second outcome with clear impact",
    "Third measurable result",
    "Fourth achievement",
    "Fifth success metric",
    "Sixth accomplishment or partnership"
  ],
  
  techStack: ["Tech1", "Tech2", "Tech3", "Tech4", "Tech5"],
  
  image: "https://your-image-url.com/image.jpg"
}
```

### Real Example

```typescript
{
  slug: "telehealth-platform",
  title: "Telehealth Platform Redesign",
  subtitle: "Healthcare Technology",
  category: "Product Strategy",
  tags: ["Healthcare", "UX Design", "Product Strategy", "Growth"],
  shortDescription: "Redesigned telehealth platform serving 50K+ patients across rural communities.",
  
  metrics: [
    { value: "50K+", label: "Active Patients" },
    { value: "85%", label: "User Satisfaction" },
    { value: "40%", label: "Reduced Wait Times" },
    { value: "9 months", label: "Project Duration" }
  ],
  
  problem: "Rural patients lacked access to specialist care due to geographic barriers. Existing telehealth platforms had poor adoption due to complex interfaces and connectivity issues in low-bandwidth areas.",
  
  role: "Lead Product Manager",
  
  approach: "Led comprehensive user research across 15 rural clinics to understand patient and provider needs. Redesigned the platform with offline-first capabilities and simplified workflows. Worked with engineering to optimize for 2G/3G networks. Conducted usability testing with elderly patients and trained clinic staff on the new system.",
  
  outcomes: [
    "Achieved 50,000+ active patients across 75 rural clinics",
    "Improved patient satisfaction from 62% to 85%",
    "Reduced average consultation wait time by 40%",
    "Enabled offline scheduling and note-taking for low-connectivity areas",
    "Increased provider utilization by 65%",
    "Won American Medical Association Innovation Award"
  ],
  
  techStack: ["React", "React Native", "Node.js", "PostgreSQL", "AWS", "WebRTC"],
  
  image: "https://images.unsplash.com/photo-example.jpg"
}
```

---

## ✍️ Adding a Blog Post

Open `/src/app/data/blog.ts` and add a new object to the `blogPosts` array:

### Template

```typescript
{
  slug: "your-blog-post-slug",
  title: "Your Blog Post Title",
  date: "2026-03-15",  // Format: YYYY-MM-DD
  readingTime: "5 min read",
  tags: ["Tag1", "Tag2", "Tag3"],
  excerpt: "A compelling 1-2 sentence summary that appears on the blog listing page.",
  
  content: `
# Your Blog Post Title

Your opening paragraph that hooks the reader.

## First Section Heading

Regular paragraph text goes here. You can write multiple paragraphs.

Another paragraph with more content.

## Second Section Heading

### Subsection

More content here.

**Bold subheadings work like this:**

Use double asterisks for bold text that becomes a subheading.

## Lists

You can create lists:

- First bullet point
- Second bullet point
- Third bullet point

## Key Takeaways

1. Numbered list item one
2. Numbered list item two
3. Numbered list item three

---

*Italicized closing thought or call-to-action goes here in asterisks.*

*Connect with me at your-email@example.com.*
  `
}
```

### Formatting Guide for Blog Content

```typescript
content: `
# Main Title (H1)

## Section Heading (H2)

### Subsection Heading (H3)

Regular paragraph text.

**Bold Subheading:** (renders as H4)
Text that follows bold subheadings.

- Bullet point (starts with dash)
- Another bullet point
- Third bullet point

---  (Horizontal rule/divider)

*Italic text in asterisks*

**Bold text in double asterisks**

✅ Use checkmarks and emojis directly
❌ They render as-is

[Link text](https://url.com) - Links work too
`
```

---

## 🎨 Updating Homepage Featured Projects

The homepage shows **2 featured projects** by default. To change which projects appear:

1. Open `/src/app/components/CaseStudies.tsx`
2. Find the `caseStudies` array
3. Edit the two objects there (they're simplified versions)
4. Match the `title`, `subtitle`, and `tags` to your full project data

Example:
```typescript
const caseStudies = [
  {
    title: "Your Featured Project",  // Must match exactly
    subtitle: "Category",
    // ... other simplified fields
  }
];
```

---

## 📊 Quick Reference: Data Locations

| Content Type | File Location | What It Does |
|--------------|---------------|--------------|
| **Full Project Data** | `/src/app/data/projects.ts` | Powers `/projects` page and detail pages |
| **Featured Projects** | `/src/app/components/CaseStudies.tsx` | Shows 2 projects on homepage |
| **Blog Posts** | `/src/app/data/blog.ts` | Powers `/blog` page and post pages |
| **Content Grid** | `/src/app/components/ContentGrid.tsx` | Side projects/photos on homepage |

---

## 🔧 Step-by-Step: Adding Your First Project

1. **Choose a slug**: `my-new-project` (lowercase, hyphens only)

2. **Copy the template** from above

3. **Fill in all fields**:
   - Title and descriptions
   - 4 key metrics
   - Problem, role, approach
   - 4-6 outcomes
   - 3-5 tech stack items
   - Image URL

4. **Open** `/src/app/data/projects.ts`

5. **Add your project object** to the `projectsData` array:
   ```typescript
   export const projectsData = [
     { /* Existing project 1 */ },
     { /* Existing project 2 */ },
     { /* Existing project 3 */ },
     { /* YOUR NEW PROJECT HERE */ },
   ];
   ```

6. **Save the file**

7. **Test it**:
   - Go to `/projects` → You should see your new project card
   - Click it → Detail page should load with all your content

---

## 🖼️ Image Guidelines

**Where to get images:**
- Unsplash (free): https://unsplash.com
- Your own screenshots/mockups
- Project photos

**Format:**
```typescript
image: "https://images.unsplash.com/photo-XXXXX?parameters"
```

**Recommended search terms:**
- "product design"
- "healthcare technology"
- "medical equipment"
- "modern office"
- "data dashboard"

---

## ✅ Checklist Before Submitting

- [ ] Project slug is lowercase with hyphens only
- [ ] All required fields are filled
- [ ] 4 metrics are defined
- [ ] Problem statement is clear and detailed
- [ ] Approach describes your process
- [ ] 4-6 specific outcomes with metrics
- [ ] Tags are relevant (3-5 tags)
- [ ] Image URL is valid and loads
- [ ] No syntax errors (commas, brackets, quotes)

---

## 🐛 Common Mistakes

❌ **Forgetting a comma between objects:**
```typescript
{ project1 }  // Missing comma!
{ project2 }
```

✅ **Correct:**
```typescript
{ project1 },
{ project2 }
```

---

❌ **Wrong slug format:**
```typescript
slug: "My New Project"  // Has spaces and capitals
```

✅ **Correct:**
```typescript
slug: "my-new-project"
```

---

❌ **Missing required fields:**
```typescript
{
  slug: "project",
  title: "Project"
  // Missing everything else!
}
```

✅ **Use the full template above**

---

## 📞 Need Help?

If something isn't working:
1. Check browser console for error messages
2. Verify all commas and brackets are balanced
3. Make sure quotes around strings are closed
4. Compare your new entry to existing ones

---

## 🎯 Quick Copy-Paste Template

```typescript
{
  slug: "project-name",
  title: "Project Title",
  subtitle: "Project Type",
  category: "Category",
  tags: ["Tag1", "Tag2", "Tag3"],
  shortDescription: "One-line description.",
  metrics: [
    { value: "X", label: "Metric 1" },
    { value: "Y%", label: "Metric 2" },
    { value: "Z", label: "Metric 3" },
    { value: "N months", label: "Timeline" }
  ],
  problem: "Problem description here.",
  role: "Your Role",
  approach: "Your approach description here.",
  outcomes: [
    "Outcome 1",
    "Outcome 2",
    "Outcome 3",
    "Outcome 4"
  ],
  techStack: ["Tech1", "Tech2", "Tech3"],
  image: "https://your-image-url.jpg"
},
```

Just copy this, fill it in, and add it to `/src/app/data/projects.ts`!
