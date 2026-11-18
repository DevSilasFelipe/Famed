USE db_famed;

DELIMITER $$

CREATE FUNCTION fn_idade_paciente(p_paciente_id INT UNSIGNED)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_idade INT;

    SELECT TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE())
      INTO v_idade
      FROM paciente
     WHERE usuario_id = p_paciente_id;

    RETURN v_idade;
END$$

DELIMITER ;