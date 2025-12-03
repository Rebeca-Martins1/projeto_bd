import pool from "../config/db.js";

export const atividadeMedica = async (req, res) => {
  const { periodo, especialidade, medico } = req.query;

  try {
    // Métricas principais - SEM COALESCE
    const metricasQuery = `
      SELECT 
        COUNT(*) as totalConsultas,
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND(AVG(
            EXTRACT(EPOCH FROM (c.data_hora + INTERVAL '30 minutes' - c.data_hora))
          ) / 60, 1)
        END as tempoMedio,
        CASE 
          WHEN (SELECT COUNT(*) FROM public."CONSULTA" 
                WHERE data_hora >= NOW() - INTERVAL '2 months') = 0 THEN 0
          ELSE ROUND((COUNT(*) * 100.0 / (
            SELECT COUNT(*) FROM public."CONSULTA" 
            WHERE data_hora >= NOW() - INTERVAL '2 months'
          )), 2)
        END as taxaComparecimento,
        (SELECT COUNT(*) FROM public."MEDICO" WHERE ativo = true) as medicosAtivos
      FROM public."CONSULTA" c
      WHERE c.data_hora >= NOW() - INTERVAL '1 month'
      ${medico !== 'todos' ? `AND c.cpf_medico = '${medico}'` : ''}
    `;

    const metricasResult = await pool.query(metricasQuery);
    const metricasRow = metricasResult.rows[0] || {};

    const totalConsultas = parseInt(metricasRow.totalconsultas) || 0;
    
    const metricas = {
      totalConsultas: totalConsultas,
      trendConsultas: 'up',
      variacaoConsultas: '+8%',
      tempoMedio: parseFloat(metricasRow.tempomedio) || 0,
      trendTempo: 'neutral',
      variacaoTempo: '0min',
      taxaComparecimento: parseFloat(metricasRow.taxacomparecimento) || 0,
      trendComparecimento: 'up',
      variacaoComparecimento: '+2%',
      medicosAtivos: parseInt(metricasRow.medicosativos) || 0,
      trendMedicos: 'neutral',
      variacaoMedicos: '0',
      horarioPico: '09:00 - 11:00',
      periodoPico: 'Manhã',
      taxaRemarcacao: 12.5,
      trendRemarcacao: 'down',
      variacaoRemarcacao: '-1.8%',
      consultasRetorno: 45,
      trendRetorno: 'up',
      variacaoRetorno: '+3%',
      novosPacientes: 156,
      trendNovosPacientes: 'up',
      variacaoNovosPacientes: '+12%'
    };

    // Especialidades - SEM COALESCE
    const especialidadesQuery = `
      SELECT 
        em.especialidade,
        COUNT(c.data_hora) as totalConsultas,
        CASE 
          WHEN COUNT(c.data_hora) = 0 THEN 0
          ELSE ROUND(AVG(
            EXTRACT(EPOCH FROM (c.data_hora + INTERVAL '30 minutes' - c.data_hora))
          ) / 60, 1)
        END as tempoMedio,
        CASE 
          WHEN ${totalConsultas} = 0 THEN 0
          ELSE ROUND((COUNT(c.data_hora) * 100.0 / ${totalConsultas}), 2)
        END as taxaComparecimento,
        CASE 
          WHEN (
            SELECT COUNT(*) FROM public."CONSULTA" 
            WHERE data_hora >= NOW() - INTERVAL '2 months'
          ) = 0 THEN 0
          ELSE ROUND((COUNT(c.data_hora) * 100.0 / (
            SELECT COUNT(*) FROM public."CONSULTA" 
            WHERE data_hora >= NOW() - INTERVAL '2 months'
          )), 2)
        END as crescimento
      FROM public."ESPECIALIDADE_MEDICO" em
      LEFT JOIN public."MEDICO" m ON em.cpf_medico = m.cpf
      LEFT JOIN public."CONSULTA" c ON m.cpf = c.cpf_medico 
        AND c.data_hora >= NOW() - INTERVAL '1 month'
      ${especialidade !== 'todas' ? `WHERE em.especialidade = '${especialidade}'` : ''}
      GROUP BY em.especialidade
      ORDER BY COUNT(c.data_hora) DESC
    `;

    const especialidadesResult = await pool.query(especialidadesQuery);

    // Processar especialidades manualmente
    const especialidades = especialidadesResult.rows.map(esp => {
      const totalConsultasEspecialidade = parseInt(esp.totalconsultas) || 0;
      const tempoMedio = parseFloat(esp.tempomedio) || 0;
      const taxaComparecimento = parseFloat(esp.taxacomparecimento) || 0;
      const crescimento = parseFloat(esp.crescimento) || 0;
      
      let cor = '#6b7280';
      if (esp.especialidade === 'Cardiologia') {
        cor = '#ef4444';
      } else if (esp.especialidade === 'Ortopedia') {
        cor = '#3b82f6';
      } else if (esp.especialidade === 'Pediatria') {
        cor = '#10b981';
      } else if (esp.especialidade === 'Ginecologia') {
        cor = '#f59e0b';
      }

      const percentual = totalConsultas > 0 ? 
        Math.round((totalConsultasEspecialidade / totalConsultas) * 100) : 0;

      return {
        especialidade: esp.especialidade || 'Não especificada',
        totalConsultas: totalConsultasEspecialidade,
        tempoMedio: tempoMedio,
        taxaComparecimento: taxaComparecimento,
        crescimento: crescimento,
        cor: cor,
        percentual: percentual
      };
    });

    // Top médicos - SEM COALESCE
    const medicosQuery = `
      SELECT 
        p.nome,
        p.cpf,
        em.especialidade,
        COUNT(c.data_hora) as totalConsultas,
        CASE 
          WHEN COUNT(c.data_hora) = 0 THEN 0
          ELSE ROUND(AVG(
            EXTRACT(EPOCH FROM (c.data_hora + INTERVAL '30 minutes' - c.data_hora))
          ) / 60, 1)
        END as tempoMedio,
        CASE 
          WHEN ${totalConsultas} = 0 THEN 0
          ELSE ROUND((COUNT(c.data_hora) * 100.0 / ${totalConsultas}), 2)
        END as eficiencia,
        m.disponivel
      FROM public."MEDICO" m
      JOIN public."PESSOA" p ON m.cpf = p.cpf
      JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
      LEFT JOIN public."CONSULTA" c ON m.cpf = c.cpf_medico 
        AND c.data_hora >= NOW() - INTERVAL '1 month'
      GROUP BY p.nome, p.cpf, em.especialidade, m.disponivel
      ORDER BY COUNT(c.data_hora) DESC
      LIMIT 10
    `;

    const medicosResult = await pool.query(medicosQuery);

    // Processar médicos manualmente
    const topMedicos = medicosResult.rows.map(med => {
      const totalConsultasMed = parseInt(med.totalconsultas) || 0;
      const tempoMedio = parseFloat(med.tempomedio) || 0;
      const eficiencia = parseFloat(med.eficiencia) || 0;
      const disponivel = med.disponivel === true;

      return {
        nome: med.nome || 'Médico não identificado',
        cpf: med.cpf || '00000000000',
        especialidade: med.especialidade || 'Não especificada',
        totalConsultas: totalConsultasMed,
        tempoMedio: tempoMedio,
        eficiencia: eficiencia,
        disponivel: disponivel
      };
    });

    // Evolução mensal
    const evolucaoMensal = [
      { mes: 'Jan', consultas: 720 },
      { mes: 'Fev', consultas: 680 },
      { mes: 'Mar', consultas: 810 }
    ];

    const dados = {
      metricas,
      especialidades,
      topMedicos,
      evolucaoMensal
    };

    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar dados médicos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportConsultas = async (req, res) => {
  try {
    const { format, periodo, especialidade, medico } = req.query;
    
    res.setHeader('Content-Disposition', `attachment; filename=atividade-medica-${periodo}.${format}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.send('Relatório médico exportado');
  } catch (error) {
    console.error('Erro ao exportar dados médicos:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};