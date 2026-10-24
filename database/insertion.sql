USE db_famed;

INSERT INTO lista_controle(codigo, descricao, validade_dias, uso_continuo_max_dias)
VALUES 	('C1', 'Medicamentos sujeitos a controle especial receita branca', 30, NULL),
		('ANTIMICROBIANO', 'Medicamentos Antimicrobianos de venda sob prescrição', 10, 60),
        ('COMUM', 'Medicamentos com ou sem prescrição médica sem controle especial', NULL, NULL);
        
INSERT INTO regra_dispensacao(lista_controle_id, permite_parcial, vigencia_inicio, vigencia_fim, base_legal)
VALUES	(1, FALSE, '2026-01-01', NULL, 'Portaria SVS/MS nº 344/1998'),
		(2, TRUE, '2026-01-01', NULL, 'RDC ANVISA nº 20/2011'),
		(3, TRUE, '2026-01-01', NULL, 'Lei nº 5.991/1973');

INSERT INTO medicamento(nome, dosagem, forma_farmaceutica,unidade_dose, lista_controle_id, ativo)
VALUES 	('Dipirona', '500 mg/mL', 'gotas', 'gota', 3, TRUE),
		('Paracetamol', '750 mg', 'comprimido', 'comprimido', 3, TRUE),
		('Ibuprofeno', '600 mg', 'comprimido', 'comprimido', 3, TRUE),
		('Omeprazol', '20 mg', 'cápsula', 'cápsula', 3, TRUE),
		('Levotiroxina', '50 mcg', 'comprimido', 'comprimido', 3, TRUE),
		('Amoxicilina', '500 mg', 'cápsula', 'cápsula', 2, TRUE),
		('Amoxicilina', '1 g', 'comprimido', 'comprimido', 2, TRUE),
		('Azitromicina', '500 mg', 'comprimido', 'comprimido', 2, TRUE),
        ('Fluoxetina', '20 mg', 'cápsula', 'cápsula', 1, TRUE),
		('Amitriptilina', '25 mg', 'comprimido', 'comprimido', 1, TRUE),
		('Haloperidol', '2 mg/mL', 'gotas', 'gota', 1, TRUE),
		('Teste', '1 g', 'comprimido', 'comprimido', 3, FALSE);

INSERT INTO cfm_registro(crm, uf, cpf, nome, situacao)
VALUES	('123456', 'SP', '12345678000', 'Thais Silva', 'ATIVO'),
		('234567', 'RJ', '23456789100', 'Thomaz Campos', 'ATIVO'),
		('345678', 'MG', '34567890200', 'Silas Felipe', 'SUSPENSO'),
		('567890', 'RS', '56789012400', 'Gustavo Maciel', 'CANCELADO'),
		('678901', 'BA', '67890123500', 'Heitor Leite', 'INATIVO');

INSERT INTO usuario (nome, email, senha_hash, perfil, situacao)
VALUES ('Super Admin Famed', 'super@famed.test', '$2b$10$tCZ/DSmPMhPf7Ywzl1WdsOZI.9RMDgKXGQrtXNPKkG35tri.RkFdC', 'ADMINISTRADOR', 'ATIVO');

INSERT INTO administrador (usuario_id, nivel_acesso)
VALUES (LAST_INSERT_ID(), 'SUPER_ADMIN');

INSERT INTO usuario (nome, email, senha_hash, perfil, situacao)
VALUES ('Admin Famed', 'admin@famed.test', '$2b$10$tCZ/DSmPMhPf7Ywzl1WdsOZI.9RMDgKXGQrtXNPKkG35tri.RkFdC', 'ADMINISTRADOR', 'ATIVO');

INSERT INTO administrador (usuario_id, nivel_acesso)
VALUES (LAST_INSERT_ID(), 'ADMIN');