# Grazi Nails — página institucional

Landing page responsiva para nail designer em São Brás, União da Vitória — PR.

## Estrutura
- `index.html`: página principal, serviços, galeria, agendamento e rodapé.
- `styles.css`: identidade visual, layout responsivo e composição 3D da hero.
- `app.js`: interações, seleção de serviço e preparação da mensagem de agendamento.
- `config.js`: campos para inserir WhatsApp, perfil do Google e Instagram.
- `privacy.html`: aviso de privacidade.
- `_headers`: exemplo de cabeçalhos de segurança para hospedagens compatíveis (como Netlify).
- `assets/favicon.svg`: ícone do site.

## Configuração antes de publicar
Edite `config.js` e informe:
- `whatsappNumber`: número completo com código do país e DDD, apenas dígitos.
- `googleBusinessUrl`: link do perfil oficial do Google.
- `instagramUrl`: link do perfil oficial.

A página não inventa avaliações nem exibe nota fictícia. O painel do Google é um espaço de integração a ser configurado com o perfil oficial. As imagens da galeria são referências ilustrativas externas, não um portfólio autoral confirmado.

## Agendamento
O formulário valida os campos no navegador e abre uma mensagem no WhatsApp. Não há backend, armazenamento de dados, banco de dados ou confirmação automática de disponibilidade. Para agendamento online real com horários bloqueados, lembretes e gestão de clientes, será necessário integrar um backend seguro ou uma plataforma de agenda.

## Segurança e publicação
O projeto evita coletar ou persistir dados no servidor. O arquivo `_headers` oferece uma base de cabeçalhos HTTP, mas só terá efeito em provedores que o reconheçam. Configure HTTPS, proteção contra abuso/rate limits caso seja adicionado um backend, atualizações e monitoramento na hospedagem. Não coloque senhas, tokens ou chaves privadas no frontend. Revise a política de segurança de conteúdo conforme os recursos externos realmente utilizados.

Para publicar como site estático, conecte o repositório a uma hospedagem compatível e defina a raiz como diretório do projeto.
