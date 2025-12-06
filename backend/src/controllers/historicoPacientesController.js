import pool from "../config/db.js";

export const historicoPacientes = async (req, res) => {
  const { periodo, tipoAtendimento, faixaEtaria } = req.query;

  console.log('Recebendo requisição para histórico de pacientes com parâmetros:', {
    periodo, tipoAtendimento, faixaEtaria
  });

  try {
    // Intervalo baseado no período
    let intervalo;
    switch(periodo) {
      case 'semana': intervalo = '1 week'; break;
      case 'mes': intervalo = '1 month'; break;
      case 'trimestre': intervalo = '3 months'; break;
      case 'ano': intervalo = '1 year'; break;
      default: intervalo = '1 month';
    }

    console.log('Usando intervalo:', intervalo);

    // MÉTRICAS PRINCIPAIS
    
    // Métricas básicas
    const metricas = {
      totalAtendidos: 0,
      taxaRemarcacao: 0,
      permanenciaMedia: 0,
      taxaRetorno: 0,
      taxaOcupacaoLeitos: 0,
      totalAltas: 0,
      tempoMedioEspera: 0,
      taxaSatisfacao: 0,
      trendAtendidos: 'neutral',
      variacaoAtendidos: '0%',
      trendRemarcacao: 'neutral',
      variacaoRemarcacao: '0%',
      trendPermanencia: 'neutral',
      variacaoPermanencia: '0 dias',
      trendRetorno: 'neutral',
      variacaoRetorno: '0%',
      trendOcupacao: 'neutral',
      variacaoOcupacao: '0%',
      trendAltas: 'neutral',
      variacaoAltas: '0',
      trendEspera: 'neutral',
      variacaoEspera: '0 min',
      trendSatisfacao: 'neutral',
      variacaoSatisfacao: '0%'
    };

    // 1. Total de atendimentos
    try {
      const totalAtendimentosQuery = `
        SELECT COUNT(*) as total_atendidos
        FROM public."CONSULTA" 
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
      `;
      const totalAtendimentosResult = await pool.query(totalAtendimentosQuery);
      metricas.totalAtendidos = parseInt(totalAtendimentosResult.rows[0]?.total_atendidos) || 0;
    } catch (error) {
      console.error('Erro ao buscar total de atendimentos:', error.message);
    }

    // 2. Taxa de ocupação de leitos
    try {
      const ocupacaoLeitosQuery = `
        SELECT 
          tipo,
          COUNT(*) as total,
          SUM(quant_paciente) as ocupados,
          CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((SUM(quant_paciente) * 100.0 / COUNT(*)), 2)
          END as ocupacao
        FROM public."LEITOS" 
        WHERE ativo = true
        GROUP BY tipo
      `;
      const ocupacaoResult = await pool.query(ocupacaoLeitosQuery);
      
      let totalOcupados = 0;
      let totalLeitos = 0;
      let somaOcupacao = 0;
      let countTipos = 0;

      ocupacaoResult.rows.forEach(row => {
        const ocupados = parseInt(row.ocupados) || 0;
        const total = parseInt(row.total) || 0;
        const ocupacao = parseFloat(row.ocupacao) || 0;
        
        totalOcupados += ocupados;
        totalLeitos += total;
        somaOcupacao += ocupacao;
        countTipos++;
      });

      metricas.taxaOcupacaoLeitos = countTipos > 0 ? Math.round(somaOcupacao / countTipos) : 0;
    } catch (error) {
      console.error('Erro ao buscar taxa de ocupação:', error.message);
    }

    // ATENDIMENTOS POR ESPECIALIDADE
    let atendimentosPorEspecialidade = [];
    
    try {
      const especialidadesQuery = `
        SELECT 
          em.especialidade,
          COUNT(c.data_hora) as total_atendimentos,
          COUNT(DISTINCT c.cpf_paciente) as pacientes_distintos
        FROM public."ESPECIALIDADE_MEDICO" em
        LEFT JOIN public."MEDICO" m ON em.cpf_medico = m.cpf
        LEFT JOIN public."CONSULTA" c ON m.cpf = c.cpf_medico 
          AND c.data_hora >= NOW() - INTERVAL '${intervalo}'
        WHERE c.data_hora IS NOT NULL
        GROUP BY em.especialidade
        ORDER BY COUNT(c.data_hora) DESC
        LIMIT 10
      `;

      const especialidadesResult = await pool.query(especialidadesQuery);
      
      // Buscar dados adicionais para cada especialidade
      for (let esp of especialidadesResult.rows) {
        try {
          // Buscar média de idade dos pacientes
          const idadeQuery = `
            SELECT 
              AVG(EXTRACT(YEAR FROM AGE(NOW(), p.data_nascimento))) as media_idade
            FROM public."CONSULTA" c
            JOIN public."PACIENTE" p ON c.cpf_paciente = p.cpf
            JOIN public."MEDICO" m ON c.cpf_medico = m.cpf
            JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
            WHERE em.especialidade = $1 
              AND c.data_hora >= NOW() - INTERVAL '${intervalo}'
          `;
          
          const idadeResult = await pool.query(idadeQuery, [esp.especialidade]);
          const mediaIdade = idadeResult.rows[0]?.media_idade 
            ? Math.round(parseFloat(idadeResult.rows[0].media_idade)) 
            : 0;

          // Buscar crescimento comparado com período anterior
          const crescimentoQuery = `
            SELECT 
              COUNT(*) as atendimentos_periodo_anterior
            FROM public."CONSULTA" c
            JOIN public."MEDICO" m ON c.cpf_medico = m.cpf
            JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
            WHERE em.especialidade = $1 
              AND c.data_hora >= NOW() - INTERVAL '${intervalo}' 
              AND c.data_hora < NOW() - INTERVAL '${intervalo}'
          `;
          
          const crescimentoResult = await pool.query(crescimentoQuery, [esp.especialidade]);
          const anterior = parseInt(crescimentoResult.rows[0]?.atendimentos_periodo_anterior) || 0;
          const atual = parseInt(esp.total_atendimentos) || 0;
          
          let crescimento = 0;
          if (anterior > 0) {
            crescimento = Math.round(((atual - anterior) / anterior) * 100);
          } else if (atual > 0) {
            crescimento = 100; // Primeira vez com atendimentos
          }

          atendimentosPorEspecialidade.push({
            especialidade: esp.especialidade || 'Não especificada',
            totalAtendimentos: parseInt(esp.total_atendimentos) || 0,
            novosPacientes: parseInt(esp.pacientes_distintos) || 0,
            retornos: (parseInt(esp.total_atendimentos) || 0) - (parseInt(esp.pacientes_distintos) || 0),
            mediaIdade: mediaIdade,
            crescimento: crescimento
          });
        } catch (innerError) {
          console.error(`Erro ao processar especialidade ${esp.especialidade}:`, innerError.message);
          // Adicionar com valores básicos se houver erro
          atendimentosPorEspecialidade.push({
            especialidade: esp.especialidade || 'Não especificada',
            totalAtendimentos: parseInt(esp.total_atendimentos) || 0,
            novosPacientes: 0,
            retornos: 0,
            mediaIdade: 0,
            crescimento: 0
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error.message);
      atendimentosPorEspecialidade = []; // Retorna array vazio em caso de erro
    }

    // INTERNAÇÕES ATIVAS
    let internacoesAtivas = [];
    
    try {
      // Buscar diagnósticos reais das internações
      const internacoesQuery = `
        SELECT 
          p.nome as paciente_nome,
          pc.data_nascimento,
          'UTI' as tipo_leito,
          alu.data_entrada,
          COALESCE(
            (SELECT diagnostico 
             FROM public."PRONTO_SOCORRO" ps 
             WHERE ps.cpf_paciente = alu.cpf_paciente 
             ORDER BY data_hora DESC 
             LIMIT 1),
            'Em observação'
          ) as diagnostico_principal,
          EXTRACT(DAYS FROM AGE(NOW(), alu.data_entrada)) as dias_internado
        FROM public."ALOCA_LEITO_UTI_PACIENTE" alu
        LEFT JOIN public."PESSOA" p ON alu.cpf_paciente = p.cpf
        LEFT JOIN public."PACIENTE" pc ON alu.cpf_paciente = pc.cpf
        WHERE alu.data_saida IS NULL
        
        UNION ALL
        
        SELECT 
          p.nome as paciente_nome,
          pc.data_nascimento,
          'ENFERMARIA' as tipo_leito,
          ale.data_entrada,
          COALESCE(
            (SELECT diagnostico 
             FROM public."PRONTO_SOCORRO" ps 
             WHERE ps.cpf_paciente = ale.cpf_paciente 
             ORDER BY data_hora DESC 
             LIMIT 1),
            'Em observação'
          ) as diagnostico_principal,
          EXTRACT(DAYS FROM AGE(NOW(), ale.data_entrada)) as dias_internado
        FROM public."ALOCA_LEITO_ENFERMARIA_PACIENTE" ale
        LEFT JOIN public."PESSOA" p ON ale.cpf_paciente = p.cpf
        LEFT JOIN public."PACIENTE" pc ON ale.cpf_paciente = pc.cpf
        WHERE ale.data_saida IS NULL
        
        ORDER BY dias_internado DESC
        LIMIT 10
      `;

      const internacoesResult = await pool.query(internacoesQuery);
      
      // Buscar número da sala para cada internação
      for (let internacao of internacoesResult.rows) {
        try {
          let n_sala = null;
          
          if (internacao.tipo_leito === 'UTI') {
            const salaQuery = `
              SELECT l.n_sala
              FROM public."LEITOS" l
              JOIN public."ALOCA_LEITO_UTI_PACIENTE" alu ON l.tipo = 'UTI'
              WHERE alu.cpf_paciente = (
                SELECT p.cpf 
                FROM public."PESSOA" p 
                WHERE p.nome = $1 
                LIMIT 1
              )
              LIMIT 1
            `;
            const salaResult = await pool.query(salaQuery, [internacao.paciente_nome]);
            n_sala = salaResult.rows[0]?.n_sala || null;
          } else {
            const salaQuery = `
              SELECT l.n_sala
              FROM public."LEITOS" l
              JOIN public."ALOCA_LEITO_ENFERMARIA_PACIENTE" ale ON l.tipo = 'ENFERMARIA'
              WHERE ale.cpf_paciente = (
                SELECT p.cpf 
                FROM public."PESSOA" p 
                WHERE p.nome = $1 
                LIMIT 1
              )
              LIMIT 1
            `;
            const salaResult = await pool.query(salaQuery, [internacao.paciente_nome]);
            n_sala = salaResult.rows[0]?.n_sala || null;
          }

          internacoesAtivas.push({
            paciente_nome: internacao.paciente_nome || 'Paciente não identificado',
            data_nascimento: internacao.data_nascimento,
            tipo_leito: internacao.tipo_leito || 'ENFERMARIA',
            n_sala: n_sala,
            diagnostico_principal: internacao.diagnostico_principal || 'Em observação',
            dias_internado: parseInt(internacao.dias_internado) || 0,
            status: 'estavel'
          });
        } catch (innerError) {
          console.error(`Erro ao processar internação para ${internacao.paciente_nome}:`, innerError.message);
          
          // Adicionar com dados básicos
          internacoesAtivas.push({
            paciente_nome: internacao.paciente_nome || 'Paciente não identificado',
            data_nascimento: internacao.data_nascimento,
            tipo_leito: internacao.tipo_leito || 'ENFERMARIA',
            n_sala: null,
            diagnostico_principal: internacao.diagnostico_principal || 'Em observação',
            dias_internado: parseInt(internacao.dias_internado) || 0,
            status: 'estavel'
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar internações:', error.message);
      internacoesAtivas = []; // Retorna array vazio em caso de erro
    }

    // PROCEDIMENTOS REALIZADOS
    let procedimentosRealizados = [];
    
    try {
      const procedimentosQuery = `
        SELECT 
          'Consulta Médica' as procedimento,
          COUNT(*) as quantidade,
          'Consulta' as especialidade,
          AVG(EXTRACT(EPOCH FROM (data_hora_fim - data_hora)) / 60) as tempo_medio_min
        FROM public."CONSULTA"
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
          AND data_hora_fim IS NOT NULL
        
        UNION ALL
        
        SELECT 
          'Cirurgia' as procedimento,
          COUNT(*) as quantidade,
          'Cirurgia' as especialidade,
          AVG(EXTRACT(EPOCH FROM (data_hora_fim - data_hora)) / 60) as tempo_medio_min
        FROM public."CIRURGIA"
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
          AND data_hora_fim IS NOT NULL
        
        UNION ALL
        
        SELECT 
          'Atendimento Pronto Socorro' as procedimento,
          COUNT(*) as quantidade,
          'Emergência' as especialidade,
          AVG(EXTRACT(EPOCH FROM (data_hora_fim - data_hora)) / 60) as tempo_medio_min
        FROM public."PRONTO_SOCORRO"
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
          AND data_hora_fim IS NOT NULL
        
        ORDER BY quantidade DESC
      `;

      const procedimentosResult = await pool.query(procedimentosQuery);
      
      procedimentosRealizados = procedimentosResult.rows.map(proc => {
        const crescimento = 0; // Por enquanto, sem cálculo de crescimento
        
        return {
          procedimento: proc.procedimento || 'Não especificado',
          quantidade: parseInt(proc.quantidade) || 0,
          especialidade: proc.especialidade || 'N/A',
          tempo_medio: proc.tempo_medio_min ? Math.round(parseFloat(proc.tempo_medio_min)) : 0,
          crescimento: crescimento
        };
      });
    } catch (error) {
      console.error('Erro ao buscar procedimentos:', error.message);
      procedimentosRealizados = [];
    }

    // ORIGEM DOS PACIENTES
    let origemPacientes = [];
    
    try {
      const origemQuery = `
        SELECT 
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM public."PRONTO_SOCORRO" ps 
              WHERE ps.cpf_paciente = c.cpf_paciente 
                AND ps.data_hora >= NOW() - INTERVAL '24 hours'
            ) THEN 'Pronto Socorro'
            WHEN EXISTS (
              SELECT 1 FROM public."CIRURGIA" cir 
              WHERE cir.cpf_paciente = c.cpf_paciente 
                AND cir.data_hora >= NOW() - INTERVAL '7 days'
            ) THEN 'Encaminhamento Cirúrgico'
            ELSE 'Consulta Agendada'
          END as origem,
          COUNT(*) as quantidade
        FROM public."CONSULTA" c
        WHERE c.data_hora >= NOW() - INTERVAL '${intervalo}'
        GROUP BY 
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM public."PRONTO_SOCORRO" ps 
              WHERE ps.cpf_paciente = c.cpf_paciente 
                AND ps.data_hora >= NOW() - INTERVAL '24 hours'
            ) THEN 'Pronto Socorro'
            WHEN EXISTS (
              SELECT 1 FROM public."CIRURGIA" cir 
              WHERE cir.cpf_paciente = c.cpf_paciente 
                AND cir.data_hora >= NOW() - INTERVAL '7 days'
            ) THEN 'Encaminhamento Cirúrgico'
            ELSE 'Consulta Agendada'
          END
        ORDER BY quantidade DESC
      `;

      const origemResult = await pool.query(origemQuery);
      
      const total = origemResult.rows.reduce((sum, row) => sum + (parseInt(row.quantidade) || 0), 0);
      
      origemPacientes = origemResult.rows.map(row => {
        const quantidade = parseInt(row.quantidade) || 0;
        const percentual = total > 0 ? Math.round((quantidade / total) * 100) : 0;
        
        return {
          origem: row.origem || 'Não especificada',
          quantidade: quantidade,
          percentual: percentual,
          crescimento: 0, // Por enquanto, sem cálculo de crescimento
          tipo_principal: row.origem === 'Pronto Socorro' ? 'Emergência' : 
                         row.origem === 'Encaminhamento Cirúrgico' ? 'Cirurgia' : 'Consultas'
        };
      });
    } catch (error) {
      console.error('Erro ao buscar origem dos pacientes:', error.message);
      origemPacientes = [];
    }

    // DISTRIBUIÇÃO POR FAIXA ETÁRIA
    let distribuicaoFaixaEtaria = [];
    
    try {
      const faixaEtariaQuery = `
        SELECT 
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.data_nascimento)) < 13 THEN '0-12 anos'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.data_nascimento)) BETWEEN 13 AND 17 THEN '13-17 anos'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.data_nascimento)) BETWEEN 18 AND 59 THEN '18-59 anos'
            ELSE '60+ anos'
          END as faixa,
          COUNT(*) as quantidade
        FROM public."CONSULTA" c
        JOIN public."PACIENTE" p ON c.cpf_paciente = p.cpf
        WHERE c.data_hora >= NOW() - INTERVAL '${intervalo}'
        GROUP BY 
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.data_nascimento)) < 13 THEN '0-12 anos'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.data_nascimento)) BETWEEN 13 AND 17 THEN '13-17 anos'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.data_nascimento)) BETWEEN 18 AND 59 THEN '18-59 anos'
            ELSE '60+ anos'
          END
        ORDER BY 
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.data_nascimento)) < 13 THEN 1
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.data_nascimento)) BETWEEN 13 AND 17 THEN 2
            WHEN EXTRACT(YEAR FROM AGE(NOW(), p.data_nascimento)) BETWEEN 18 AND 59 THEN 3
            ELSE 4
          END
      `;

      const faixaResult = await pool.query(faixaEtariaQuery);
      
      const total = faixaResult.rows.reduce((sum, row) => sum + (parseInt(row.quantidade) || 0), 0);
      const cores = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
      
      distribuicaoFaixaEtaria = faixaResult.rows.map((row, index) => {
        const quantidade = parseInt(row.quantidade) || 0;
        const percentual = total > 0 ? Math.round((quantidade / total) * 100) : 0;
        
        return {
          faixa: row.faixa || 'Não especificada',
          quantidade: quantidade,
          percentual: percentual,
          cor: cores[index] || '#6b7280'
        };
      });
    } catch (error) {
      console.error('Erro ao buscar distribuição por faixa etária:', error.message);
      distribuicaoFaixaEtaria = [];
    }

    // EVOLUÇÃO DOS ATENDIMENTOS
    let evolucaoAtendimentos = [];
    
    try {
      let evolucaoQuery;
      
      if (periodo === 'ano') {
        evolucaoQuery = `
          SELECT 
            TO_CHAR(data_hora, 'Mon') as mes,
            COUNT(*) as atendimentos
          FROM public."CONSULTA"
          WHERE data_hora >= DATE_TRUNC('year', NOW())
          GROUP BY TO_CHAR(data_hora, 'Mon'), EXTRACT(MONTH FROM data_hora)
          ORDER BY EXTRACT(MONTH FROM data_hora)
        `;
      } else if (periodo === 'mes') {
        evolucaoQuery = `
          SELECT 
            'Sem ' || EXTRACT(WEEK FROM data_hora) - EXTRACT(WEEK FROM DATE_TRUNC('month', data_hora)) + 1 as semana,
            COUNT(*) as atendimentos
          FROM public."CONSULTA"
          WHERE data_hora >= DATE_TRUNC('month', NOW())
          GROUP BY EXTRACT(WEEK FROM data_hora) - EXTRACT(WEEK FROM DATE_TRUNC('month', data_hora)) + 1
          ORDER BY EXTRACT(WEEK FROM data_hora) - EXTRACT(WEEK FROM DATE_TRUNC('month', data_hora)) + 1
        `;
      } else {
        evolucaoQuery = `
          SELECT 
            TO_CHAR(data_hora, 'Dy') as dia,
            COUNT(*) as atendimentos
          FROM public."CONSULTA"
          WHERE data_hora >= DATE_TRUNC('week', NOW())
          GROUP BY TO_CHAR(data_hora, 'Dy'), EXTRACT(DOW FROM data_hora)
          ORDER BY EXTRACT(DOW FROM data_hora)
        `;
      }

      const evolucaoResult = await pool.query(evolucaoQuery);
      
      evolucaoAtendimentos = evolucaoResult.rows.map(row => {
        const label = periodo === 'ano' ? row.mes : 
                     periodo === 'mes' ? row.semana : 
                     row.dia;
        
        return {
          mes: label || 'Período',
          atendimentos: parseInt(row.atendimentos) || 0
        };
      });
    } catch (error) {
      console.error('Erro ao buscar evolução dos atendimentos:', error.message);
      evolucaoAtendimentos = [];
    }

    // CALCULAR OUTRAS MÉTRICAS
    
    // Calcular permanência média (dias de internação)
    try {
      const permanenciaQuery = `
        SELECT 
          AVG(EXTRACT(DAYS FROM AGE(COALESCE(data_saida, NOW()), data_entrada))) as media_dias
        FROM (
          SELECT data_entrada, data_saida FROM public."ALOCA_LEITO_UTI_PACIENTE"
          WHERE data_entrada >= NOW() - INTERVAL '${intervalo}'
          UNION ALL
          SELECT data_entrada, data_saida FROM public."ALOCA_LEITO_ENFERMARIA_PACIENTE"
          WHERE data_entrada >= NOW() - INTERVAL '${intervalo}'
        ) as todas_internacoes
      `;
      
      const permanenciaResult = await pool.query(permanenciaQuery);
      metricas.permanenciaMedia = permanenciaResult.rows[0]?.media_dias 
        ? Math.round(parseFloat(permanenciaResult.rows[0].media_dias)) 
        : 0;
    } catch (error) {
      console.error('Erro ao calcular permanência média:', error.message);
    }

    // Calcular total de altas
    try {
      const altasQuery = `
        SELECT COUNT(*) as total_altas
        FROM (
          SELECT 1 FROM public."ALOCA_LEITO_UTI_PACIENTE"
          WHERE data_saida IS NOT NULL 
            AND data_saida >= NOW() - INTERVAL '${intervalo}'
          UNION ALL
          SELECT 1 FROM public."ALOCA_LEITO_ENFERMARIA_PACIENTE"
          WHERE data_saida IS NOT NULL 
            AND data_saida >= NOW() - INTERVAL '${intervalo}'
        ) as altas
      `;
      
      const altasResult = await pool.query(altasQuery);
      metricas.totalAltas = parseInt(altasResult.rows[0]?.total_altas) || 0;
    } catch (error) {
      console.error('Erro ao calcular total de altas:', error.message);
    }

    // RESPOSTA FINAL
    const dados = {
      metricas,
      atendimentosPorEspecialidade,
      internacoesAtivas,
      procedimentosRealizados,
      origemPacientes,
      distribuicaoFaixaEtaria,
      evolucaoAtendimentos
    };

    console.log('Enviando resposta com dados reais do banco:', {
      especialidades: atendimentosPorEspecialidade.length,
      internacoes: internacoesAtivas.length,
      procedimentos: procedimentosRealizados.length,
      origem: origemPacientes.length,
      faixaEtaria: distribuicaoFaixaEtaria.length,
      evolucao: evolucaoAtendimentos.length
    });
    
    res.json(dados);
    
  } catch (error) {
    console.error('Erro geral no controller:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

export const exportPacientes = async (req, res) => {
  try {
    const { format, periodo, tipoAtendimento, faixaEtaria } = req.query;
    
    console.log('Exportando dados de pacientes:', { format, periodo, tipoAtendimento, faixaEtaria });
    
    // Chama a função principal para obter dados reais
    // Cria um objeto request simulado
    const mockReq = {
      query: { periodo, tipoAtendimento, faixaEtaria }
    };
    
    // Cria um objeto response simulado para capturar os dados
    let responseData = null;
    const mockRes = {
      json: (data) => {
        responseData = data;
        return mockRes;
      },
      status: () => mockRes
    };
    
    // Executa a função principal
    await historicoPacientes(mockReq, mockRes);
    
    if (format === 'json') {
      res.json(responseData);
    } else if (format === 'excel' || format === 'pdf') {
      // O frontend gera o PDF/Excel
      res.json(responseData);
    } else {
      res.status(400).json({ error: 'Formato inválido' });
    }
    
  } catch (error) {
    console.error('Erro ao exportar:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};