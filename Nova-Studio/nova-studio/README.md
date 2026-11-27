# Nova Studio

Extensão de nova guia para Google Chrome, inspirada na personalização da tela de bloqueio do iPhone. Desenvolvida em HTML, CSS e JavaScript puro (Manifest V3). Não exige Node.js, npm, dependências, servidor ou conta.

## Instalação

1. Extraia o ZIP em uma pasta permanente (por exemplo, `~/Documentos/nova-studio`).
2. Abra `chrome://extensions/` no Chrome.
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação** e escolha a pasta `nova-studio` que contém `manifest.json` (não o ZIP).
5. Abra uma nova guia (`Ctrl+T`). Caso o Chrome solicite confirmação, escolha manter a nova página.
6. Clique no pequeno ícone de ajustes no canto inferior direito. O atalho `Alt+Shift+P` também abre o painel enquanto estiver na página da extensão; `Esc` fecha.

Não mova nem apague a pasta depois de carregar. Para atualizar o código, salve as mudanças, use o botão de recarregar em `chrome://extensions/` e reabra a guia.

## Atualização para a versão 1.2

Exporte um backup em Ajustes antes de atualizar. Extraia os novos arquivos e substitua os arquivos dentro da pasta **já carregada** no Chrome, sem remover a extensão nem mudar a pasta. Recarregue a extensão em `chrome://extensions/` e abra outra guia. O manifesto mantém o mesmo nome, e as chaves de armazenamento e o banco de dados continuam iguais; assim, a atualização no mesmo local deve preservar os dados. Se necessário, importe o backup.

O rodapé com o nome da extensão é nativo do Chrome, não do Nova Studio. Para ocultá-lo, clique com o botão direito no rodapé e escolha a opção de ocultar o rodapé da nova guia. Alternativamente, em Personalizar o Chrome → Rodapé, desative a exibição. A extensão não pode alterar diretamente essa preferência do Chrome.

## Novidades da versão 1.2

- **Duplo clique:** clique duas vezes diretamente no relógio, data, logo ou mensagem para abrir o painel já na seção correspondente. Durante o modo de edição, pesquisa e atalhos também aceitam duplo clique, sem navegar. Com o elemento focado, Enter faz o mesmo no modo de edição. O botão Vidro no cabeçalho de cada seção de texto leva diretamente aos controles do efeito.
- **Guias inteligentes:** arraste perto do centro horizontal ou vertical e o elemento encaixa exatamente em 50% da área de prévia. O encaixe entre centros de outros elementos visíveis é independente em cada eixo. Em Layout, ative/desative cada tipo de encaixe e ajuste a distância em pixels. Segure Shift durante o arraste para mover livremente. Para a composição definitiva, use o botão de edição em tela cheia; as posições continuam expressas em porcentagens.
- **Tipografia de vidro:** relógio, data, logotipo e mensagem têm controles independentes de ativação, intensidade da cor, desfoque interno, reflexo de luz, contorno e saturação. O texto usa transparência, uma máscara dos glifos para o desfoque do fundo e reflexos em degradê. Use uma fonte mais pesada para realçar o efeito. A opacidade geral continua disponível na tipografia. O vidro tem prioridade sobre o degradê tradicional, sem apagar suas configurações. É uma aproximação visual em CSS e Canvas, não o motor Liquid Glass da Apple; o resultado depende do wallpaper e da renderização do navegador.
- As novas opções de vidro começam desativadas e as guias vêm ativadas. As preferências e os arquivos das versões anteriores continuam usando as mesmas chaves de armazenamento.

## Personalização

