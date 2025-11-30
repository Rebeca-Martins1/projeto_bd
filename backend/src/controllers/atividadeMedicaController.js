import pool from "../config/db.js";

export const getAtividadeMedica = async (req, res) => {
  const { periodo, especialidade, medico } = req.query;

  try {
    // Métricas principais
    const metricasQuery = `
      SELECT 
        COUNT(*) as totalConsultas,
        ROUND(AVG(
          EXTRACT(EPOCH FROM (c.data_hora + INTERVAL '30 minutes' - c.data_hora))
        ) / 60, 1) as tempoMedio,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM public."CONSULTA" 
          WHERE data_hora >= NOW() - INTERVAL '2 months'
        )), 2) as taxaComparecimento,
        (SELECT COUNT(*) FROM public."MEDICO" WHERE ativo = true) as medicosAtivos
      FROM public."CONSULTA" c
      WHERE c.data_hora >= NOW() - INTERVAL '1 month'
      ${medico !== 'todos' ? `AND c.cpf_medico = '${medico}'` : ''}
    `;

    const metricasResult = await pool.query(metricasQuery);

    const metricas = {
      totalConsultas: parseInt(metricasResult.rows[0]?.totalconsultas) || 0,
      trendConsultas: 'up',
      variacaoConsultas: '+8%',
      tempoMedio: parseFloat(metricasResult.rows[0]?.tempomedio) || 0,
      trendTempo: 'neutral',
      variacaoTempo: '0min',
      taxaComparecimento: parseFloat(metricasResult.rows[0]?.taxacomparecimento) || 0,
      trendComparecimento: 'up',
      variacaoComparecimento: '+2%',
      medicosAtivos: parseInt(metricasResult.rows[0]?.medicosativos) || 0,
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

    // Especialidades
    const especialidadesQuery = `
      SELECT 
        em.especialidade,
        COUNT(c.data_hora) as totalConsultas,
        ROUND(AVG(
          EXTRACT(EPOCH FROM (c.data_hora + INTERVAL '30 minutes' - c.data_hora))
        ) / 60, 1) as tempoMedio,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM public."CONSULTA" 
          WHERE data_hora >= NOW() - INTERVAL '1 month'
        )), 2) as taxaComparecimento,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM public."CONSULTA" 
          WHERE data_hora >= NOW() - INTERVAL '2 months'
        )), 2) as crescimento
      FROM public."ESPECIALIDADE_MEDICO" em
      LEFT JOIN public."MEDICO" m ON em.cpf_medico = m.cpf
      LEFT JOIN public."CONSULTA" c ON m.cpf = c.cpf_medico
      WHERE c.data_hora >= NOW() - INTERVAL '1 month'
      ${especialidade !== 'todas' ? `AND em.especialidade = '${especialidade}'` : ''}
      GROUP BY em.especialidade
      ORDER BY totalConsultas DESC
    `;

    const especialidadesResult = await pool.query(especialidadesQuery);

    const especialidades = especialidadesResult.rows.map(esp => ({
      ...esp,
      cor: esp.especialidade === 'Cardiologia' ? '#ef4444' :
           esp.especialidade === 'Ortopedia' ? '#3b82f6' :
           esp.especialidade === 'Pediatria' ? '#10b981' :
           esp.especialidade === 'Ginecologia' ? '#f59e0b' : '#6b7280',
      percentual: Math.round((esp.totalconsultas / metricas.totalConsultas) * 100)
    }));

    // Top médicos
    const medicosQuery = `
      SELECT 
        p.nome,
        p.cpf,
        em.especialidade,
        COUNT(c.data_hora) as totalConsultas,
        ROUND(AVG(
          EXTRACT(EPOCH FROM (c.data_hora + INTERVAL '30 minutes' - c.data_hora))
        ) / 60, 1) as tempoMedio,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM public."CONSULTA" 
          WHERE data_hora >= NOW() - INTERVAL '1 month'
        )), 2) as eficiencia,
        m.disponivel
      FROM public."MEDICO" m
      JOIN public."PESSOA" p ON m.cpf = p.cpf
      JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
      LEFT JOIN public."CONSULTA" c ON m.cpf = c.cpf_medico
      WHERE c.data_hora >= NOW() - INTERVAL '1 month'
      GROUP BY p.nome, p.cpf, em.especialidade, m.disponivel
      ORDER BY totalConsultas DESC
      LIMIT 10
    `;

    const medicosResult = await pool.query(medicosQuery);

    // Evolução mensal
    const evolucaoMensal = [
      { mes: 'Jan', consultas: 720 },
      { mes: 'Fev', consultas: 680 },
      { mes: 'Mar', consultas: 810 }
    ];

    const dados = {
      metricas,
      especialidades,
      topMedicos: medicosResult.rows,
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