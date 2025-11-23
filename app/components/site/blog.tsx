import { Section, Heading, Button, Badge } from "./ui";
import { BLOG_POSTS } from "./constants";
import { ROUTES } from "../../routes.config";

const BLOG_IMAGES = ["/images/bull.png", "/images/grassland.png", "/images/farm.png"] as const;

export function Blog() {
  return (
    <Section
      id="section-blog"
      className="bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      <div className="text-center mb-12">
        <Heading level={2} color="secondary" className="mb-4">
          <span className="text-primary">Blog</span> Boi na Nuvem
        </Heading>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
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
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
          >
            <div
              className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
              style={{ aspectRatio: "16/9" }}
            >
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
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200 leading-snug">
              {post.title}
            </h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
              <span>{post.date}</span>
              <span className="mx-2">·</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-white rounded-2xl p-12 text-center bg-gradient-to-br from-secondary via-secondary-dark to-primary">
        <Heading level={2} className="mb-4" customColor="white">
          Comece a gerenciar sua fazenda agora!
        </Heading>
        <p className="text-xl mb-8 leading-relaxed text-white/90">
          Sua gestão profissional começa aqui. Transforme a administração da sua fazenda.
          <br />
          Com ferramentas intuitivas e suporte especializado.
        </p>
        <Button href={ROUTES.REGISTER} variant="primary" size="lg">
          Começar Agora →
        </Button>
      </div>
    </Section>
  );
}
