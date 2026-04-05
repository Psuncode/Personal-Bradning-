import { blogPosts } from '../data/blog';

export function BlogPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl text-gray-900 mb-4">
            Writing
          </h1>
          <p className="font-['Inter'] text-xl text-gray-600 max-w-2xl">
            Thoughts on product management, healthcare technology, and building products that matter.
          </p>
        </div>

        <div className="space-y-8">
          {blogPosts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-900 hover:shadow-lg transition-all"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-['Inter'] text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-gray-900 mb-3 group-hover:text-gray-600 transition-colors">
                {post.title}
              </h2>

              <p className="font-['Inter'] text-lg text-gray-600 leading-relaxed mb-4">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-4 font-['Inter'] text-sm text-gray-500">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readingTime}</span>
              </div>

              <div className="flex items-center gap-2 font-['Inter'] text-gray-900 pt-4">
                Read article
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 10H15M15 10L10 5M15 10L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
