import { Section, Heading, Button, Badge } from "./ui";
import { BLOG_POSTS, COLORS } from "./constants";
import { ROUTES } from "../../routes.config";

const BLOG_IMAGES = [
  "/images/bull.png",
  "/images/grassland.png",
  "/images/farm.png",
] as const;

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
          <span style={{ color: COLORS.primary }}>Blog</span> Boi na Nuvem
        </Heading>
        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
          Dicas, novidades e conteúdos exclusivos sobre gestão de fazendas
          <br />
          Acompanhe as melhores práticas e tendências da pecuária de corte.
        </p>
        <Button href="#" variant="secondary" size="md">
          Ver Todos os Posts
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {BLOG_POSTS.map((post, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition"
          >
            <div className="mb-4 rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: "16/9" }}>
              <img
                src={BLOG_IMAGES[index] || BLOG_IMAGES[0]}
                alt={post.title}
                className="w-full h-full rounded-lg"
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
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
          Comece a gerenciar sua fazenda agora!
        </Heading>
        <p className="text-xl mb-8 leading-relaxed" style={{ color: COLORS.textLight }}>
          Sua gestão profissional começa aqui. Transforme a administração da sua fazenda.
          <br />
          Com ferramentas intuitivas e suporte especializado.
        </p>
        <Button href={ROUTES.LOGIN} variant="primary" size="lg">
          Começar Agora →
        </Button>
      </div>
    </Section>
  );
}
