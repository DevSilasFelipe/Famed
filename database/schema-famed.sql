CREATE DATABASE IF NOT EXISTS db_famed
	CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;
USE db_famed;

CREATE TABLE lista_controle(
	id		    TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    codigo      VARCHAR(20) NOT NULL,
    descricao 	VARCHAR(100) NOT NULL,
    validade_dias 		  SMALLINT UNSIGNED NULL,
    uso_continuo_max_dias SMALLINT UNSIGNED NULL,
    
    CONSTRAINT uq_lista_controle_codigo UNIQUE (codigo),
    CONSTRAINT ck_lista_controle_validade_dias
		CHECK (validade_dias IS NULL OR validade_dias > 0),
	CONSTRAINT ck_lista_uso_continuo
		CHECK (uso_continuo_max_dias IS NULL OR 
			   uso_continuo_max_dias >= validade_dias)
);

CREATE TABLE usuario(
	id	       INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nome	   VARCHAR(150) NOT NULL, 
    email      VARCHAR(150) NULL,
    senha_hash VARCHAR(255) NULL,
    perfil	   ENUM('MEDICO','PACIENTE','FARMACIA','ADMINISTRADOR') NOT NULL,
    situacao   ENUM('PENDENTE','ATIVO','INATIVO') NOT NULL DEFAULT 'PENDENTE',
    telefone   VARCHAR(20) NULL,
    endereco   VARCHAR(255) NULL,
    criado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
						   ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT uq_usuario_id_perfil UNIQUE (id, perfil),
    CONSTRAINT ck_usuario_situacao 
		CHECK (situacao = 'PENDENTE' OR (email IS NOT NULL AND senha_hash IS NOT NULL))
);

CREATE TABLE cfm_registro(
	id			INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    crm			VARCHAR(10) NOT NULL,
    uf			CHAR(2) NOT NULL,
    cpf			CHAR(11) NOT NULL,
    nome		VARCHAR(150) NOT NULL,
    situacao	ENUM('ATIVO','SUSPENSO','CANCELADO','INATIVO') NOT NULL,
    
    CONSTRAINT uq_cfm_crm_uf UNIQUE (crm, uf),
    CONSTRAINT uq_cfm_cpf_uf UNIQUE (cpf, uf),
    CONSTRAINT ck_crm_registro_cpf
		CHECK (REGEXP_LIKE(cpf, '^[0-9]{11}$')),
    CONSTRAINT ck_cfm_registro_crm 
		CHECK (REGEXP_LIKE(crm, '^[0-9]+$')),
    CONSTRAINT ck_cfm_registro_uf
		CHECK (REGEXP_LIKE(uf, '^[A-Z]{2}$', 'c'))
);

CREATE TABLE medicamento(
	id					INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    nome				VARCHAR(150) NOT NULL,
    dosagem				VARCHAR(30) NOT NULL,
    forma_farmaceutica	VARCHAR(50) NOT NULL,
    unidade_dose		VARCHAR(20) NOT NULL,
    lista_controle_id	TINYINT UNSIGNED NOT NULL,
    ativo				BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT fk_medicamento_lista FOREIGN KEY (lista_controle_id)
		REFERENCES lista_controle (id) ON DELETE RESTRICT,
	CONSTRAINT uq_medicamento_nome_dosagem_forma 
		UNIQUE (nome, dosagem, forma_farmaceutica)
);

DELIMITER $$
CREATE TRIGGER trg_medicamento_imutavel
BEFORE UPDATE ON medicamento
FOR EACH ROW 
BEGIN
	IF NEW.nome				  <> OLD.nome
    OR NEW.dosagem 			  <> OLD.dosagem
    OR NEW.forma_farmaceutica <> OLD.forma_farmaceutica
    OR NEW.unidade_dose 	  <> OLD.unidade_dose
    OR NEW.lista_controle_id  <> OLD.lista_controle_id THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Identidade do medicamento é imutável; só "medicamento.ativo" pode mudar.';
	END IF;
END$$
DELIMITER ;

