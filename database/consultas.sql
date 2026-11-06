USE db_famed;
-- =====================================================
-- BLOCO 1: USUÁRIOS
-- =====================================================

-- 1) Pacientes cadastrados, do mais novo para o mais antigo
--    (cadastrado_por é o médico que criou o paciente; NULL = auto-cadastro)

SELECT
	u.id,
    u.nome,
    u.email,
    u.situacao,
    p.cpf,
    p.data_nascimento,
    TIMESTAMPDIFF(YEAR, p.data_nascimento, CURDATE()) AS idade,
    um.nome AS cadastrado_por,
    u.criado_em
FROM usuario u
INNER JOIN paciente p ON p.usuario_id = u.id
LEFT JOIN usuario um  ON um.id = p.cadastrado_por
ORDER BY u.criado_em DESC;

-- 2) Médicos com total de receitas emitidas
SELECT
	u.id,
    u.nome,
    u.email,
    u.situacao,
    m.crm,
    m.uf,
	COUNT(r.id)			AS total_receitas,
    MAX(r.emitida_em)	AS ultima_receita_em
FROM usuario u
INNER JOIN medico m  ON m.usuario_id = u.id
LEFT  JOIN receita r ON r.medico_id = m.usuario_id
GROUP BY u.id, u.nome, u.email, u.situacao, m.crm, m.uf
ORDER BY total_receitas DESC, u.nome;

-- 3) Farmácias cadastradas, das mais novas para as mais antigas
SELECT
	u.id,
    u.nome,
    f.razao_social,
    f.cnpj,
    f.cnae,
    u.email,
    u.telefone,
    u.situacao,
    u.criado_em
FROM usuario u
INNER JOIN farmacia f ON f.usuario_id = u.id
ORDER BY u.criado_em DESC;

-- 4) Resumo de usuários por perfil e situação
--    (mostra rápido quantos estão PENDENTES)
SELECT 
	perfil,
    situacao,
    COUNT(*) AS total
FROM usuario
GROUP BY perfil, situacao
ORDER BY perfil, situacao;

-- 5) Administradores com nível de acesso, total de logins e último login
--    (só o login de ADMINISTRADOR é gravado no log_auditoria)
SELECT
	u.id,
    u.nome,
    u.email,
    a.nivel_acesso,
    u.situacao,
    u.criado_em,
    COUNT(l.id) 	   AS total_logins,
    MAX(l.ocorrido_em) AS ultimo_login
FROM usuario u
INNER JOIN administrador a ON a.usuario_id = u.id
LEFT JOIN  log_auditoria l ON l.usuario_id = u.id
						  AND l.acao = 'LOGIN'
GROUP BY u.id, u.nome, u.email, a.nivel_acesso, u.situacao, u.criado_em
ORDER BY a.nivel_acesso DESC, u.nome;

-- =====================================================
-- BLOCO 2: RECEITAS
-- =====================================================

-- 6) Itens de uma receita específica (troque o id na variável)
SET @receita_id = 1;

SELECT 
	i.id     AS item_id,
    med.nome AS medicamento,
    med.dosagem, 
    med.forma_farmaceutica,
    i.quantidade,
    i.dose,
    med.unidade_dose,
    i.duracao_dias,
    i.condicao_uso,
    i.posologia
FROM item_receita i
INNER JOIN medicamento med ON med.id = i.medicamento_id
WHERE i.receita_id = @receita_id
ORDER BY i.id;

-- 7) Resumo de cada receita: lista, nº de itens, total de unidades e situação
SELECT
	r.id,
    r.token,
    r.medico_nome,
    r.paciente_nome,
    l.codigo	AS lista,
    l.descricao AS lista_descricao,
    r.uso_continuo,
    r.emitida_em,
    r.data_validade,
    COUNT(i.id)					   AS total_itens,
    COALESCE(SUM(i.quantidade), 0) AS total_unidades,
    COALESCE(sr.situacao, 'NAO_DISPENSADA') AS situacao
