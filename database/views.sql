USE db_famed;

-- 1) saldo de cada item (dispensação)
CREATE OR REPLACE VIEW vw_saldo_item AS 
SELECT 
	i.id			AS item_receita_id,
    i.receita_id,
    i.medicamento_id,
    i.quantidade	AS quantidade_prescrita,
    COALESCE(SUM(CASE WHEN d.tipo_evento = 'DISPENSACAO' THEN d.quantidade END), 0)  AS total_dispensado,
    COALESCE(SUM(CASE WHEN d.tipo_evento = 'CANCELAMENTO' THEN d.quantidade END), 0) AS total_cancelado,
    i.quantidade
		- COALESCE(SUM(CASE WHEN d.tipo_evento = 'DISPENSACAO'  THEN d.quantidade END), 0)
        + COALESCE(SUM(CASE WHEN d.tipo_evento = 'CANCELAMENTO' THEN d.quantidade END), 0) AS saldo
FROM item_receita i
LEFT JOIN dispensacao d ON d.item_receita_id = i.id
GROUP BY i.id, i.receita_id, i.medicamento_id, i.quantidade;

-- auxiliar: situação da receita
CREATE OR REPLACE VIEW vw_situacao_receita AS
SELECT 
	receita_id,
    CASE 
		WHEN SUM(saldo) = 0							THEN 'DISPENSADA'
        WHEN SUM(saldo) < SUM(quantidade_prescrita)	THEN 'PARCIAL'
        ELSE 'NAO_DISPENSADA'
	END AS situacao
FROM vw_saldo_item
GROUP BY receita_id;

-- 2) meus pacientes (médico)
CREATE OR REPLACE VIEW vw_meus_pacientes AS
SELECT 
	r.medico_id,
    r.paciente_id,
    u.nome AS paciente_nome,
    p.cpf,
    p.data_nascimento, 
    TIMESTAMPDIFF(YEAR, p.data_nascimento, CURDATE()) AS idade,
    u.telefone,
    COUNT(*)			AS total_receitas,
    MAX(r.emitida_em) 	AS ultima_receita_em
FROM receita r
JOIN paciente p ON p.usuario_id = r.paciente_id
JOIN usuario u ON u.id = r.paciente_id
GROUP BY r.medico_id, r.paciente_id, u.nome, p.cpf, p.data_nascimento, u.telefone;

-- 3) minhas receitas (médico)
CREATE OR REPLACE VIEW vw_minhas_receitas_medico AS
SELECT 
	r.medico_id,
    r.id 			AS receita_id,
    r.token,
    r.paciente_id,
    r.paciente_nome,
    l.codigo 		AS lista,
    r.uso_continuo,
    r.emitida_em,
    r.data_validade,
    COALESCE(sr.situacao, 'NAO_DISPENSADA') AS situacao
FROM receita r
JOIN lista_controle l ON l.id = r.lista_controle_id
LEFT JOIN vw_situacao_receita sr ON sr.receita_id = r.id;

-- 4) minhas receitas (paciente), com o token que ele leva à farmácia
CREATE OR REPLACE VIEW vw_minhas_receitas_paciente AS
SELECT 
	r.paciente_id, 
    r.id		AS receita_id,
    r.token,
    r.medico_nome,
    m.crm,
    m.uf		AS crm_uf,
    l.codigo 	AS lista,
    r.uso_continuo,
    r.emitida_em,
    r.data_validade,
    COALESCE(sr.situacao, 'NAO_DISPENSADA') AS situacao
FROM receita r
JOIN medico m ON m.usuario_id = r.medico_id
JOIN lista_controle l ON l.id = r.lista_controle_id
LEFT JOIN vw_situacao_receita sr ON sr.receita_id = r.id;

-- 5) receitas dispensadas (farmácia): um evento por linha
CREATE OR REPLACE VIEW vw_receitas_dispensadas_farmacia AS
SELECT 
	d.farmacia_id,
    d.id			AS dispensacao_id,
    d.registrado_em,
    d.tipo_evento,
    d.quantidade,
    d.dispensacao_cancelada_id,
    d.motivo,
    (SELECT COALESCE(SUM(c.quantidade), 0)
		FROM dispensacao c
        WHERE c.dispensacao_cancelada_id = d.id) AS quantidade_cancelada,
	r.id AS receita_id,
    r.token,
    r.paciente_nome, 
    r.medico_nome,
    med.nome AS medicamento,
    med.dosagem,
    med.forma_farmaceutica
FROM dispensacao d
JOIN item_receita i  ON i.id = d.item_receita_id
JOIN receita r		 ON r.id = i.receita_id
JOIN medicamento med ON med.id = i.medicamento_id;
	