CREATE TABLE regra_dispensacao(
	id	INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    lista_controle_id	TINYINT UNSIGNED NOT NULL,
    permite_parcial 	BOOLEAN NOT NULL,
    vigencia_inicio	DATE NOT NULL,
    vigencia_fim	DATE NULL,
    base_legal	VARCHAR(255) NOT NULL, 
    
    CONSTRAINT fk_regra_lista FOREIGN KEY (lista_controle_id)
		REFERENCES lista_controle (id) ON DELETE RESTRICT,
	CONSTRAINT uq_regra_lista_inicio 
		UNIQUE (lista_controle_id, vigencia_inicio),
	CONSTRAINT ck_regra_vigencia_fim 
		CHECK (vigencia_fim IS NULL OR vigencia_fim >= vigencia_inicio)
);

DELIMITER $$
CREATE TRIGGER trg_regra_sem_sobreposicao_ins
BEFORE INSERT ON regra_dispensacao
FOR EACH ROW 
BEGIN 
	IF EXISTS (
		SELECT 1
        FROM regra_dispensacao r
        WHERE r.lista_controle_id = NEW.lista_controle_id
			AND r.vigencia_inicio <= COALESCE(NEW.vigencia_fim, '9999-12-31')
            AND NEW.vigencia_inicio <= COALESCE(r.vigencia_fim, '9999-12-31')
	) THEN 
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Já existe regra vigente para essa lista no período informado.';
	END IF;
END$$

CREATE TRIGGER trg_regra_sem_sobreposicao_upd
BEFORE UPDATE ON regra_dispensacao
FOR EACH ROW
BEGIN
	IF EXISTS (
		SELECT 1
        FROM regra_dispensacao r
        WHERE r.lista_controle_id = NEW.lista_controle_id
			AND r.id <> OLD.id
            AND r.vigencia_inicio <= COALESCE(NEW.vigencia_fim, '9999-12-31')
            AND NEW.vigencia_inicio <= COALESCE(r.vigencia_fim, '9999-12-31')
	) THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Já existe regra vigente para essa lista no período informado.';
	END IF;
END$$
DELIMITER ;

CREATE TABLE medico(
	usuario_id 		INT UNSIGNED PRIMARY KEY,
    perfil 			ENUM('MEDICO','PACIENTE','FARMACIA','ADMINISTRADOR') NOT NULL DEFAULT 'MEDICO',
    cpf 			CHAR(11) NOT NULL,
    crm 			VARCHAR(10) NOT NULL,
    uf 				CHAR(2) NOT NULL,
    chave_publica 	TEXT NOT NULL,
    
    CONSTRAINT fk_medico_usuario FOREIGN KEY (usuario_id, perfil)
		REFERENCES usuario (id, perfil) ON DELETE RESTRICT,
	CONSTRAINT uq_medico_cpf 	UNIQUE (cpf),
    CONSTRAINT uq_medico_crm_uf UNIQUE (crm, uf),
    CONSTRAINT ck_medico_perfil CHECK (perfil = 'MEDICO'),
    CONSTRAINT ck_medico_cpf 	CHECK (REGEXP_LIKE(cpf, '^[0-9]{11}$')),
	CONSTRAINT ck_medico_crm 	CHECK (REGEXP_LIKE(crm, '^[0-9]+$')),
    CONSTRAINT ck_medico_uf 	CHECK (REGEXP_LIKE(uf, '^[A-Z]{2}$', 'c'))
);

DELIMITER $$
CREATE TRIGGER trg_medico_imutavel
BEFORE UPDATE ON medico
FOR EACH ROW
BEGIN
    IF NEW.cpf 			 <> OLD.cpf
    OR NEW.crm 			 <> OLD.crm
    OR NEW.uf 			 <> OLD.uf
    OR NEW.chave_publica <> OLD.chave_publica THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Dados de identificação profissional do médico são imutáveis.';
	END IF;
END$$

DELIMITER ;