FROM receita r
INNER JOIN lista_controle l 	  ON l.id = r.lista_controle_id
LEFT JOIN  item_receita i   	  ON i.receita_id  = r.id
LEFT JOIN  vw_situacao_receita sr ON sr.receita_id = r.id
GROUP BY r.id, r.token, r.medico_nome, r.paciente_nome, l.codigo, l.descricao,
		 r.uso_continuo, r.emitida_em, r.data_validade, sr.situacao
ORDER BY r.emitida_em DESC;

-- 8) Medicamentos mais prescritos (inclui os nunca prescritos, com total 0)
SELECT 
	med.id, 
    med.nome,
    med.dosagem,
    med.forma_farmaceutica,
    l.codigo AS lista,
    med.ativo,
    COUNT(i.id) AS vezes_prescrito,
    COALESCE(SUM(i.quantidade), 0) AS total_unidades
FROM medicamento med
INNER JOIN lista_controle l ON l.id = med.lista_controle_id
LEFT  JOIN item_receita i   ON i.medicamento_id = med.id
GROUP BY med.id, med.nome, med.dosagem, med.forma_farmaceutica, l.codigo, med.ativo
ORDER BY vezes_prescrito DESC, med.nome;

-- 9) Receitas ainda não totalmente dispensadas, vencidas ou que vencem em N dias
--    (dias_restantes negativo = já venceu)
SET @dias = 7;

SELECT 
	r.id,
    r.token,
    r.paciente_nome,
    r.medico_nome,
    l.codigo AS lista,
    r.emitida_em,
    r.data_validade,
    DATEDIFF(r.data_validade, CURDATE())    AS dias_restantes,
    COALESCE(sr.situacao, 'NAO_DISPENSADA') AS situacao
FROM receita r
INNER JOIN lista_controle l       ON l.id = r.lista_controle_id
LEFT  JOIN vw_situacao_receita sr ON sr.receita_id = r.id
WHERE r.data_validade IS NOT NULL
	AND r.data_validade <= DATE_ADD(CURDATE(), INTERVAL @dias DAY)
    AND COALESCE(sr.situacao, 'NAO_DISPENSADA') <> 'DISPENSADA'
ORDER BY r.data_validade;


-- =====================================================
-- BLOCO 3: LOG DE AUDITORIA
-- =====================================================

-- 10) Últimas 50 ações registradas
SELECT 
	l.id,
    l.ocorrido_em,
    u.nome,
    u.perfil,
    l.acao,
    l.entidade,
    l.entidade_id,
    l.sucesso,
    l.ip
FROM log_auditoria l
INNER JOIN usuario u ON u.id = l.usuario_id
ORDER BY l.ocorrido_em DESC, l.id DESC
LIMIT 50;

-- 11) Ações por perfil e tipo, com total de sucessos e falhas
SELECT 
	u.perfil,
    l.acao,
    COUNT(*)			   AS total,
    SUM(l.sucesso = TRUE)  AS sucessos,
    SUM(l.sucesso = FALSE) AS falhas,
    MAX(l.ocorrido_em)	   AS ultima_ocorrencia
FROM log_auditoria l
INNER JOIN usuario u ON u.id = l.usuario_id
GROUP BY u.perfil, l.acao
ORDER BY u.perfil, total DESC;

-- 12) Trilha de uma receita: tudo que aconteceu com ela, em ordem cronológica
--     (emissão, download de PDF, consulta de token)
SET @receita_id = 1; -- Troque o id na variável pela receita desejada

SELECT
	l.ocorrido_em,
    u.nome, 
    u.perfil,
    l.acao,
    l.sucesso,
    l.ip
FROM log_auditoria l
INNER JOIN usuario u ON u.id = l.usuario_id
WHERE l.entidade = 'receita'
	AND l.entidade_id = @receita_id
ORDER BY l.ocorrido_em, l.id;