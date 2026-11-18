USE db_famed;

DELIMITER $$

CREATE PROCEDURE sp_receitas_do_medico(IN p_medico_id INT UNSIGNED)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM medico WHERE usuario_id = p_medico_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Médico não encontrado.';
    END IF;

    SELECT r.id AS receita_id,
           r.emitida_em,
           r.paciente_nome,
           fn_idade_paciente(r.paciente_id) AS idade_paciente,
           lc.descricao AS lista_controle,
           r.data_validade,
           COUNT(i.id) AS qtd_itens
      FROM receita r
      JOIN lista_controle lc ON lc.id = r.lista_controle_id
      LEFT JOIN item_receita i ON i.receita_id = r.id
     WHERE r.medico_id = p_medico_id
     GROUP BY r.id, r.emitida_em, r.paciente_nome, r.paciente_id,
              lc.descricao, r.data_validade
     ORDER BY r.emitida_em DESC;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE sp_cancelar_dispensacao(
    IN p_dispensacao_id INT UNSIGNED,
    IN p_motivo         VARCHAR(255)
)
BEGIN
    DECLARE v_item      INT UNSIGNED;
    DECLARE v_farmacia  INT UNSIGNED;
    DECLARE v_qtd       SMALLINT UNSIGNED;
    DECLARE v_novo_id   INT UNSIGNED;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT item_receita_id, farmacia_id, quantidade
      INTO v_item, v_farmacia, v_qtd
      FROM dispensacao
     WHERE id = p_dispensacao_id
       AND tipo_evento = 'DISPENSACAO';

    IF v_item IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Dispensação não encontrada.';
    END IF;

    START TRANSACTION;

    INSERT INTO dispensacao
        (item_receita_id, farmacia_id, tipo_evento, quantidade,
         dispensacao_cancelada_id, motivo)
    VALUES
        (v_item, v_farmacia, 'CANCELAMENTO', v_qtd,
         p_dispensacao_id, p_motivo);

    SET v_novo_id = LAST_INSERT_ID();

    INSERT INTO log_auditoria (usuario_id, acao, entidade, entidade_id)
    VALUES (v_farmacia, 'CANCELAR_DISPENSACAO', 'dispensacao', v_novo_id);

    COMMIT;

    SELECT v_novo_id AS cancelamento_id;
END$$

DELIMITER ;