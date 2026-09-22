# Especificação Funcional: Gestão de Usuários Convidados

## 1. Visão Geral
Introduzir um novo fluxo para a criação e gestão de "Usuários Convidados" no sistema. O objetivo é permitir que visitantes ou jogadores esporádicos tenham acesso temporário restrito à plataforma, com credenciais geradas automaticamente e ciclo de vida controlado por rotinas automatizadas.

## 2. Interface de Usuário (UI / UX)
- **Botão "Criar Convidado":** Posicionado estrategicamente ao lado do botão de "Criar Usuário" (provavelmente na tela de gestão de membros).
- **Modal de Criação:** Ao clicar no botão, um formulário simplificado será exibido contendo apenas os seguintes campos de entrada:
  - **Nome:** (Obrigatório, input de texto)
  - **Tier:** (Obrigatório, select/dropdown do nível do jogador)
- A exibição das credenciais geradas (usuário e senha) deverá ocorrer após o sucesso da criação para que o administrador possa compartilhar com o convidado.

## 3. Regras de Negócio
### 3.1 Geração Automática de Credenciais
- **Nome de Usuário (Username):** Gerado automaticamente pelo sistema utilizando o primeiro nome informado em letras minúsculas, sem acentos, seguido por 4 números aleatórios. Formato: `@nome[4_numeros]` (ex: `@carlos4921`).
- **Senha:** Gerada automaticamente pelo sistema, composta por uma string de 8 caracteres numéricos aleatórios (ex: `84920173`).

### 3.2 Novo Papel e Controle de Acesso
- **Novo Role (Papel):** Criar o nível de acesso `guest` (convidado).
- Usuários criados por esse novo fluxo recebem **automaticamente** o papel `guest`.
- **Restrição de Rotas:** O papel `guest` tem acesso **exclusivo** às seguintes páginas:
  - *Home* (Início)
  - *Tela de Pagamento*
- Qualquer tentativa de acessar outras rotas da aplicação deve bloquear o acesso (redirecionando para a Home ou exibindo mensagem de erro).

### 3.3 Status de Conta (Flag de Atividade)
- **Nova Flag `active` (Ativo/Inativo):** Todos os usuários do sistema (administradores, membros e convidados) passarão a ter uma flag booleana definindo se podem ou não realizar login.
- **Login:** Caso um usuário inativo tente se autenticar, o sistema deve rejeitar o login com uma mensagem ("Conta inativa").
- **Controle Admin:** Administradores terão poder para ativar ou desativar qualquer usuário manualmente pelo painel.

## 4. Processos Automatizados (Rotinas / Jobs)
- **Rotina de Expiração:** Configurar um cron job configurado para executar **toda segunda-feira à 00:00 (Meia-noite)**.
- **Ação:** O job deverá buscar no banco de dados todos os usuários que possuam o papel `guest` e alterar a flag `active` para `false` (inativo). Isso garante que o acesso dos convidados expire ao fim da semana.

## 5. Impacto Técnico Esperado
- **Banco de Dados (Schema):** 
  - Adição da coluna `active` (boolean, default: `true`) na tabela de usuários.
  - Expansão do ENUM/tipo de `role` para suportar `guest`.
- **Autenticação:** Ajuste no middleware/lógica de sessão para verificar a flag `active` no momento do login e a cada navegação restrita.
