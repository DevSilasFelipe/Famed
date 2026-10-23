import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CnpjInfo, CnpjProvider } from './cnpj.provider';

interface BrasilApiResposta {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  descricao_situacao_cadastral: string;
  cnae_fiscal: number;
}

@Injectable()
export class BrasilApiCnpjProvider extends CnpjProvider {
  private readonly baseUrl = 'https://brasilapi.com.br/api/cnpj/v1';

  async consultar(cnpj: string): Promise<CnpjInfo | null> {
    let res: Response;
    try {
     res = await fetch(`${this.baseUrl}/${cnpj}`, {
        signal: AbortSignal.timeout(5000),
        headers: {
            'User-Agent': 'FamedPI/1.0 (projeto academico Fatec Diadema)',
            Accept: 'application/json',
        },
    });
    } catch {
      throw new ServiceUnavailableException(
        'Serviço de consulta de CNPJ indisponível. Tente novamente em instantes.',
      );
    }

    if (res.status === 404 || res.status === 400) return null;

    if (!res.ok) {
      throw new ServiceUnavailableException(
        'Serviço de consulta de CNPJ indisponível. Tente novamente em instantes.',
      );
    }

    const d = (await res.json()) as BrasilApiResposta;

    // aqui o provider "traduz", pega só os 5 campos e devolve no formato CnpjInfo
    return {
      cnpj: d.cnpj,
      razao_social: d.razao_social,
      nome_fantasia: d.nome_fantasia || null,
      descricao_situacao_cadastral: d.descricao_situacao_cadastral,
      cnae_fiscal: d.cnae_fiscal,
    };
  }
}