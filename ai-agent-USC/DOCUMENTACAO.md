# Documentação do projeto ai-agent-USC

## Visão geral

O `ai-agent-USC` é uma extensão para o Visual Studio Code criada para auxiliar a escrita e manutenção de User Story Cards. A extensão registra um editor customizado para arquivos `*.usc.json` e fornece um comando para criar ou abrir um quadro de histórias de usuário.

O projeto ainda está em estágio inicial, mas já possui:

- Editor visual baseado em Webview para manipular histórias.
- Persistência em arquivo JSON com extensão `.usc.json`.
- Estrutura de domínio em TypeScript para representar histórias, critérios e propriedades.
- Comando no Command Palette para criar um board inicial.
- Build com Webpack e lint com ESLint.

## Principais funcionalidades

- Criar um arquivo de board de User Stories com conteúdo padrão.
- Abrir arquivos `*.usc.json` em um editor customizado.
- Editar a declaração da história no formato:
  - `As a`
  - `I want to`
  - `So that`
- Cadastrar critérios de aceite em formato Gherkin.
- Cadastrar critérios técnicos.
- Alterar propriedades da história, como status, prioridade, story points e notas técnicas.
- Salvar as alterações no documento JSON por meio da comunicação entre Webview e extensão.

## Estrutura de diretórios

```text
.
├── media/
│   ├── usc.css
│   └── usc.js
├── src/
│   ├── commands/
│   │   └── openUserStoryBoardCommand.ts
│   ├── core/
│   │   ├── types.ts
│   │   └── userStoryService.ts
│   ├── webview/
│   │   └── htmlTemplate.ts
│   ├── USCTextEditorProvider.ts
│   ├── extension.ts
│   └── test/
│       └── extension.test.ts
├── package.json
├── webpack.config.js
├── tsconfig.json
└── DOCUMENTACAO.md
```

## Componentes principais

### `src/extension.ts`

É o ponto de entrada da extensão. Durante a ativação, ele:

- Registra o editor customizado `ai-agent-USC.USC`.
- Associa esse editor a arquivos `*.usc.json`.
- Registra o comando `ai-agent-USC.openUserStoryBoard`.

### `src/USCTextEditorProvider.ts`

Implementa `vscode.CustomTextEditorProvider` e controla o ciclo de vida do editor customizado.

Responsabilidades:

- Configurar permissões da Webview.
- Gerar o HTML da interface.
- Enviar o estado atual do documento para a Webview.
- Receber mensagens da Webview para salvar o documento.
- Aplicar alterações no arquivo usando `WorkspaceEdit`.

### `src/commands/openUserStoryBoardCommand.ts`

Implementa o comando `USC: Open User Story Board`.

Responsabilidades:

- Sugerir um nome de arquivo com a data atual.
- Criar um arquivo `.usc.json` se ele ainda não existir.
- Escrever o board padrão no novo arquivo.
- Abrir o documento no VS Code.

### `src/core/types.ts`

Define os tipos principais do domínio:

- `StoryStatus`
- `StoryPriority`
- `StoryStatement`
- `UserStory`
- `StoryBoardDocument`
- Mensagens trocadas entre Webview e extensão.

### `src/core/userStoryService.ts`

Contém funções de criação, leitura e serialização do board:

- `createDefaultBoard()`: cria um board inicial.
- `parseBoardDocument(rawText)`: interpreta o JSON do arquivo.
- `stringifyBoardDocument(board)`: transforma o board em JSON formatado.

### `src/webview/htmlTemplate.ts`

Gera o HTML usado na Webview. Também configura:

- CSS local da extensão.
- JavaScript local da extensão.
- Política de segurança de conteúdo com `nonce`.

### `media/usc.js`

Contém a lógica de interface da Webview:

- Recebe o estado enviado pela extensão.
- Renderiza lista de histórias e formulário de edição.
- Atualiza o estado em memória.
- Envia mensagens `saveDocument` para persistir alterações.

### `media/usc.css`

Define o layout visual da Webview:

- Painel esquerdo para lista de histórias.
- Área central para edição da história.
- Painel direito para propriedades.
- Regras responsivas para telas menores.

## Formato do arquivo `.usc.json`

Um board é salvo como JSON no seguinte formato:

```json
{
  "selectedStoryId": "story-1",
  "stories": [
    {
      "id": "story-1",
      "title": "User Login Authentication",
      "statement": {
        "asA": "registered user",
        "iWantTo": "log in using my email and password",
        "soThat": "I can access my personal dashboard and saved settings safely"
      },
      "businessRules": [
        "Implement rate limiting on the login endpoint (max 5 attempts per minute)"
      ],
      "acceptanceCriteria": [
        "Given the user is on the login page\nWhen they enter valid credentials\nThen they are redirected to the dashboard"
      ],
      "status": "In Progress",
      "priority": "High",
      "storyPoints": 5,
      "devNotes": "Needs to integrate with the new Auth0 provider."
    }
  ]
}
```

