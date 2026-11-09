# Famed
Repositório para o projeto integrador da faculdade FATEC LUIGI PAPAIZ.
Curso: Desenvolvimento de Software Multiplataforma 2026-1. 

## Integrantes
- Gustavo Maciel Pinheiro
- Heitor Leite Mollina
- Silas Felipe de Oliveira Evangelista
- Thais Aureliano Silva
- Thomaz Leventhal Campos

# Introdução
Nosso projeto visa desenvolver um sistema que auxilie todo o ciclo de vida de uma receita médica digital, facilitando a prescrição, organização e dispensação dessas receitas.<br> 
Indo desde a emissão pelo MÉDICO, à Dispensação na farmácia/drogaria.

## Problemática 
Como reduzir erros médicos, prevenir dispensações incorretas em farmácias e promover o uso racional de medicamentos através de um sistema digital de prescrição e rastreamento?
 
## Contexto
Erros médicos podem surgir desde o primeiro momento em que uma receita nasce. <br>
Entre os erros mais comuns estão:
- Erros de escrita ou digitação no nome e dosagem de farmacos;
- Ausência parcial ou total de posologia;
- Prescrição de medicamentos de listas controladas diferentes;
- Rasuras nos dados de identificação do médico ou paciente.
- Inexistência da assinatura do emitente.


Esses erros podem parecer pequenos a primeira vista, porém apresentam riscos eminentes a saúde de pacientes e ao sistema de saúde como um todo, visto que escalam para níveis críticos, onde o paciente pode não conseguir seguir o tratamento, ou pior, utilizar o medicamento errado. Diante de dificuldades para o entendimento ou obtenção do medicamento, por por exemplo perder a data de validade da receita (informação muitas vezes não conhecida pelo paciente), o paciente pode se automedicar ou procurar outras vias de conseguir o medicamento, por exemplo com a falsificação de receitas. 

## Objetivo Geral
Desenvolver um software que auxilie a prescrição de receitas médicas digitais, o envio da receita e o acesso por parte do paciente, além da dispensação por meio da farmácia, de forma prática e rápida.

## Objetivos Específicos
- [x] Criação da interface de prescrição de receitas para médicos.
- [x] Geração de token único para cada receita.
- [x] Geração do PDF da receita para visualização.
- [x] Acesso organizado a receitas atuais e anteriores do paciente.
- [ ] Sistema de validação de receitas para farmácias.
- [ ] Registro digital da dispensação dos medicamentos.

## Metodologia
Seguindo os conceitos de engenharia de software, a metodologia utilizada para a construção do sistema foi o **Desenvolvimento Incremental** que permite a construção do sistema em etapas.

### Método Ágil
Utilizamos o SCRUM como método ágil para o desenvolvimento dos módulos do sistema, como o sistema de emissão de receita por exemplo, onde separamos os objetivos do novo incremento do sistema e nos reuniamos diariamente para mostrar o que foi feito e a continuação. 

### Tecnologias Utilizadas
>**Backend**: *NestJS*

>**Frontend**: *React*

>**Banco de Dados**: *MySQL*

### ODS
O projeto se baseou no Objetivo de Desenvolvimento Sustentável número 3, da ONU, Saúde e Bem estar, que visa garantir o acesso à saúde de qualidade e promover o bem-estar para todos, em todas as idades.

Mais especificamente as metas:

3.8 - Atingir a cobertura universal de saúde, incluindo a proteção do risco financeiro, o acesso a serviços de saúde essenciais de qualidade e o acesso a medicamentos e vacinas essenciais seguros, eficazes, de qualidade e a preços acessíveis para todos.

3.b - Apoiar a pesquisa e o desenvolvimento de vacinas e medicamentos para as doenças transmissíveis e não transmissíveis, que afetam principalmente os países em desenvolvimento, proporcionar o acesso a medicamentos e vacinas essenciais a preços acessíveis, de acordo com a Declaração de Doha, que afirma o direito dos países em desenvolvimento de utilizarem plenamente as disposições do acordo TRIPS sobre flexibilidades para proteger a saúde pública e, em particular, proporcionar o acesso a medicamentos para todos.

3.d - Reforçar a capacidade de todos os países, particularmente os países em desenvolvimento, para o alerta precoce, redução de riscos e gerenciamento de riscos nacionais e globais de saúde.