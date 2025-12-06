import pool from "../config/db.js";

export const atividadeMedica = async (req, res) => {
  const { periodo, especialidade, medico } = req.query;

  console.log('Recebendo requisição para atividade médica com parâmetros:', {
    periodo, especialidade, medico
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
    
    let metricas = {
      totalConsultas: 0,
      tempoMedio: 0,
      taxaComparecimento: 0,
      medicosAtivos: 0,
      taxaRemarcacao: 0,
      consultasRetorno: 0,
      novosPacientes: 0
    };

    // 1. Total de consultas no período
    const totalConsultasQuery = {
      text: `
        SELECT COUNT(*) as totalConsultas
        FROM public."CONSULTA"
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
        ${medico !== 'todos' ? `AND cpf_medico = $1` : ''}
      `,
      values: medico !== 'todos' ? [medico] : []
    };
    
    const totalConsultasResult = await pool.query(totalConsultasQuery);
    metricas.totalConsultas = parseInt(totalConsultasResult.rows[0]?.totalconsultas) || 0;

    // 2. Tempo médio das consultas
    const tempoMedioQuery = {
      text: `
        SELECT 
          CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(AVG(
              EXTRACT(EPOCH FROM COALESCE(data_hora_fim, data_hora + INTERVAL '30 minutes') - data_hora)
            ) / 60, 1)
          END as tempoMedio
        FROM public."CONSULTA"
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
        AND data_hora IS NOT NULL
        ${medico !== 'todos' ? `AND cpf_medico = $1` : ''}
      `,
      values: medico !== 'todos' ? [medico] : []
    };
    
    const tempoMedioResult = await pool.query(tempoMedioQuery);
    metricas.tempoMedio = parseFloat(tempoMedioResult.rows[0]?.tempomedio) || 0;

    // 3. Taxa de comparecimento (consultas com status = 'REALIZADA')
    const comparecimentoQuery = {
      text: `
        SELECT 
          COUNT(*) as consultas_realizadas,
          (COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM public."CONSULTA" 
            WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
            ${medico !== 'todos' ? `AND cpf_medico = $2` : ''}), 0)) as taxa_comparecimento
        FROM public."CONSULTA"
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
        AND status_consulta = 'REALIZADA'
        ${medico !== 'todos' ? `AND cpf_medico = $1` : ''}
      `,
      values: medico !== 'todos' ? [medico, medico] : []
    };
    
    const comparecimentoResult = await pool.query(comparecimentoQuery);
    metricas.taxaComparecimento = parseFloat(comparecimentoResult.rows[0]?.taxa_comparecimento) || 0;

    // 4. Médicos ativos
    const medicosAtivosQuery = {
      text: `
        SELECT COUNT(*) as medicosAtivos
        FROM public."MEDICO"
        WHERE ativo = true
      `
    };
    
    const medicosAtivosResult = await pool.query(medicosAtivosQuery);
    metricas.medicosAtivos = parseInt(medicosAtivosResult.rows[0]?.medicosativos) || 0;

    // 5. Taxa de remarcação
    const remarcacaoQuery = {
      text: `
        SELECT 
          COUNT(*) as consultas_remarcadas,
          (COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM public."CONSULTA" 
            WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
            ${medico !== 'todos' ? `AND cpf_medico = $2` : ''}), 0)) as taxa_remarcacao
        FROM public."CONSULTA"
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
        AND status_consulta = 'REMARCADA'
        ${medico !== 'todos' ? `AND cpf_medico = $1` : ''}
      `,
      values: medico !== 'todos' ? [medico, medico] : []
    };
    
    const remarcacaoResult = await pool.query(remarcacaoQuery);
    metricas.taxaRemarcacao = parseFloat(remarcacaoResult.rows[0]?.taxa_remarcacao) || 0;

    // 6. Consultas de retorno (pacientes com mais de 1 consulta no período)
    const retornoQuery = {
      text: `
        SELECT COUNT(*) as consultas_retorno
        FROM (
          SELECT cpf_paciente, COUNT(*) as consultas
          FROM public."CONSULTA"
          WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
          ${medico !== 'todos' ? `AND cpf_medico = $1` : ''}
          GROUP BY cpf_paciente
          HAVING COUNT(*) > 1
        ) as retornos
      `,
      values: medico !== 'todos' ? [medico] : []
    };
    
    const retornoResult = await pool.query(retornoQuery);
    metricas.consultasRetorno = parseInt(retornoResult.rows[0]?.consultas_retorno) || 0;

    // 7. Novos pacientes (primeira consulta no período)
    const novosPacientesQuery = {
      text: `
        SELECT COUNT(DISTINCT cpf_paciente) as novos_pacientes
        FROM public."CONSULTA" c
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
        AND NOT EXISTS (
          SELECT 1 FROM public."CONSULTA" c2
          WHERE c2.cpf_paciente = c.cpf_paciente
          AND c2.data_hora < NOW() - INTERVAL '${intervalo}'
        )
        ${medico !== 'todos' ? `AND cpf_medico = $1` : ''}
      `,
      values: medico !== 'todos' ? [medico] : []
    };
    
    const novosPacientesResult = await pool.query(novosPacientesQuery);
    metricas.novosPacientes = parseInt(novosPacientesResult.rows[0]?.novos_pacientes) || 0;

    // ESPECIALIDADES
    const especialidadesQuery = {
      text: `
        SELECT 
          em.especialidade,
          COUNT(c.data_hora) as totalConsultas,
          CASE 
            WHEN COUNT(c.data_hora) = 0 THEN 0
            ELSE ROUND(AVG(
              EXTRACT(EPOCH FROM COALESCE(c.data_hora_fim, c.data_hora + INTERVAL '30 minutes') - c.data_hora)
            ) / 60, 1)
          END as tempoMedio,
          COUNT(CASE WHEN c.status_consulta = 'REALIZADA' THEN 1 END) * 100.0 / 
            NULLIF(COUNT(c.data_hora), 0) as taxaComparecimento,
          COUNT(CASE WHEN c.status_consulta = 'REMARCADA' THEN 1 END) * 100.0 / 
            NULLIF(COUNT(c.data_hora), 0) as taxaRemarcacao
        FROM public."ESPECIALIDADE_MEDICO" em
        LEFT JOIN public."MEDICO" m ON em.cpf_medico = m.cpf
        LEFT JOIN public."CONSULTA" c ON m.cpf = c.cpf_medico 
          AND c.data_hora >= NOW() - INTERVAL '${intervalo}'
        ${especialidade !== 'todas' ? `WHERE em.especialidade = $1` : ''}
        GROUP BY em.especialidade
        HAVING COUNT(c.data_hora) > 0
        ORDER BY COUNT(c.data_hora) DESC
      `,
      values: especialidade !== 'todas' ? [especialidade] : []
    };

    const especialidadesResult = await pool.query(especialidadesQuery);
    const especialidades = especialidadesResult.rows.map(esp => {
      const totalConsultas = parseInt(esp.totalconsultas) || 0;
      const taxaComparecimento = parseFloat(esp.taxacomparecimento) || 0;
      const taxaRemarcacao = parseFloat(esp.taxaremarcacao) || 0;
      
      // Determinar cor baseada na especialidade
      let cor = '#6b7280';
      const espLower = (esp.especialidade || '').toLowerCase();
      if (espLower.includes('cardio')) cor = '#ef4444';
      else if (espLower.includes('ortop') || espLower.includes('trauma')) cor = '#3b82f6';
      else if (espLower.includes('pediatr')) cor = '#10b981';
      else if (espLower.includes('gineco')) cor = '#f59e0b';
      else if (espLower.includes('derma')) cor = '#8b5cf6';
      else if (espLower.includes('neuro')) cor = '#06b6d4';

      return {
        especialidade: esp.especialidade || 'Não especificada',
        totalConsultas: totalConsultas,
        tempoMedio: parseFloat(esp.tempomedio) || 0,
        taxaComparecimento: taxaComparecimento,
        taxaRemarcacao: taxaRemarcacao,
        cor: cor,
        percentual: metricas.totalConsultas > 0 ? 
          Math.round((totalConsultas / metricas.totalConsultas) * 100) : 0
      };
    });

    // TOP MÉDICOS
    const medicosQuery = {
      text: `
        SELECT 
          p.nome,
          p.cpf,
          STRING_AGG(DISTINCT em.especialidade, ', ') as especialidades,
          COUNT(c.data_hora) as totalConsultas,
          CASE 
            WHEN COUNT(c.data_hora) = 0 THEN 0
            ELSE ROUND(AVG(
              EXTRACT(EPOCH FROM COALESCE(c.data_hora_fim, c.data_hora + INTERVAL '30 minutes') - c.data_hora)
            ) / 60, 1)
          END as tempoMedio,
          COUNT(CASE WHEN c.status_consulta = 'REALIZADA' THEN 1 END) * 100.0 / 
            NULLIF(COUNT(c.data_hora), 0) as taxaRealizacao,
          m.disponivel
        FROM public."MEDICO" m
        JOIN public."PESSOA" p ON m.cpf = p.cpf
        LEFT JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
        LEFT JOIN public."CONSULTA" c ON m.cpf = c.cpf_medico 
          AND c.data_hora >= NOW() - INTERVAL '${intervalo}'
        WHERE m.ativo = true
        ${medico !== 'todos' ? `AND m.cpf = $1` : ''}
        GROUP BY p.nome, p.cpf, m.disponivel
        HAVING COUNT(c.data_hora) > 0
        ORDER BY COUNT(c.data_hora) DESC
        LIMIT 15
      `,
      values: medico !== 'todos' ? [medico] : []
    };

    const medicosResult = await pool.query(medicosQuery);
    const topMedicos = medicosResult.rows.map(med => {
      const totalConsultas = parseInt(med.totalconsultas) || 0;
      const taxaRealizacao = parseFloat(med.taxarealizacao) || 0;
      
      // Calcular eficiência baseada em tempo médio e taxa de realização
      let eficiencia = 0;
      if (parseFloat(med.tempomedio) > 0 && taxaRealizacao > 0) {
        eficiencia = Math.round((taxaRealizacao * 100) / parseFloat(med.tempomedio));
      }

      return {
        nome: med.nome || 'Médico não identificado',
        cpf: med.cpf || '00000000000',
        especialidade: med.especialidades || 'Não especificada',
        totalConsultas: totalConsultas,
        tempoMedio: parseFloat(med.tempomedio) || 0,
        eficiencia: Math.min(eficiencia, 100), // Limitar a 100%
        disponivel: med.disponivel === true,
        taxaRealizacao: taxaRealizacao
      };
    });

    // EVOLUÇÃO MENSAL
    let evolucaoQuery = '';
    
    if (periodo === 'ano') {
      evolucaoQuery = `
        SELECT 
          TO_CHAR(data_hora, 'Mon') as mes,
          COUNT(*) as consultas
        FROM public."CONSULTA"
        WHERE data_hora >= NOW() - INTERVAL '1 year'
        ${medico !== 'todos' ? `AND cpf_medico = '${medico}'` : ''}
        GROUP BY TO_CHAR(data_hora, 'Mon'), EXTRACT(MONTH FROM data_hora)
        ORDER BY EXTRACT(MONTH FROM data_hora)
        LIMIT 12
      `;
    } else if (periodo === 'trimestre') {
      evolucaoQuery = `
        SELECT 
          'Semana ' || EXTRACT(WEEK FROM data_hora) - EXTRACT(WEEK FROM DATE_TRUNC('quarter', NOW())) + 1 as semana,
          COUNT(*) as consultas
        FROM public."CONSULTA"
        WHERE data_hora >= NOW() - INTERVAL '3 months'
        ${medico !== 'todos' ? `AND cpf_medico = '${medico}'` : ''}
        GROUP BY EXTRACT(WEEK FROM data_hora)
        ORDER BY EXTRACT(WEEK FROM data_hora)
        LIMIT 13
      `;
    } else if (periodo === 'mes') {
      evolucaoQuery = `
        SELECT 
          'Dia ' || EXTRACT(DAY FROM data_hora) as dia,
          COUNT(*) as consultas
        FROM public."CONSULTA"
        WHERE data_hora >= NOW() - INTERVAL '1 month'
        ${medico !== 'todos' ? `AND cpf_medico = '${medico}'` : ''}
        GROUP BY EXTRACT(DAY FROM data_hora)
        ORDER BY EXTRACT(DAY FROM data_hora)
      `;
    } else { // semana
      evolucaoQuery = `
        SELECT 
          TO_CHAR(data_hora, 'Dy') as dia_semana,
          COUNT(*) as consultas
        FROM public."CONSULTA"
        WHERE data_hora >= NOW() - INTERVAL '1 week'
        ${medico !== 'todos' ? `AND cpf_medico = '${medico}'` : ''}
        GROUP BY TO_CHAR(data_hora, 'Dy'), EXTRACT(DOW FROM data_hora)
        ORDER BY EXTRACT(DOW FROM data_hora)
      `;
    }

    const evolucaoResult = await pool.query(evolucaoQuery);
    const evolucaoMensal = evolucaoResult.rows.map(item => ({
      mes: periodo === 'ano' ? item.mes : 
           periodo === 'trimestre' ? item.semana : 
           periodo === 'mes' ? item.dia : 
           item.dia_semana,
      consultas: parseInt(item.consultas) || 0
    }));

    // HORÁRIO DE PICO
    const horarioPicoQuery = {
      text: `
        SELECT 
          EXTRACT(HOUR FROM data_hora) as hora,
          COUNT(*) as consultas
        FROM public."CONSULTA"
        WHERE data_hora >= NOW() - INTERVAL '${intervalo}'
        ${medico !== 'todos' ? `AND cpf_medico = $1` : ''}
        GROUP BY EXTRACT(HOUR FROM data_hora)
        ORDER BY COUNT(*) DESC
        LIMIT 1
      `,
      values: medico !== 'todos' ? [medico] : []
    };

    const horarioPicoResult = await pool.query(horarioPicoQuery);
    const horarioPicoRow = horarioPicoResult.rows[0];
    
    let horarioPico = 'N/A';
    let periodoPico = 'N/A';
    
    if (horarioPicoRow) {
      const hora = parseInt(horarioPicoRow.hora) || 0;
      horarioPico = `${hora.toString().padStart(2, '0')}:00 - ${(hora + 1).toString().padStart(2, '0')}:00`;
      
      if (hora >= 6 && hora < 12) periodoPico = 'Manhã';
      else if (hora >= 12 && hora < 18) periodoPico = 'Tarde';
      else periodoPico = 'Noite';
    }

    // RESPOSTA FINAL
    const dados = {
      metricas: {
        ...metricas,
        horarioPico: horarioPico,
        periodoPico: periodoPico,
        // Tendências serão calculadas no frontend ou em consulta separada
        trendConsultas: 'neutral',
        variacaoConsultas: '0%',
        trendTempo: 'neutral',
        variacaoTempo: '0min',
        trendComparecimento: 'neutral',
        variacaoComparecimento: '0%',
        trendMedicos: 'neutral',
        variacaoMedicos: '0',
        trendRemarcacao: 'neutral',
        variacaoRemarcacao: '0%',
        trendRetorno: 'neutral',
        variacaoRetorno: '0%',
        trendNovosPacientes: 'neutral',
        variacaoNovosPacientes: '0%'
      },
      especialidades,
      topMedicos,
      evolucaoMensal
    };

    console.log('Enviando resposta com dados reais do banco:');
    console.log('- Total consultas:', metricas.totalConsultas);
    console.log('- Especialidades:', especialidades.length);
    console.log('- Top médicos:', topMedicos.length);
    console.log('- Evolução:', evolucaoMensal.length);
    
    res.json(dados);
    
  } catch (error) {
    console.error('Erro geral no controller de atividade médica:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      stack: error.stack
    });
  }
};

export const exportAtividadeMedica = async (req, res) => {
  try {
    const { formato, periodo, especialidade, medico } = req.query;
    
    console.log('Exportando dados de atividade médica:', { formato, periodo, especialidade, medico });
    
    // Buscar os mesmos dados da consulta principal
    const response = await atividadeMedica({ query: { periodo, especialidade, medico } }, res, true);
    
    if (formato === 'json') {
      res.json(response);
    } else if (formato === 'excel' || formato === 'pdf') {
      // O frontend gera o PDF/Excel
      res.json(response);
    } else {
      res.status(400).json({ error: 'Formato inválido' });
    }
    
  } catch (error) {
    console.error('Erro ao exportar dados médicos:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};