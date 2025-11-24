import type { Route } from "./+types/privacy";
import { AuthLayout } from "../components/site/auth-layout";
import { ROUTES } from "../routes.config";
import { useLanguage } from "../contexts/language-context";
import { formatDate } from "../utils/formatting";
import { useTranslation } from "../i18n";

import { createSEOMeta } from "../utils/seo-meta";

export function meta(_args: Route.MetaArgs) {
  return createSEOMeta({
    title: "Política de Privacidade",
    description:
      "Política de Privacidade do serviço Boi na Nuvem. Saiba como coletamos, usamos e protegemos seus dados pessoais de acordo com a LGPD.",
    url: "/privacidade",
  });
}

export function links() {
  return [{ rel: "canonical", href: "https://boinanuvem.com.br/privacidade" }];
}

export default function Privacy() {
  const { language } = useLanguage();
  const t = useTranslation();

  return (
    <AuthLayout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t.privacy.title}
          </h1>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t.privacy.lastUpdate}: {formatDate(new Date(), language)}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                1. Introdução
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                A Boi na Nuvem (&quot;nós&quot;, &quot;nosso&quot; ou &quot;empresa&quot;) respeita
                sua privacidade e está comprometida em proteger seus dados pessoais. Esta Política
                de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas
                informações quando você usa nosso serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                2. Informações que Coletamos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Coletamos os seguintes tipos de informações:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-4">
                2.1. Informações Fornecidas por Você
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Dados de cadastro (nome, email, telefone, CPF, CNPJ)</li>
                <li>Informações da empresa (razão social, endereço)</li>
                <li>
                  Dados de pagamento (processados por processadores de pagamento terceirizados)
                </li>
                <li>Dados relacionados à sua fazenda e operações</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-4">
                2.2. Informações Coletadas Automaticamente
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Endereço IP e informações do dispositivo</li>
                <li>Dados de uso do serviço (páginas visitadas, tempo de uso)</li>
                <li>Cookies e tecnologias similares</li>
                <li>Informações de localização (quando permitido)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                3. Como Usamos Suas Informações
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Usamos suas informações para:</p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Fornecer, manter e melhorar nosso serviço</li>
                <li>Processar transações e enviar notificações relacionadas</li>
                <li>Enviar comunicações sobre o serviço (atualizações, suporte técnico)</li>
                <li>Personalizar sua experiência no serviço</li>
                <li>Detectar, prevenir e resolver problemas técnicos</li>
                <li>Cumprir obrigações legais e regulatórias</li>
                <li>Realizar análises e pesquisas para melhorar o serviço</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                4. Compartilhamento de Informações
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas
                nas seguintes situações:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>
                  Com prestadores de serviços que nos ajudam a operar o serviço (processadores de
                  pagamento, hospedagem)
                </li>
                <li>Quando exigido por lei ou processo legal</li>
                <li>Para proteger nossos direitos, privacidade, segurança ou propriedade</li>
                <li>Em conexão com uma fusão, aquisição ou venda de ativos</li>
                <li>Com seu consentimento explícito</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                5. Segurança dos Dados
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Implementamos medidas de segurança técnicas e organizacionais apropriadas para
                proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou
                destruição. Isso inclui:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controles de acesso rigorosos</li>
                <li>Monitoramento regular de segurança</li>
                <li>Backups regulares dos dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                6. Retenção de Dados
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir os propósitos
                descritos nesta política, a menos que um período de retenção mais longo seja exigido
                ou permitido por lei. Quando você cancela sua conta, podemos reter certas
                informações por um período limitado para fins legais e de segurança.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                7. Seus Direitos (LGPD)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes
                direitos:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários</li>
                <li>Solicitar portabilidade dos dados</li>
                <li>Revogar seu consentimento</li>
                <li>Ser informado sobre compartilhamento de dados</li>
                <li>Ser informado sobre a possibilidade de não fornecer consentimento</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Para exercer esses direitos, entre em contato conosco através do email:
                contato@boinanuvem.com.br
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                8. Cookies e Tecnologias Similares
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Usamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso
                do serviço e personalizar conteúdo. Você pode controlar o uso de cookies através das
                configurações do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                9. Privacidade de Menores
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nosso serviço não é direcionado a menores de 18 anos. Não coletamos intencionalmente
                informações pessoais de menores. Se descobrirmos que coletamos informações de um
                menor, tomaremos medidas para excluir essas informações.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                10. Alterações nesta Política
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você
                sobre mudanças significativas publicando a nova política nesta página e atualizando
                a data de &quot;Última atualização&quot;. Recomendamos que você revise esta política
                periodicamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                11. Transferência Internacional de Dados
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Seus dados podem ser transferidos e mantidos em servidores localizados fora do
                Brasil. Ao usar nosso serviço, você consente com essa transferência. Garantimos que
                medidas adequadas de proteção de dados sejam implementadas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                12. Contato
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de
                Privacidade ou ao tratamento de seus dados pessoais, entre em contato conosco:
              </p>
              <ul className="list-none text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>
                  <strong>Email:</strong> contato@boinanuvem.com.br
                </li>
                <li>
                  <strong>Telefone:</strong> (11) 9999-9999
                </li>
              </ul>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <a href={ROUTES.HOME} className="text-blue-500 dark:text-blue-400 hover:underline">
                ← Voltar ao início
              </a>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
