import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { Response } from "express";
import { QueryFailedError } from "typeorm";

interface MysqlError {
    errno?: number;
    sqlState?: string;
    sqlMessage?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const res = host.switchToHttp().getResponse<Response>();

        // 1. Erros do próprio Nest (inclui os do ValidationPipe): repassa como estão
        if (exception instanceof HttpException) {
            return res.status(exception.getStatus()).json(exception.getResponse());
        }

        // 2. Erros do MySQL
        if (exception instanceof QueryFailedError) {
            const { errno, sqlState, sqlMessage } = exception.driverError as MysqlError;

            // Trigger (SIGNAL SQLSTATE '45000'): a mensagem é nossa, pode ir ao cliente
            if (sqlState === '45000') {
                return this.responder(res, 422, sqlMessage ?? 'Regra de negócio violada.');
            }

            switch(errno) {
                case 1062: //ER_DUP_ENTRY
                    return this.responder(res, 409, 'Já existe um registro com esse valor.');
                case 1451: // APAGAR PAI QUE TEM FILHOS
                    return this.responder(res, 409, 'Não é possível apagar: existem registros dependentes.');
                case 1452: // INSERIR FILHO SEM PAI
                    return this.responder(res, 422, 'Registro relacionado não encontrado.');
                case 3819: // CHECK VIOLADO
                    return this.responder(res, 422, 'Os dados enviados violam uma regra de validação.');
                case 1048: // COLUNA NOT NULL RECEBEU NULO
                    return this.responder(res, 422, 'Um campo obrigatório não foi informado.');
            }
        }

        //3. Qualquer outro erro: 500 genérico (o detalhe real fica só no log do servidor)
        this.logger.error(exception);
        return this.responder(res, 500, 'Erro interno do servidor.');
    }

    private responder(res: Response, statusCode: number, message: string) {
        return res.status(statusCode).json({ statusCode, message });
    }
}