## Como executar em desenvolvimento

Instale as dependências:

```bash
npm install
```

Compile a extensão:

```bash
npm run compile
```

Execute o lint:

```bash
npm run lint
```

Execute os testes:

```bash
npm test
```

Para desenvolver com recompilação contínua:

```bash
npm run watch
```

No VS Code, use `F5` para abrir uma janela Extension Development Host e testar a extensão.

## Comandos disponíveis

| Script | Descrição |
| --- | --- |
| `npm run compile` | Compila a extensão com Webpack. |
| `npm run watch` | Compila em modo contínuo. |
| `npm run package` | Gera build de produção. |
| `npm run lint` | Executa ESLint em `src`. |
| `npm run compile-tests` | Compila testes TypeScript para `out`. |
| `npm test` | Executa a suíte de testes do VS Code. |

## Revisão de código

### Pontos positivos

- A separação entre extensão, comando, domínio e template da Webview está clara.
- O editor customizado usa `CustomTextEditorProvider`, que é adequado para documentos persistidos como texto.
- A Webview usa `nonce` e `Content-Security-Policy`, reduzindo a superfície para execução indevida de scripts.
- O modelo de dados está tipado no lado TypeScript.
- `parseBoardDocument` sanitiza parte do conteúdo recebido antes de renderizar.
- `lint` e `compile` passam com sucesso no estado atual.

### Riscos e problemas encontrados

1. O comando de abertura provavelmente não força o editor customizado.

   Em `src/commands/openUserStoryBoardCommand.ts`, o comando abre o arquivo com `openTextDocument` e `showTextDocument`. Isso pode abrir o JSON como editor de texto comum, em vez de garantir a Webview customizada. Para abrir explicitamente o editor customizado, o fluxo mais seguro é usar `vscode.commands.executeCommand("vscode.openWith", targetUri, "ai-agent-USC.USC")`.

2. Campos de critérios podem perder foco durante a digitação.

   Em `media/usc.js`, cada evento `input` chama `updateSelectedStory`, que chama `render`. A renderização reconstrói as listas de critérios com `innerHTML = ""` e cria novos `textarea`. Na prática, ao digitar em um critério, o elemento pode ser destruído e recriado a cada tecla, causando perda de foco, cursor ou seleção.

3. JSON inválido pode ser substituído silenciosamente.

   Em `src/core/userStoryService.ts`, `parseBoardDocument` retorna um board padrão quando o JSON é inválido. Se o usuário abrir um arquivo corrompido ou parcialmente editado e fizer uma alteração pela Webview, o conteúdo inválido pode ser sobrescrito por um board padrão sem aviso claro.

4. A suíte de testes ainda é apenas o exemplo inicial.

   `src/test/extension.test.ts` não valida comportamento da extensão, parsing, serialização, comando de criação de arquivo ou comunicação com a Webview. Isso deixa regressões importantes sem cobertura.

5. A interface não permite criar, renomear ou remover histórias.

   O modelo aceita várias histórias, mas a Webview atual só lista histórias existentes e edita a selecionada. Não há ação visível para adicionar nova história, alterar título ou remover itens.

6. O JavaScript da Webview não é validado pelo TypeScript.

   `media/usc.js` usa JSDoc para referenciar tipos, mas não há evidência de checagem ativa desse arquivo no build. Isso permite atribuições inconsistentes, por exemplo valores genéricos de `select` para campos que no domínio deveriam aceitar apenas valores específicos.

## Recomendações

1. Ajustar o comando para abrir o arquivo com `vscode.openWith` e o `viewType` do editor customizado.
2. Evitar renderizar toda a lista de critérios a cada tecla. Atualize apenas o estado e salve, ou use eventos `change`/debounce para persistência.
3. Diferenciar arquivo vazio de JSON inválido. Para JSON inválido, exibir erro e evitar sobrescrever automaticamente.
4. Criar testes unitários para `createDefaultBoard`, `parseBoardDocument` e `stringifyBoardDocument`.
5. Criar testes ou validações para o comando de criação de board.
6. Adicionar ações de interface para criar, renomear e remover histórias.
7. Considerar migrar o script da Webview para TypeScript ou ativar checagem com `// @ts-check` e tipos JSDoc mais rígidos.

## Estado da validação

Validações executadas durante esta revisão:

- `npm run lint`: passou.
- `npm run compile`: passou.

`npm test` não foi executado nesta revisão porque a suíte atual ainda contém apenas o teste de exemplo gerado pelo template.
