import type { Route } from "./+types/terms";
import { AuthLayout } from "../components/site/auth-layout";
import { ROUTES } from "../routes.config";

import { createSEOMeta } from "../utils/seo-meta";

export function meta(_args: Route.MetaArgs) {
  return createSEOMeta({
    title: "Termos de Uso",
    description:
      "Termos de Uso do serviço Boi na Nuvem. Leia os termos e condições que regem o uso da plataforma de gestão para fazendas de gado de corte.",
    url: "/termos",
  });
}

export function links() {
  return [{ rel: "canonical", href: "https://boinanuvem.com.br/termos" }];
}

export default function Terms() {
  return (
    <AuthLayout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Termos de Uso
          </h1>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                1. Aceitação dos Termos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Ao acessar e usar o serviço Boi na Nuvem, você concorda em cumprir e estar vinculado
                aos seguintes termos e condições de uso. Se você não concordar com alguma parte
                destes termos, não deve usar nosso serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                2. Descrição do Serviço
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                O Boi na Nuvem é uma plataforma de gestão para fazendas de gado de corte que oferece
                ferramentas para gerenciamento de propriedades, animais, finanças, estoque e outros
                aspectos relacionados à administração rural.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                3. Cadastro e Conta do Usuário
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Para usar o serviço, você precisa criar uma conta fornecendo informações precisas e
                completas. Você é responsável por:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Manter a confidencialidade de sua senha</li>
                <li>Todas as atividades que ocorrem em sua conta</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
                <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                4. Uso Aceitável
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Você concorda em usar o serviço apenas para fins legais e de acordo com estes
                termos. Você não deve:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4">
                <li>Usar o serviço de forma que viole qualquer lei ou regulamento</li>
                <li>Interferir ou interromper o serviço ou servidores conectados ao serviço</li>
                <li>Tentar obter acesso não autorizado a qualquer parte do serviço</li>
                <li>Usar o serviço para transmitir qualquer vírus ou código malicioso</li>
                <li>Copiar, modificar ou criar trabalhos derivados do serviço</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                5. Propriedade Intelectual
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Todo o conteúdo do serviço, incluindo mas não limitado a textos, gráficos, logos,
                ícones, imagens, clipes de áudio, downloads digitais e compilações de dados, é
                propriedade do Boi na Nuvem ou de seus fornecedores de conteúdo e está protegido por
                leis de direitos autorais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                6. Dados do Usuário
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Você mantém todos os direitos sobre os dados que você insere no serviço. No entanto,
                ao usar o serviço, você nos concede uma licença para usar, armazenar e processar
                esses dados conforme necessário para fornecer e melhorar o serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                7. Pagamento e Assinatura
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Alguns recursos do serviço podem exigir pagamento. Ao assinar um plano pago, você
                concorda em pagar as taxas aplicáveis. As assinaturas são renovadas automaticamente,
                a menos que você cancele antes do final do período de cobrança.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                8. Cancelamento e Rescisão
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Você pode cancelar sua conta a qualquer momento. Reservamo-nos o direito de
                suspender ou encerrar sua conta e acesso ao serviço imediatamente, sem aviso prévio,
                por qualquer motivo, incluindo violação destes termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                9. Limitação de Responsabilidade
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                O serviço é fornecido &quot;como está&quot; e &quot;conforme disponível&quot;. Não
                garantimos que o serviço será ininterrupto, seguro ou livre de erros. Em nenhuma
                circunstância seremos responsáveis por quaisquer danos diretos, indiretos,
                incidentais ou consequenciais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                10. Modificações dos Termos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações
                entrarão em vigor imediatamente após a publicação. Seu uso continuado do serviço
                após as alterações constitui sua aceitação dos novos termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                11. Lei Aplicável
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Estes termos são regidos pelas leis do Brasil. Qualquer disputa relacionada a estes
                termos será resolvida nos tribunais competentes do Brasil.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                12. Contato
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do
                email: contato@boinanuvem.com.br
              </p>
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