CREATE TABLE paciente(
	usuario_id		INT UNSIGNED PRIMARY KEY,
    perfil			ENUM('MEDICO','PACIENTE','FARMACIA','ADMINISTRADOR') 
						NOT NULL DEFAULT 'PACIENTE',
    cpf				CHAR(11) NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo 			CHAR(1) NULL,
    cadastrado_por	INT UNSIGNED NULL,
    
    CONSTRAINT fk_paciente_usuario FOREIGN KEY (usuario_id, perfil)
		REFERENCES usuario (id, perfil) ON DELETE RESTRICT,
	CONSTRAINT fk_paciente_cadastrado_por FOREIGN KEY (cadastrado_por)
		REFERENCES medico (usuario_id) ON DELETE RESTRICT,
	CONSTRAINT uq_paciente_cpf UNIQUE (cpf),
	CONSTRAINT ck_paciente_perfil CHECK (perfil = 'PACIENTE'),
    CONSTRAINT ck_paciente_cpf CHECK (REGEXP_LIKE(cpf, '^[0-9]{11}$')),
    CONSTRAINT ck_paciente_data_nascimento CHECK (data_nascimento >= '1900-01-01'),
    CONSTRAINT ck_paciente_sexo CHECK (sexo IS NULL OR REGEXP_LIKE(sexo, '^[MF]$', 'c'))
);

DELIMITER $$
CREATE TRIGGER trg_paciente_nascimento_ins
BEFORE INSERT ON paciente
FOR EACH ROW
BEGIN 
	IF NEW.data_nascimento > CURDATE() THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'A data de nascimento não pode ser futura.';
	END IF;
END$$

CREATE TRIGGER trg_paciente_nascimento_upd
BEFORE UPDATE ON paciente
FOR EACH ROW
BEGIN
	IF NEW.data_nascimento > CURDATE() THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'A data de nascimento não pode ser futura.';
	END IF;
END$$

CREATE TRIGGER trg_paciente_cpf_imutavel
BEFORE UPDATE ON paciente
FOR EACH ROW
BEGIN
	IF NEW.cpf <> OLD.cpf THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'O CPF do paciente é imutável.';
	END IF;
END$$
DELIMITER ;

CREATE TABLE farmacia(
	usuario_id		INT UNSIGNED PRIMARY KEY,
    perfil			ENUM('MEDICO','PACIENTE','FARMACIA','ADMINISTRADOR')
						NOT NULL DEFAULT 'FARMACIA',
    cnpj			CHAR(14) NOT NULL,
    razao_social	VARCHAR(150) NOT NULL,
    cnae			CHAR(7) NOT NULL,
    
    CONSTRAINT fk_farmacia_usuario FOREIGN KEY (usuario_id, perfil)
		REFERENCES usuario(id, perfil) ON DELETE RESTRICT,
	CONSTRAINT uq_farmacia_cnpj 	UNIQUE (cnpj),
	CONSTRAINT ck_farmacia_perfil 	CHECK (perfil = 'FARMACIA'),
    CONSTRAINT ck_farmacia_cnpj 	CHECK (REGEXP_LIKE(cnpj, '^[0-9]{14}$')),
    CONSTRAINT ck_farmacia_cnae 	CHECK (REGEXP_LIKE(cnae, '^47717[0-9]{2}$'))
);

CREATE TABLE administrador(
	usuario_id		INT UNSIGNED PRIMARY KEY,
    perfil			ENUM('MEDICO','PACIENTE','FARMACIA','ADMINISTRADOR')
						NOT NULL DEFAULT 'ADMINISTRADOR',
    nivel_acesso	ENUM('ADMIN','SUPER_ADMIN') 
						NOT NULL DEFAULT 'ADMIN',
    
    CONSTRAINT fk_administrador_usuario FOREIGN KEY (usuario_id, perfil)
		REFERENCES usuario (id, perfil) ON DELETE RESTRICT,
	CONSTRAINT ck_administrador_perfil CHECK (perfil = 'ADMINISTRADOR')
);

CREATE TABLE receita(
	id					INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    medico_id			INT UNSIGNED NOT NULL,
    paciente_id 		INT UNSIGNED NOT NULL,
    lista_controle_id	TINYINT UNSIGNED NOT NULL,
    uso_continuo		BOOLEAN NOT NULL DEFAULT FALSE,
    token				CHAR(6) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    numero_sncr			VARCHAR(30) NULL, 
    emitida_em			DATETIME NOT NULL,
    data_validade		DATE NULL,
    hash_sha256			CHAR(64) NOT NULL,
    assinatura_digital	TEXT NOT NULL,
    medico_nome			VARCHAR(150) NOT NULL,
    paciente_nome		VARCHAR(150) NOT NULL,
	paciente_endereco 	VARCHAR(255) NOT NULL,
    
    CONSTRAINT fk_receita_medico FOREIGN KEY (medico_id)
		REFERENCES medico (usuario_id) ON DELETE RESTRICT,
	CONSTRAINT fk_receita_paciente FOREIGN KEY (paciente_id)
		REFERENCES paciente (usuario_id) ON DELETE RESTRICT,
	CONSTRAINT fk_receita_lista FOREIGN KEY (lista_controle_id)
		REFERENCES lista_controle (id) ON DELETE RESTRICT,
	CONSTRAINT uq_receita_token UNIQUE (token),
    CONSTRAINT uq_receita_numero_sncr UNIQUE (numero_sncr),
    CONSTRAINT ck_receita_data_validade
		CHECK (data_validade IS NULL OR data_validade >= DATE(emitida_em)),
	CONSTRAINT ck_receita_token
		CHECK (REGEXP_LIKE(token, '^[A-Za-z0-9]{6}$', 'c'))
);