- **Temas:** seis combinações iniciais de cores. Aplicar um tema troca o fundo e as cores principais, sem apagar posições, fontes, textos ou atalhos.
- **Fundo:** degradê de três cores, cor sólida ou arquivo local. Imagens PNG, JPEG, WebP, GIF, AVIF, BMP; vídeos MP4, WebM ou Ogg, até 50 MB. Vídeos ficam em loop sem som e são pausados em guias inativas. Ajuste posição, preenchimento, zoom, desfoque, escurecimento, brilho e saturação. A reprodução depende dos codecs suportados pelo navegador.
- **Relógio:** horário real do dispositivo ou de outro fuso IANA; formato 12/24h, segundos e AM/PM. Personalize fonte, peso, tamanho, cor, opacidade, espaçamento, itálico, degradê, sombra e brilho. Data independente, em português, com seis formatos.
- **Logo:** texto livre, ou oculte o logotipo. A mensagem pessoal é um segundo texto independente. Ambos têm tipografia e efeitos próprios.
- **Pesquisa:** largura, altura, borda, raio, opacidade, desfoque de vidro, sombras, cores, fonte, placeholder, lupa e botão. Buscadores Google, Bing, DuckDuckGo, Brave, Yahoo e personalizado (URL HTTP/HTTPS com `{query}`). A busca envia o texto somente quando você confirma.
- **Atalhos:** até 24 sites com nomes, símbolos/emojis e URLs, reordenação e aparência ajustável. Não há leitura do histórico nem favoritos automáticos.
- **Layout:** em modo de edição, clique e arraste diretamente o relógio, data, logotipo, pesquisa, atalhos ou mensagem. Não há mais alças de três pontos. O botão de expandir no cabeçalho do painel (ou Layout → Mover em tela cheia) permite arrastar com a área real da nova guia. Use as setas do teclado para pequenos ajustes e Shift + seta para passos maiores. As posições continuam disponíveis em porcentagem e são salvas automaticamente. Os elementos são independentes, podendo se sobrepor. Durante a edição, pesquisa e atalhos não navegam; clique em Concluir para voltar a usá-los. Escolha uma animação de entrada ou desative-a.
- **Ajustes:** importe uma fonte TTF/OTF/WOFF/WOFF2 de até 10 MB e selecione "Minha fonte (upload)" nos elementos desejados. Uma fonte própria por vez; as opções de fontes do sistema dependem das fontes instaladas no dispositivo. Exporte/importe backup JSON incluindo arquivos e ajustes, ou restaure o padrão.

As mudanças são salvas automaticamente no perfil local do Chrome. Preferências em `localStorage` e arquivos em `IndexedDB`. O arquivo de backup pode conter imagens e fontes pessoais; guarde-o com cuidado. Não há sincronização automática entre computadores e não há telemetria. Não são solicitadas permissões especiais no manifesto. Os sites de pesquisa e os atalhos são navegados apenas por ação do usuário.

## Estrutura

```text
nova-studio/
  manifest.json    Configuração Manifest V3 e substituição de nova guia
  index.html       Estrutura da interface
  styles.css       Layout, aparência e efeitos
  app.js           Configurações, controles, pesquisa, horário, drag, armazenamento
  icons/           Ícones da extensão
  README.md        Este guia
```

## Limitações

A extensão substitui a página de nova guia do Chrome, não modifica a barra de endereços, o tema de toda a interface do navegador nem o Google.com. Não inclui sugestões nativas de pesquisa, Google Lens ou voz. O logotipo é texto editável, não a marca gráfica oficial. O wallpaper original precisa ser importado. O relógio mostra a hora real no fuso selecionado e não altera o relógio do sistema. Desative a extensão para voltar à nova guia original. Exporte o backup antes de remover a extensão, pois a remoção pode apagar os dados locais.

## Validação

Sintaxe JavaScript e estrutura do manifesto verificadas. Testes de interface no Chromium com HTML, CSS e JS carregados como conteúdo de teste confirmaram o arraste direto de relógio, data, logotipo, pesquisa e atalhos, alternância entre edição lateral e tela cheia, ajuste pelo teclado e reativação dos elementos após sair da edição. A restauração de posições foi testada com armazenamento simulado. Na versão 1.2 também foram testados duplo clique na seção correta (inclusive a partir da tela normal e da edição em tela cheia), encaixe nos dois eixos, alinhamento com outro elemento, Shift para desativar encaixe, ocultação das guias ao soltar, ativação/desativação de vidro nos quatro elementos de texto, máscara dos glifos, compatibilidade de dados antigos e reabertura com ajustes salvos. O ambiente bloqueia a instalação de extensões e a navegação em arquivos locais; a atualização real no Chrome e a persistência no armazenamento da extensão ainda precisam ser verificadas no navegador do usuário.
