import pool from "../config/db.js";

export const atividadeCirurgica = async (req, res) => {
  const { periodo, tipoCirurgia, especialidade } = req.query;

  try {
    // Determinar intervalo baseado no período
    let intervalo;
    switch(periodo) {
      case 'semana': intervalo = '1 week'; break;
      case 'mes': intervalo = '1 month'; break;
      case 'trimestre': intervalo = '3 months'; break;
      case 'ano': intervalo = '1 year'; break;
      default: intervalo = '1 month';
    }

    // MÉTRICAS PRINCIPAIS 
    let metricas = {
      totalCirurgias: 0,
      trendTotal: 'neutral',
      variacaoTotal: '0%',
      taxaAprovacao: 0,
      trendAprovacao: 'neutral',
      variacaoAprovacao: '0%',
      tempoMedio: 0,
      trendTempo: 'neutral',
      variacaoTempo: '0min',
      taxaOcupacao: 0,
      trendOcupacao: 'neutral',
      variacaoOcupacao: '0%',
      taxaCancelamento: 0,
      trendCancelamento: 'neutral',
      variacaoCancelamento: '0%',
      tempoPreparacao: 0,
      trendPreparacao: 'neutral',
      variacaoPreparacao: '0min',
      cirurgiasEmergencia: 0,
      trendEmergencia: 'neutral',
      variacaoEmergencia: '0',
      percentualEmergencia: 0,
      reintervencoes: 0,
      trendReintervencoes: 'neutral',
      variacaoReintervencoes: '0',
      percentualReintervencoes: 0
    };

    // 1. Métricas básicas
    try {
      const metricasQuery = `
        SELECT 
          COUNT(*) as totalCirurgias,
          COUNT(CASE WHEN aprovada = true THEN 1 END) as aprovadas,
          COUNT(CASE WHEN status = 'emergencia' THEN 1 END) as emergencia,
          COUNT(CASE WHEN status = 'cancelada' THEN 1 END) as canceladas,
          CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(AVG(duracao_minutos), 1)
          END as tempoMedio,
          CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(AVG(preparacao_minutos), 1)
          END as tempoPreparacao,
          CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(CASE WHEN aprovada = true THEN 1 END) * 100.0 / COUNT(*)), 2)
          END as taxaAprovacao
        FROM public."CIRURGIA" 
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
        ${tipoCirurgia !== 'todas' ? `AND status = '${tipoCirurgia}'` : ''}
      `;

      const metricasResult = await pool.query(metricasQuery);
      const row = metricasResult.rows[0] || {};

      metricas.totalCirurgias = parseInt(row.totalcirurgias) || 0;
      metricas.cirurgiasEmergencia = parseInt(row.emergencia) || 0;
      metricas.taxaAprovacao = parseFloat(row.taxaaprovacao) || 0;
      metricas.tempoMedio = parseFloat(row.tempomedio) || 0;
      metricas.tempoPreparacao = parseFloat(row.tempopreparacao) || 0;
      metricas.taxaCancelamento = parseInt(row.canceladas) > 0 && metricas.totalCirurgias > 0
        ? Math.round((parseInt(row.canceladas) / metricas.totalCirurgias) * 100 * 10) / 10
        : 0;
      metricas.percentualEmergencia = metricas.totalCirurgias > 0
        ? Math.round((metricas.cirurgiasEmergencia / metricas.totalCirurgias) * 100)
        : 0;
    } catch (error) {
      console.error('Erro ao buscar métricas principais:', error.message);
    }

    // 2. Taxa de ocupação de salas de cirurgia
    try {
      const ocupacaoQuery = `
        SELECT 
          COUNT(DISTINCT c.n_sala || '|' || c.tipo_sala) as salas_utilizadas,
          (SELECT COUNT(*) FROM public."SALAS" WHERE tipo = 'CIRURGIA' AND ativo = true) as total_salas_cirurgia,
          COUNT(*) as total_cirurgias
        FROM public."CIRURGIA" c
        WHERE c.data_hora >= NOW() - INTERVAL '${intervalo}'
          AND c.tipo_sala = 'CIRURGIA'
      `;

      const ocupacaoResult = await pool.query(ocupacaoQuery);
      const row = ocupacaoResult.rows[0] || {};
      
      const salasUtilizadas = parseInt(row.salas_utilizadas) || 0;
      const totalSalas = parseInt(row.total_salas_cirurgia) || 1;
      const totalCirurgias = parseInt(row.total_cirurgias) || 0;
      
      // Taxa de ocupação baseada em salas utilizadas vs total
      metricas.taxaOcupacao = totalSalas > 0
        ? Math.round((salasUtilizadas / totalSalas) * 100)
        : 0;
    } catch (error) {
      console.error('Erro ao calcular taxa de ocupação:', error.message);
    }

    // 3. Reintervenções (cirurgias no mesmo paciente dentro de 30 dias)
    try {
      const reintervencoesQuery = `
        SELECT COUNT(DISTINCT c1.cpf_paciente || '|' || c1.data_hora) as total_reintervencoes
        FROM public."CIRURGIA" c1
        JOIN public."CIRURGIA" c2 ON c1.cpf_paciente = c2.cpf_paciente
        WHERE c1.data_hora >= NOW() - INTERVAL '${intervalo}'
          AND c2.data_hora >= NOW() - INTERVAL '${intervalo}'
          AND c2.data_hora > c1.data_hora
          AND c2.data_hora <= c1.data_hora + INTERVAL '30 days'
          AND c1.id != c2.id
      `;

      const reintervencoesResult = await pool.query(reintervencoesQuery);
      const reintervencoes = parseInt(reintervencoesResult.rows[0]?.total_reintervencoes) || 0;
      
      metricas.reintervencoes = reintervencoes;
      metricas.percentualReintervencoes = metricas.totalCirurgias > 0
        ? Math.round((reintervencoes / metricas.totalCirurgias) * 100)
        : 0;
    } catch (error) {
      console.error('Erro ao calcular reintervenções:', error.message);
    }

    // 4. Distribuição por tipo de cirurgia
    let distribuicaoTipo = [];
    try {
      const distribuicaoQuery = `
        SELECT 
          CASE 
            WHEN status = 'eletiva' THEN 'Eletivas'
            WHEN status = 'emergencia' THEN 'Emergência'
            WHEN status = 'urgente' THEN 'Urgentes'
            ELSE 'Outras'
          END as tipo,
          COUNT(*) as quantidade
        FROM public."CIRURGIA"
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
        GROUP BY 
          CASE 
            WHEN status = 'eletiva' THEN 'Eletivas'
            WHEN status = 'emergencia' THEN 'Emergência'
            WHEN status = 'urgente' THEN 'Urgentes'
            ELSE 'Outras'
          END
      `;

      const distribuicaoResult = await pool.query(distribuicaoQuery);
      
      const total = distribuicaoResult.rows.reduce((sum, row) => sum + (parseInt(row.quantidade) || 0), 0);
      const cores = ['#3b82f6', '#ef4444', '#f59e0b', '#6b7280'];
      
      distribuicaoTipo = distribuicaoResult.rows.map((row, index) => {
        const quantidade = parseInt(row.quantidade) || 0;
        const percentual = total > 0 ? Math.round((quantidade / total) * 100) : 0;
        
        return {
          tipo: row.tipo || 'Não especificado',
          quantidade: quantidade,
          percentual: percentual,
          cor: cores[index] || '#6b7280'
        };
      });
    } catch (error) {
      console.error('Erro ao calcular distribuição por tipo:', error.message);
      distribuicaoTipo = [];
    }

    // Adicionar distribuição às métricas
    metricas.distribuicaoTipo = distribuicaoTipo;

    // CIRURGIAS POR ESPECIALIDADE
    let cirurgiasPorEspecialidade = [];
    
    try {
      const especialidadesQuery = `
        SELECT 
          em.especialidade,
          COUNT(c.data_hora) as totalCirurgias,
          COUNT(CASE WHEN c.status = 'eletiva' THEN 1 END) as eletivas,
          COUNT(CASE WHEN c.status = 'emergencia' THEN 1 END) as emergencia,
          COUNT(CASE WHEN c.aprovada = true THEN 1 END) as aprovadas,
          CASE 
            WHEN COUNT(c.data_hora) = 0 THEN 0
            ELSE ROUND(AVG(c.duracao_minutos), 1)
          END as tempoMedio
        FROM public."ESPECIALIDADE_MEDICO" em
        JOIN public."MEDICO" m ON em.cpf_medico = m.cpf
        JOIN public."ALOCA_MEDICO_CIRURGIA" amc ON m.cpf = amc.cpf_medico
        JOIN public."CIRURGIA" c ON amc.data_hora = c.data_hora 
          AND amc.cpf_paciente = c.cpf_paciente
          AND c.data_hora >= NOW() - INTERVAL '${intervalo}'
        ${especialidade !== 'todas' ? `WHERE em.especialidade = '${especialidade}'` : ''}
        GROUP BY em.especialidade
        HAVING COUNT(c.data_hora) > 0
        ORDER BY totalCirurgias DESC
      `;

      const especialidadesResult = await pool.query(especialidadesQuery);
      
      cirurgiasPorEspecialidade = especialidadesResult.rows.map(esp => {
        const totalCirurgias = parseInt(esp.totalcirurgias) || 0;
        const aprovadas = parseInt(esp.aprovadas) || 0;
        const taxaSucesso = totalCirurgias > 0
          ? Math.round((aprovadas / totalCirurgias) * 100 * 10) / 10
          : 0;
        
        return {
          especialidade: esp.especialidade || 'Não especificada',
          totalCirurgias: totalCirurgias,
          eletivas: parseInt(esp.eletivas) || 0,
          emergencia: parseInt(esp.emergencia) || 0,
          tempoMedio: parseFloat(esp.tempomedio) || 0,
          taxaSucesso: taxaSucesso
        };
      });
    } catch (error) {
      console.error('Erro ao buscar cirurgias por especialidade:', error.message);
      cirurgiasPorEspecialidade = [];
    }

    // TOP CIRURGIÕES
    let topCirurgioes = [];
    
    try {
      const cirurgioesQuery = `
        SELECT 
          p.nome,
          em.especialidade,
          COUNT(amc.data_hora) as totalCirurgias,
          COUNT(CASE WHEN c.aprovada = true THEN 1 END) as aprovadas,
          CASE 
            WHEN COUNT(amc.data_hora) = 0 THEN 0
            ELSE ROUND(AVG(c.duracao_minutos), 1)
          END as tempoMedio,
          m.disponivel,
          (SELECT COUNT(*) 
           FROM public."ALOCA_MEDICO_CIRURGIA" amc2
           JOIN public."CIRURGIA" c2 ON amc2.data_hora = c2.data_hora AND amc2.cpf_paciente = c2.cpf_paciente
           WHERE amc2.cpf_medico = m.cpf 
             AND c2.data_hora >= NOW() - INTERVAL '${intervalo}'
             AND c2.data_hora < NOW() - INTERVAL '${intervalo}') as cirurgias_periodo_anterior
        FROM public."ALOCA_MEDICO_CIRURGIA" amc
        JOIN public."MEDICO" m ON amc.cpf_medico = m.cpf
        JOIN public."PESSOA" p ON m.cpf = p.cpf
        JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
        JOIN public."CIRURGIA" c ON amc.data_hora = c.data_hora 
          AND amc.cpf_paciente = c.cpf_paciente
          AND c.data_hora >= NOW() - INTERVAL '${intervalo}'
        GROUP BY p.nome, em.especialidade, m.disponivel, m.cpf
        HAVING COUNT(amc.data_hora) > 0
        ORDER BY totalCirurgias DESC
        LIMIT 10
      `;

      const cirurgioesResult = await pool.query(cirurgioesQuery);
      
      topCirurgioes = cirurgioesResult.rows.map(cirurgiao => {
        const totalCirurgias = parseInt(cirurgiao.totalcirurgias) || 0;
        const aprovadas = parseInt(cirurgiao.aprovadas) || 0;
        const taxaSucesso = totalCirurgias > 0
          ? Math.round((aprovadas / totalCirurgias) * 100 * 10) / 10
          : 0;
        
        // Calcular variação em relação ao período anterior
        const cirurgiasAnteriores = parseInt(cirurgiao.cirurgias_periodo_anterior) || 0;
        let variacao = '0%';
        
        if (cirurgiasAnteriores > 0) {
          const percentual = ((totalCirurgias - cirurgiasAnteriores) / cirurgiasAnteriores) * 100;
          variacao = `${percentual >= 0 ? '+' : ''}${Math.round(percentual)}%`;
        } else if (totalCirurgias > 0) {
          variacao = '+100%';
        }

        return {
          nome: cirurgiao.nome || 'Cirurgião não identificado',
          especialidade: cirurgiao.especialidade || 'Não especificada',
          totalCirurgias: totalCirurgias,
          tempoMedio: parseFloat(cirurgiao.tempomedio) || 0,
          taxaSucesso: taxaSucesso,
          disponivel: cirurgiao.disponivel === true,
          variacao: variacao
        };
      });
    } catch (error) {
      console.error('Erro ao buscar top cirurgiões:', error.message);
      topCirurgioes = [];
    }

    // PRÓXIMAS CIRURGIAS
    let proximasCirurgias = [];
    
    try {
      const proximasQuery = `
        SELECT 
          c.data_hora,
          p.nome as paciente_nome,
          pc.data_nascimento,
          em.especialidade,
          med.nome as cirurgiao_nome,
          c.n_sala,
          c.status,
          c.aprovada,
          c.duracao_minutos
        FROM public."CIRURGIA" c
        JOIN public."PESSOA" p ON c.cpf_paciente = p.cpf
        JOIN public."PACIENTE" pc ON c.cpf_paciente = pc.cpf
        JOIN public."ALOCA_MEDICO_CIRURGIA" amc ON c.data_hora = amc.data_hora 
          AND c.cpf_paciente = amc.cpf_paciente
        JOIN public."PESSOA" med ON amc.cpf_medico = med.cpf
        JOIN public."MEDICO" m ON amc.cpf_medico = m.cpf
        JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
        WHERE c.data_hora >= NOW()
        ORDER BY c.data_hora ASC
        LIMIT 10
      `;

      const proximasResult = await pool.query(proximasQuery);
      
      proximasCirurgias = proximasResult.rows.map(cirurgia => {
        // Determinar status da cirurgia
        let status = 'agendada';
        if (cirurgia.aprovada === true) {
          status = 'confirmada';
        } else if (cirurgia.status === 'cancelada') {
          status = 'cancelada';
        }

        // Determinar procedimento baseado na especialidade
        let procedimento = 'Procedimento Cirúrgico';
        if (cirurgia.especialidade) {
          procedimento = `${cirurgia.especialidade} - Procedimento Cirúrgico`;
        }

        // Calcular idade do paciente
        let idade = 'N/A';
        if (cirurgia.data_nascimento) {
          try {
            const nascimento = new Date(cirurgia.data_nascimento);
            const hoje = new Date();
            let idadeCalc = hoje.getFullYear() - nascimento.getFullYear();
            const mes = hoje.getMonth() - nascimento.getMonth();
            if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
              idadeCalc--;
            }
            idade = `${idadeCalc} anos`;
          } catch (e) {
            console.error('Erro ao calcular idade:', e.message);
          }
        }

        return {
          data_hora: cirurgia.data_hora || new Date(),
          paciente_nome: cirurgia.paciente_nome || 'Paciente não identificado',
          paciente_idade: idade,
          procedimento: procedimento,
          cirurgiao_nome: cirurgia.cirurgiao_nome || 'Cirurgião não identificado',
          especialidade: cirurgia.especialidade || 'Não especificada',
          n_sala: parseInt(cirurgia.n_sala) || 0,
          duracao_estimada: `${Math.round(parseFloat(cirurgia.duracao_minutos) || 0)} min`,
          status: status
        };
      });
    } catch (error) {
      console.error('Erro ao buscar próximas cirurgias:', error.message);
      proximasCirurgias = [];
    }

    // EVOLUÇÃO MENSAL
    let evolucaoMensal = [];
    
    try {
      let evolucaoQuery;
      
      if (periodo === 'ano') {
        evolucaoQuery = `
          SELECT 
            TO_CHAR(c.data_hora, 'Mon') as mes,
            COUNT(*) as cirurgias
          FROM public."CIRURGIA" c
          WHERE c.data_hora >= DATE_TRUNC('year', NOW())
          GROUP BY TO_CHAR(c.data_hora, 'Mon'), EXTRACT(MONTH FROM c.data_hora)
          ORDER BY EXTRACT(MONTH FROM c.data_hora)
        `;
      } else if (periodo === 'trimestre') {
        evolucaoQuery = `
          SELECT 
            'Mês ' || EXTRACT(MONTH FROM c.data_hora) as mes,
            COUNT(*) as cirurgias
          FROM public."CIRURGIA" c
          WHERE c.data_hora >= DATE_TRUNC('quarter', NOW())
          GROUP BY EXTRACT(MONTH FROM c.data_hora)
          ORDER BY EXTRACT(MONTH FROM c.data_hora)
        `;
      } else if (periodo === 'mes') {
        evolucaoQuery = `
          SELECT 
            'Sem ' || (EXTRACT(WEEK FROM c.data_hora) - EXTRACT(WEEK FROM DATE_TRUNC('month', c.data_hora)) + 1) as semana,
            COUNT(*) as cirurgias
          FROM public."CIRURGIA" c
          WHERE c.data_hora >= DATE_TRUNC('month', NOW())
          GROUP BY EXTRACT(WEEK FROM c.data_hora) - EXTRACT(WEEK FROM DATE_TRUNC('month', c.data_hora)) + 1
          ORDER BY EXTRACT(WEEK FROM c.data_hora) - EXTRACT(WEEK FROM DATE_TRUNC('month', c.data_hora)) + 1
        `;
      } else {
        evolucaoQuery = `
          SELECT 
            TO_CHAR(c.data_hora, 'Dy') as dia,
            COUNT(*) as cirurgias
          FROM public."CIRURGIA" c
          WHERE c.data_hora >= DATE_TRUNC('week', NOW())
          GROUP BY TO_CHAR(c.data_hora, 'Dy'), EXTRACT(DOW FROM c.data_hora)
          ORDER BY EXTRACT(DOW FROM c.data_hora)
        `;
      }

      const evolucaoResult = await pool.query(evolucaoQuery);
      
      evolucaoMensal = evolucaoResult.rows.map(row => {
        const label = periodo === 'ano' ? row.mes : 
                     periodo === 'trimestre' ? row.mes :
                     periodo === 'mes' ? row.semana : 
                     row.dia;
        
        return {
          periodo: label || 'Período',
          cirurgias: parseInt(row.cirurgias) || 0
        };
      });
    } catch (error) {
      console.error('Erro ao buscar evolução mensal:', error.message);
      evolucaoMensal = [];
    }

    // CALCULAR TENDÊNCIAS
    
    // Calcular variação em relação ao período anterior
    try {
      const variacaoQuery = `
        SELECT 
          -- Período atual
          (SELECT COUNT(*) FROM public."CIRURGIA" 
           WHERE data_hora >= NOW() - INTERVAL '${intervalo}') as atual,
          
          -- Período anterior
          (SELECT COUNT(*) FROM public."CIRURGIA" 
           WHERE data_hora >= NOW() - INTERVAL '${intervalo}' - INTERVAL '${intervalo}'
             AND data_hora < NOW() - INTERVAL '${intervalo}') as anterior
      `;

      const variacaoResult = await pool.query(variacaoQuery);
      const row = variacaoResult.rows[0] || {};
      
      const atual = parseInt(row.atual) || 0;
      const anterior = parseInt(row.anterior) || 0;
      
      if (anterior > 0) {
        const percentual = ((atual - anterior) / anterior) * 100;
        metricas.variacaoTotal = `${percentual >= 0 ? '+' : ''}${Math.round(percentual)}%`;
        metricas.trendTotal = percentual >= 0 ? 'up' : 'down';
      } else if (atual > 0) {
        metricas.variacaoTotal = '+100%';
        metricas.trendTotal = 'up';
      }
    } catch (error) {
      console.error('Erro ao calcular variação:', error.message);
    }

    // RESPOSTA FINAL
    const dados = {
      metricas,
      cirurgiasPorEspecialidade,
      topCirurgioes,
      proximasCirurgias,
      evolucaoMensal
    };

    console.log('Enviando resposta com dados reais cirúrgicos:', {
      metricas: {
        totalCirurgias: metricas.totalCirurgias,
        taxaAprovacao: metricas.taxaAprovacao,
        tempoMedio: metricas.tempoMedio,
        taxaOcupacao: metricas.taxaOcupacao
      },
      especialidades: cirurgiasPorEspecialidade.length,
      cirurgioes: topCirurgioes.length,
      proximas: proximasCirurgias.length
    });
    
    res.json(dados);
    
  } catch (error) {
    console.error('Erro ao buscar dados cirúrgicos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

export const exportCirurgias = async (req, res) => {
  try {
    const { formato, periodo, tipoCirurgia, especialidade } = req.query;
    
    console.log('Exportando dados cirúrgicos:', { formato, periodo, tipoCirurgia, especialidade });
    
    // Chama a função principal para obter dados reais
    const mockReq = {
      query: { periodo, tipoCirurgia, especialidade }
    };
    
    let responseData = null;
    const mockRes = {
      json: (data) => {
        responseData = data;
        return mockRes;
      },
      status: () => mockRes
    };
    
    await atividadeCirurgica(mockReq, mockRes);
    
    if (formato === 'json') {
      res.json(responseData);
    } else if (formato === 'excel' || formato === 'pdf') {
      res.json(responseData);
    } else {
      res.status(400).json({ error: 'Formato inválido' });
    }
    
  } catch (error) {
    console.error('Erro ao exportar dados cirúrgicos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};