DELIMITER $$
CREATE TRIGGER trg_receita_imutavel_upd
BEFORE UPDATE ON receita
FOR EACH ROW
BEGIN 
	SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Receita emitida é imutável e não pode ser alterada.';
END $$
DELIMITER ; 

CREATE TABLE item_receita(
	id						INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    receita_id				INT UNSIGNED NOT NULL,
    medicamento_id			INT UNSIGNED NOT NULL,
    quantidade				SMALLINT UNSIGNED NOT NULL,
    duracao_dias			SMALLINT UNSIGNED NULL,
    dose					DECIMAL(6,2) NOT NULL,
    intervalo_valor			SMALLINT UNSIGNED NOT NULL,
    intervalo_unidade		ENUM('HORAS','DIAS','SEMANAS') NOT NULL,
    condicao_uso			VARCHAR(60) NULL,
    posologia				VARCHAR(255) NOT NULL,
    
    CONSTRAINT fk_item_receita_receita FOREIGN KEY (receita_id)
		REFERENCES receita (id) ON DELETE RESTRICT,
	CONSTRAINT fk_item_receita_medicamento FOREIGN KEY (medicamento_id)
		REFERENCES medicamento (id) ON  DELETE RESTRICT,
	CONSTRAINT uq_item_receita_receita_medicamento UNIQUE (receita_id, medicamento_id),
	CONSTRAINT ck_item_receita_quantidade CHECK (quantidade > 0),
    CONSTRAINT ck_item_receita_duracao_dias CHECK (duracao_dias IS NULL OR duracao_dias > 0),
    CONSTRAINT ck_item_receita_dose CHECK (dose > 0),
    CONSTRAINT ck_item_receita_intervalo_valor CHECK (intervalo_valor > 0)
);

DELIMITER $$
CREATE TRIGGER trg_item_receita_lista
BEFORE INSERT ON item_receita
FOR EACH ROW
BEGIN
	DECLARE v_lista_med		TINYINT UNSIGNED;
	DECLARE v_codigo_med	VARCHAR(20);
    DECLARE v_lista_rec		TINYINT UNSIGNED;
    
    SELECT m.lista_controle_id, l.codigo
		INTO v_lista_med, v_codigo_med
        FROM medicamento m
        JOIN lista_controle l ON l.id = m.lista_controle_id
	WHERE m.id = NEW.medicamento_id;
    
    SELECT lista_controle_id
		INTO v_lista_rec
        FROM receita
	WHERE id = NEW.receita_id;
    
    IF v_codigo_med <> 'COMUM' AND v_lista_med <> v_lista_rec THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Medicamentos de listas especiais diferentes NÃO podem ser misturados na mesma receita.';
	END IF;
END $$

CREATE TRIGGER trg_item_receita_ativo
BEFORE INSERT ON item_receita
FOR EACH ROW
BEGIN
	IF (SELECT ativo FROM medicamento WHERE id = NEW.medicamento_id) = FALSE THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Medicamento inativo não pode ser prescrito.';
	END IF;
END $$

CREATE TRIGGER trg_item_receita_imutavel_upd
BEFORE UPDATE ON item_receita
FOR EACH ROW
BEGIN
	SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Item prescrito na receita é permanente e não pode ser alterado.';
END $$
DELIMITER ;

