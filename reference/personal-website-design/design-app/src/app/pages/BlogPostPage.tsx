import { blogPosts } from '../data/blog';

interface BlogPostPageProps {
  slug: string;
}

export function BlogPostPage({ slug }: BlogPostPageProps) {
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-['Playfair_Display'] text-4xl text-gray-900 mb-4">Post Not Found</h1>
          <a href="/blog" className="font-['Inter'] text-gray-600 hover:text-gray-900 underline">
            Back to Writing
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#faf9f7] pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <a href="/blog" className="inline-flex items-center gap-2 font-['Inter'] text-gray-600 hover:text-gray-900 mb-8 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 10H5M5 10L10 15M5 10L10 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Writing
          </a>

          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-['Inter'] text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl text-gray-900 mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 font-['Inter'] text-gray-600">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readingTime}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="py-16 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div 
            className="prose prose-lg max-w-none
              prose-headings:font-['Playfair_Display']
              prose-h1:text-4xl prose-h1:mb-6
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:font-['Inter'] prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-gray-900 prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:font-['Inter'] prose-ul:text-gray-600
              prose-li:mb-2
              prose-code:font-mono prose-code:text-sm"
          >
            {post.content.split('\n').map((paragraph, idx) => {
              // Handle headings
              if (paragraph.startsWith('# ')) {
                return <h1 key={idx}>{paragraph.replace('# ', '')}</h1>;
              }
              if (paragraph.startsWith('## ')) {
                return <h2 key={idx}>{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={idx}>{paragraph.replace('### ', '')}</h3>;
              }
              
              // Handle bold text
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <h4 key={idx} className="font-['Inter'] font-semibold text-gray-900 mt-6 mb-2">{paragraph.replace(/\*\*/g, '')}</h4>;
              }
              
              // Handle list items
              if (paragraph.startsWith('- ')) {
                return <li key={idx}>{paragraph.replace('- ', '')}</li>;
              }
              
              // Handle horizontal rules
              if (paragraph === '---') {
                return <hr key={idx} className="my-12 border-gray-200" />;
              }
              
              // Handle emphasis (italic)
              if (paragraph.startsWith('*') && paragraph.endsWith('*') && !paragraph.startsWith('**')) {
                return <p key={idx} className="italic text-gray-500">{paragraph.replace(/\*/g, '')}</p>;
              }
              
              // Handle checkmarks and x-marks
              if (paragraph.includes('✅') || paragraph.includes('❌')) {
                return <p key={idx}>{paragraph}</p>;
              }
              
              // Regular paragraphs
              if (paragraph.trim()) {
                return <p key={idx}>{paragraph}</p>;
              }
              
              return null;
            })}
          </div>

          {/* Author CTA */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="font-['Playfair_Display'] text-2xl text-gray-900 mb-3">
                Want to discuss this topic?
              </h3>
              <p className="font-['Inter'] text-gray-600 mb-6">
                I'm always happy to chat about healthcare product management, AI in healthcare, or building products that matter.
              </p>
              <a
                href="mailto:ps324@byu.edu"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-['Inter']"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
