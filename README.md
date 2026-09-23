Loja Virtual de Jogos Eletrônicos
Sobre o projeto

Sistema de e-commerce especializado na venda de jogos eletrônicos (digitais e físicos) e acessórios, substituindo o processo atual de vendas manuais via WhatsApp/Instagram.

Objetivo do levantamento

Este documento registra os requisitos funcionais e não funcionais levantados junto ao cliente (dono da loja), a partir de uma entrevista de requisitos, servindo como base para o desenvolvimento do sistema.




1. Perguntas funcionais (o que o sistema deve FAZER) - Requisitos Funcionais:


"O sistema deve filtrar jogos de que maneira, nome, marca, plataforma ?"
_ RF01. Sobre os filtros: Sim! Eu imagino que o cliente possa filtrar por várias coisas: nome do jogo, plataforma (PS5, Xbox, Nintendo Switch, PC), gênero (ação, RPG, esporte...), faixa de preço, e talvez por avaliação/nota dos usuários. Marca eu não tinha pensado, mas pode ser útil também, tipo separar por desenvolvedora ou distribuidora.

"A loja já vende alguns desses produtos ? Se sim, de que maneira ?"
_ RF02. Sobre vendas atuais: Sim, hoje a gente vende de forma bem manual — recebo pedidos pelo WhatsApp e Instagram, o cliente me manda mensagem perguntando se tenho o jogo, eu confirmo o preço e a forma de pagamento (Pix, geralmente), e depois combino a entrega ou envio o código digital por e-mail. É bem trabalhoso e não tem controle de estoque automatizado, às vezes vendo o mesmo jogo pra duas pessoas sem perceber que só tinha um.
O sistema deve controlar estoque em tempo real para evitar venda de itens indisponíveis!



"Precisa criar login?"
_ RF03. Sim, precisa. Eu quero que o cliente crie uma conta com nome, e-mail e senha, porque preciso guardar o histórico de compras dele (principalmente pra jogos digitais, caso ele perca o código e precise que eu reenvie). Mas seria legal também ter a opção de login com Google, pra facilitar — muita gente desiste de comprar quando tem que preencher cadastro longo.


"O que o cliente precisa conseguir fazer no site?"
_ RF04. Deixa eu listar o que vem na cabeça: buscar e filtrar jogos, ver detalhes do produto (descrição, imagens, requisitos do sistema pra jogos de PC, avaliações de outros compradores), adicionar ao carrinho, finalizar compra com Pix/cartão/boleto, acompanhar o status do pedido, ver histórico de compras, e falar com o suporte caso tenha algum problema. Ah, e queria muito ter um sistema de avaliação/comentário, tipo "quem comprou pode avaliar o jogo com nota e texto".


"Existem diferentes tipos de usuário (cliente, admin, vendedor)?"
_ RF05. Sim! Pelo menos três: o cliente comum (que compra), o administrador (que sou eu, ou alguém que eu contratar — cadastra produtos, controla estoque, vê relatórios de vendas), e talvez no futuro um vendedor/parceiro, caso eu decida abrir a loja pra outros venderem produtos também, tipo um marketplace. Mas por enquanto, foco em cliente e admin mesmo.


"Como funciona o processo de compra?"
_ RF06. Ah, deixa eu explicar como eu imagino que funcionaria: o cliente entra no site, procura o jogo (por busca ou navegando pelas categorias), clica no produto pra ver os detalhes, e adiciona ao carrinho. Aí ele pode continuar comprando outros jogos ou já ir pro carrinho pra finalizar.
No carrinho, ele revisa os itens, talvez aplique um cupom de desconto se eu criar promoções, e escolhe a forma de pagamento — Pix, cartão de crédito (à vista ou parcelado) ou boleto. Depois de pagar, ele recebe uma confirmação por e-mail.
Aqui tem uma diferença importante: se for um jogo digital (código de ativação), depois que o pagamento é confirmado, o sistema já libera o código automaticamente pro cliente, sem eu precisar fazer nada manual. Se for um produto físico (tipo um console ou um jogo em mídia física), aí eu preciso separar, embalar e enviar pelos Correios ou transportadora, e o cliente acompanha o rastreio.



2. Perguntas não funcionais (COMO o sistema deve se comportar):

"Qual o tempo médio em que a página deve ser recarregada / atualizada na tela ?"
_ RNF01. Sobre tempo de recarregamento: Ih, essa eu não sei responder tecnicamente... o que eu quero é que o site seja rápido, que o cliente não fique esperando muito tempo pra página carregar. Não sei te dar um número exato.


"Éh importante pra você que o site funcione bem mesmo com muita gente acessando ao mesmo tempo, tipo numa Black Friday?"
_ RNF02. Nossa, com certeza! Isso é uma das minhas maiores preocupações, na verdade. Eu já vi muita loja pequena "cair" justamente na Black Friday ou em lançamento de jogo grande (tipo quando sai um GTA novo ou um console novo), que é exatamente quando mais vende. Se o site cair ou ficar lento bem na hora que mais tem gente querendo comprar, é prejuízo direto — cliente desiste e vai comprar em outro lugar. Então sim, quero que aguente bem esses picos, principalmente em datas como Black Friday, Natal e lançamentos de jogos muito esperados.