CREATE TABLE dispensacao(
	id							INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    item_receita_id				INT UNSIGNED NOT NULL,
    farmacia_id					INT UNSIGNED NOT NULL,
    tipo_evento					ENUM('DISPENSACAO','CANCELAMENTO') NOT NULL,
    quantidade					SMALLINT UNSIGNED NOT NULL,
    dispensacao_cancelada_id	INT UNSIGNED NULL,
    motivo						VARCHAR(255) NULL,
    registrado_em				DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_dispensacao_item FOREIGN KEY (item_receita_id)
		REFERENCES item_receita (id) ON DELETE RESTRICT,
	CONSTRAINT fk_dispensacao_farmacia FOREIGN KEY (farmacia_id)
		REFERENCES farmacia (usuario_id) ON DELETE RESTRICT,
	CONSTRAINT fk_dispensacao_cancelada FOREIGN KEY (dispensacao_cancelada_id)
		REFERENCES dispensacao (id) ON DELETE RESTRICT,
	CONSTRAINT ck_dispensacao_quantidade CHECK (quantidade > 0),
    CONSTRAINT ck_dispensacao_cancelada_origem 
		CHECK (
			(tipo_evento = 'DISPENSACAO' AND dispensacao_cancelada_id IS NULL)
            OR (tipo_evento = 'CANCELAMENTO' AND dispensacao_cancelada_id IS NOT NULL
				AND motivo IS NOT NULL)
		)
);

DELIMITER $$
CREATE TRIGGER trg_dispensacao_parcial
BEFORE INSERT ON dispensacao
FOR EACH ROW
BEGIN 
	DECLARE v_qtd_item	SMALLINT UNSIGNED;
	DECLARE v_lista		TINYINT UNSIGNED;
    DECLARE v_parcial	BOOLEAN DEFAULT NULL;
    DECLARE v_saldo		INT;
    
    IF NEW.tipo_evento = 'DISPENSACAO' THEN
		SELECT i.quantidade, m.lista_controle_id
			INTO v_qtd_item, v_lista
			FROM item_receita i
			JOIN medicamento m ON m.id = i.medicamento_id
        WHERE i.id = NEW.item_receita_id;
        
        SELECT r.permite_parcial
			INTO v_parcial
			FROM regra_dispensacao r
        WHERE r.lista_controle_id = v_lista
			AND r.vigencia_inicio <= CURDATE()
            AND (r.vigencia_fim IS NULL OR r.vigencia_fim >= CURDATE())
		LIMIT 1;
        
        SELECT v_qtd_item
				- COALESCE(SUM(CASE WHEN tipo_evento = 'DISPENSACAO' THEN quantidade END), 0)
				+ COALESCE(SUM(CASE WHEN tipo_evento = 'CANCELAMENTO' THEN quantidade END), 0)
            INTO v_saldo 
            FROM dispensacao
		WHERE item_receita_id = NEW.item_receita_id;
        
        IF v_parcial IS NULL THEN
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'Não há regra de dispensação vigente para esta lista.';
		END IF;
        IF NEW.quantidade > v_saldo THEN
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'Quantidade maior que o saldo do item.';
		END IF;
        IF v_parcial = FALSE AND NEW.quantidade <> v_saldo THEN
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'Esta lista não permite dispensação parcial: dispense o saldo inteiro.';
		END IF;
	END IF;
END $$

CREATE TRIGGER trg_dispensacao_validade
BEFORE INSERT ON dispensacao
FOR EACH ROW
BEGIN
	DECLARE v_receita	INT UNSIGNED;
	DECLARE v_validade 	DATE;
    DECLARE v_continuo	BOOLEAN;
    DECLARE v_max_dias	SMALLINT UNSIGNED;
    DECLARE v_primeira 	DATE;
    DECLARE v_limite	DATE;
    
    IF NEW.tipo_evento = 'DISPENSACAO' THEN
		SELECT r.id, r.data_validade, r.uso_continuo, l.uso_continuo_max_dias
			INTO v_receita, v_validade, v_continuo, v_max_dias
            FROM item_receita i
            JOIN receita r 			ON r.id = i.receita_id
            JOIN lista_controle l 	ON l.id = r.lista_controle_id
		WHERE i.id = NEW.item_receita_id;
        
        SELECT DATE(MIN(d.registrado_em))
			INTO v_primeira
            FROM dispensacao d
            JOIN item_receita i2 ON i2.id = d.item_receita_id
		WHERE i2.receita_id = v_receita
			AND d.tipo_evento = 'DISPENSACAO';
		
        IF v_continuo = TRUE AND v_max_dias IS NOT NULL AND v_primeira IS NOT NULL THEN
			SET v_limite = DATE_ADD(v_primeira, INTERVAL v_max_dias DAY);
		ELSE
			SET v_limite = v_validade;
		END IF;
        
        IF v_limite IS NOT NULL AND v_limite < CURDATE() THEN
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'Receita vencida ou prazo do tratamento contínuo encerrado.';
		END IF;
	END IF;
