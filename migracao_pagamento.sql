-- Amplia os meios de pagamento aceitos em PAGAMENTO, preservando os dados.
-- Uso (na pasta do projeto, com o servidor parado): sqlite3 loja.db < migracao_pagamento.sql
PRAGMA foreign_keys = OFF;
BEGIN;

CREATE TABLE PAGAMENTO_NOVO (
    id_pagamento         INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido            INTEGER       NOT NULL REFERENCES PEDIDO(id_pedido),
    forma_pagamento      VARCHAR(20)   NOT NULL CHECK (forma_pagamento IN ('pix','cartao_credito','cartao_debito','boleto','saldo_mp')),
    parcelas             INTEGER       NOT NULL DEFAULT 1 CHECK (parcelas BETWEEN 1 AND 12),
    valor                DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
    status_pagamento     VARCHAR(20)   NOT NULL DEFAULT 'pendente'
                          CHECK (status_pagamento IN ('pendente','aprovado','recusado','estornado')),
    intermediario        VARCHAR(50)   NOT NULL,
    id_transacao_externa VARCHAR(100),
    data_criacao         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (forma_pagamento = 'cartao_credito' OR parcelas = 1)
);

INSERT INTO PAGAMENTO_NOVO SELECT * FROM PAGAMENTO;
DROP TABLE PAGAMENTO;
ALTER TABLE PAGAMENTO_NOVO RENAME TO PAGAMENTO;

CREATE UNIQUE INDEX uq_pagamento_ativo ON PAGAMENTO(id_pedido)
    WHERE status_pagamento IN ('pendente','aprovado');
CREATE UNIQUE INDEX uq_pagamento_transacao ON PAGAMENTO(intermediario, id_transacao_externa)
    WHERE id_transacao_externa IS NOT NULL;

COMMIT;
PRAGMA foreign_keys = ON;