Segurança: "Como os dados de pagamento devem ser protegidos?" 
_ RNF03. Olha, eu não entendo muito de tecnologia, mas isso me preocupa bastante — já ouvi falar de loja que vazou dado de cartão de cliente e depois faliu por causa disso. Eu não quero guardar dado de cartão diretamente no meu sistema, se puder ser feito por um "intermediário" confiável (tipo Mercado Pago, PagSeguro, Stripe), prefiro. E também precisa estar de acordo com a lei, aquela LGPD que todo mundo fala, para não ter problema jurídico depois.


Usabilidade: "O site precisa funcionar bem no celular?"
_ RNF04. Com certeza! Aliás, eu acho que a maioria dos meus clientes vai acessar pelo celular — hoje mesmo, boa parte dos pedidos que recebo pelo WhatsApp e Instagram já vêm de gente no celular mesmo. Então sim, o site precisa ser responsivo, funcionar bem tanto no computador quanto no celular e tablet. Não adianta nada só funcionar bem no PC se meu público principal usa o celular no dia a dia.


"Você sabe mais ou menos que porcentagem dos seus clientes usa celular hoje?"
_ RNF05. Deixa eu pensar... eu diria que uns 70% a 80% dos meus pedidos vêm de gente conversando comigo pelo celular, seja WhatsApp ou Instagram. O pessoal que usa computador geralmente é mais velho ou tá comprando de dentro do trabalho mesmo. Mas não tenho um número exato, é só uma estimativa de cabeça mesmo, viu?


Disponibilidade: "O site pode ficar fora do ar às vezes ou precisa estar sempre disponível?"
_ RNF06. Olha, eu entendo que nenhum sistema fica 100% do tempo no ar, mas o ideal pra mim é que fique disponível o tempo todo, principalmente porque não sei quando um cliente vai querer comprar — pode ser de madrugada, fim de semana, feriado. Se precisar fazer alguma manutenção, prefiro que seja feito em horário de baixo movimento, tipo de madrugada mesmo, umas 3h ou 4h da manhã, e que seja rápido e avisado com antecedência, se possível. O que eu não posso é ficar fora do ar bem numa Black Friday ou lançamento importante, tipo o que a gente falou antes — aí seria um problemão.



Documento gerado a partir de entrevista de levantamento de requisitos. Última atualização: [17/09/2026].








3. Metodologia Ágil — Kanban

Acompanhamento do desenvolvimento via Kanban, com fluxo contínuo e WIP (Work In Progress) limitado — adequado para desenvolvimento solo, sem ciclos fechados (sprints).

3.1 Board

Colunas: Backlog → A Fazer → Em Progresso (WIP máx. 2-3) → Em Revisão/Teste → Concluído

3.2 Backlog inicial 
Coluna	Card	Origem
Em Revisão Levantamento de Requisitos Entregáveis do Projeto
Backlog	Criar Modelo Conceitual (DER) Entregáveis do Projeto
Backlog	Criar Modelo Lógico (RELACIONAL) Entregáveis do Projeto
Backlog	Criar Modelo Físico (DDL - SQL) do Banco de Dados Entregáveis do Projeto


Documento gerado a partir de entrevista de levantamento de requisitos. Última atualização: [22/09/2026].



Pronto! O diagrama está publicado com notação de Chen: retângulos para entidades, elipses para atributos (sublinhados = chave primária) e losangos para relacionamentos.


CLIENTE (RF03 — login/cadastro)
ADMINISTRADOR (RF05 — tipos de usuário)
JOGO (RF01/RF02 — filtros e catálogo, com atributo tipo para digital×físico e estoque por causa do RF02 — controle em tempo real)
PEDIDO (RF06 — processo de compra)
PAGAMENTO (RF06/RNF03 — Pix, cartão, boleto, sem guardar dado de cartão)
ENTREGA (RF06 — só para produtos físicos)
CUPOM (RF06 — desconto/promoções)

Relacionamentos:

CLIENTE (1,N) REALIZA PEDIDO — RF06
CLIENTE (N,N) AVALIA JOGO, com atributos próprios (nota, comentario) — RF04
ADMINISTRADOR (1,N) GERENCIA JOGO — RF05
PEDIDO (N,N) CONTÉM JOGO, com quantidade e preco_unitario — RF06
PEDIDO (1,1) PAGA / (0,1) ENTREGA-SE / (0,1) APLICA CUPOM

Os RNFs (performance, LGPD, mobile-first, disponibilidade) não geram entidades — são requisitos de infraestrutura/arquitetura, não de dados — então não aparecem no MER, mas influenciam decisões como "não armazenar dado de cartão" (por isso PAGAMENTO guarda só status/valor, não dados sensíveis).

![alt text](image.png)