END $$

CREATE TRIGGER trg_dispensacao_cancelamento
BEFORE INSERT ON dispensacao
FOR EACH ROW
BEGIN 
	DECLARE v_tipo			VARCHAR(20);
    DECLARE v_item			INT UNSIGNED;
    DECLARE v_farmacia		INT UNSIGNED;
    DECLARE v_qtd_origem	SMALLINT UNSIGNED;
    DECLARE v_ja_cancelado	INT;
    
    IF NEW.tipo_evento = 'CANCELAMENTO' THEN
		SELECT tipo_evento, item_receita_id, farmacia_id, quantidade
			INTO v_tipo, v_item, v_farmacia, v_qtd_origem
            FROM dispensacao
		WHERE id = NEW.dispensacao_cancelada_id;
        
        IF v_tipo IS NULL OR v_tipo <> 'DISPENSACAO'
			OR v_item <> NEW.item_receita_id
            OR v_farmacia <> NEW.farmacia_id THEN
				SIGNAL SQLSTATE '45000'
					SET MESSAGE_TEXT = 'O cancelamento deve apontar para uma dispensação do mesmo item e da mesma farmácia.';
		END IF;
        
        SELECT COALESCE(SUM(quantidade), 0)
			INTO v_ja_cancelado
            FROM dispensacao
		WHERE dispensacao_cancelada_id = NEW.dispensacao_cancelada_id;
        
        IF v_ja_cancelado + NEW.quantidade > v_qtd_origem THEN
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'A quantidade cancelada ultrapassa a da dispensação original.';
		END IF;
	END IF;
END $$

CREATE TRIGGER trg_dispensacao_imutavel_upd
BEFORE UPDATE ON dispensacao
FOR EACH ROW
BEGIN
	SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Dispensação registrada é permanente e não pode ser alterada. Para desfazer, registre um cancelamento.';
END $$

DELIMITER ;

CREATE TABLE log_auditoria(
	id			BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    usuario_id	INT UNSIGNED NOT NULL,
    acao		VARCHAR(40) NOT NULL,
    entidade	VARCHAR(40) NOT NULL,
    entidade_id	INT UNSIGNED NULL,
    sucesso		BOOLEAN NOT NULL DEFAULT TRUE,
    ocorrido_em	DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip			VARCHAR(45) NULL,
    detalhes	JSON NULL,
    
    CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuario (id) ON DELETE RESTRICT,
	INDEX idx_log_entidade 	   (entidade, entidade_id),
    INDEX idx_log_usuario_data (usuario_id, ocorrido_em)
);

DELIMITER $$
CREATE TRIGGER trg_log_imutavel_upd
BEFORE UPDATE ON log_auditoria
FOR EACH ROW
BEGIN
	SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Log registrado é imutável e não pode ser alterado';
END $$
DELIMITER ;

-- TRIGGERS DE IMUTABILIDADE TOTAL (DELETE)
DELIMITER $$
CREATE TRIGGER trg_receita_imutavel_del
BEFORE DELETE ON receita
FOR EACH ROW
BEGIN
	SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Receita emitida é permanente e não pode ser apagada.';
END $$

CREATE TRIGGER trg_item_receita_imutavel_del
BEFORE DELETE ON item_receita
FOR EACH ROW
BEGIN
	SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Item prescrito na receita é permanente e não pode ser apagado.';
END $$

CREATE TRIGGER trg_dispensacao_imutavel_del
BEFORE DELETE ON dispensacao
FOR EACH ROW
BEGIN
	SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Dispensação registrada é permanente e não pode ser apagada. Para desfazer, registre um cancelamento.';
END $$

CREATE TRIGGER trg_log_imutavel_del
BEFORE DELETE ON log_auditoria
FOR EACH ROW
BEGIN
	SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Log registrado é imutável e não pode ser deletado.';
END $$
DELIMITER ;