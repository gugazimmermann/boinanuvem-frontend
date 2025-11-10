import { Section, Heading, Button, Badge, SVGPlaceholder } from "./ui";
import { BLOG_POSTS, COLORS } from "./constants";

export function Blog() {
  return (
    <Section
      id="section-blog"
      style={{
        background: `linear-gradient(180deg, white 0%, ${COLORS.bgLightSecondary} 20%, ${COLORS.bgLightTertiary} 50%, ${COLORS.bgLightSecondary} 80%, white 100%)`,
      }}
    >
      <div className="text-center mb-12">
        <Heading level={2} color="secondary" className="mb-4">
          <span style={{ color: COLORS.primary }}>Editor's</span> Desk
        </Heading>
        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
          Embrace Creativity with our Latest Designs & Expert Tips
          <br />
          Fueling your Projects for exceptional results and growth.
        </p>
        <Button href="#" variant="secondary" size="md">
          View All Posts
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {BLOG_POSTS.map((post, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition"
          >
            <div className="mb-4">
              <SVGPlaceholder variant="blog" width={400} height={250} index={index} />
            </div>
            <Badge color={post.categoryColor} className="mb-3">
              {post.category}
            </Badge>
            <h3 className="font-semibold mb-4 text-gray-800 leading-snug">{post.title}</h3>
            <div className="flex items-center text-sm text-gray-500 border-t pt-4">
              <span>{post.date}</span>
              <span className="mx-2">·</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="text-white rounded-2xl p-12 text-center"
        style={{
          background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.secondaryDark} 50%, ${COLORS.primary} 100%)`,
        }}
      >
        <Heading level={2} className="mb-4" customColor="white">
          Start your Website!!
        </Heading>
        <p className="text-xl mb-8 leading-relaxed" style={{ color: COLORS.textLight }}>
          Your digital presence begins here. Create a Captivating Website.
          <br />
          With our user-friendly tools and expert support.
        </p>
        <Button href="#" variant="primary" size="lg">
          Get Started →
        </Button>
      </div>
    </Section>
  );
}
