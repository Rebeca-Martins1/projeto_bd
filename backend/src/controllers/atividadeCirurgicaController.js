import pool from "../config/db.js";

export const getAtividadeCirurgica = async (req, res) => {
  const { periodo, tipoCirurgia, especialidade } = req.query;

  try {
    // Métricas principais
    const metricasQuery = `
      SELECT 
        COUNT(*) as totalCirurgias,
        COUNT(CASE WHEN aprovada = true THEN 1 END) as aprovadas,
        ROUND(AVG(duracao_minutos), 1) as tempoMedio,
        ROUND((COUNT(CASE WHEN aprovada = true THEN 1 END) * 100.0 / COUNT(*)), 2) as taxaAprovacao,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) FROM public."SALAS" WHERE tipo = 'CIRURGIA' AND ativo = true
        )), 2) as taxaOcupacao
      FROM public."CIRURGIA" 
      WHERE data_hora >= NOW() - INTERVAL '1 month'
      ${tipoCirurgia !== 'todas' ? `AND status = '${tipoCirurgia}'` : ''}
    `;

    const metricasResult = await pool.query(metricasQuery);

    const metricas = {
      totalCirurgias: parseInt(metricasResult.rows[0]?.totalcirurgias) || 0,
      trendTotal: 'up',
      variacaoTotal: '+15%',
      taxaAprovacao: parseFloat(metricasResult.rows[0]?.taxaaprovacao) || 0,
      trendAprovacao: 'up',
      variacaoAprovacao: '+3%',
      tempoMedio: parseFloat(metricasResult.rows[0]?.tempomedio) || 0,
      trendTempo: 'down',
      variacaoTempo: '-8min',
      taxaOcupacao: parseFloat(metricasResult.rows[0]?.taxaocupacao) || 0,
      trendOcupacao: 'up',
      variacaoOcupacao: '+5%',
      taxaCancelamento: 4.2,
      trendCancelamento: 'down',
      variacaoCancelamento: '-1.1%',
      tempoPreparacao: 45,
      trendPreparacao: 'neutral',
      variacaoPreparacao: '0min',
      cirurgiasEmergencia: 18,
      trendEmergencia: 'up',
      variacaoEmergencia: '+3',
      percentualEmergencia: 22,
      reintervencoes: 5,
      trendReintervencoes: 'down',
      variacaoReintervencoes: '-2',
      percentualReintervencoes: 6,
      distribuicaoTipo: [
        { tipo: 'Eletivas', quantidade: 52, percentual: 65, cor: '#3b82f6' },
        { tipo: 'Emergência', quantidade: 18, percentual: 22, cor: '#ef4444' },
        { tipo: 'Urgentes', quantidade: 10, percentual: 13, cor: '#f59e0b' }
      ]
    };

    // Cirurgias por especialidade
    const especialidadesQuery = `
      SELECT 
        em.especialidade,
        COUNT(c.data_hora) as totalCirurgias,
        COUNT(CASE WHEN c.status = 'eletiva' THEN 1 END) as eletivas,
        COUNT(CASE WHEN c.status = 'emergencia' THEN 1 END) as emergencia,
        ROUND(AVG(c.duracao_minutos), 1) as tempoMedio,
        ROUND((COUNT(CASE WHEN c.aprovada = true THEN 1 END) * 100.0 / COUNT(*)), 2) as taxaSucesso
      FROM public."ALOCA_MEDICO_CIRURGIA" amc
      JOIN public."MEDICO" m ON amc.cpf_medico = m.cpf
      JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
      JOIN public."CIRURGIA" c ON amc.data_hora = c.data_hora AND amc.cpf_paciente = c.cpf_paciente
      WHERE c.data_hora >= NOW() - INTERVAL '1 month'
      ${especialidade !== 'todas' ? `AND em.especialidade = '${especialidade}'` : ''}
      GROUP BY em.especialidade
      ORDER BY totalCirurgias DESC
    `;

    const especialidadesResult = await pool.query(especialidadesQuery);

    // Top cirurgiões
    const cirurgioesQuery = `
      SELECT 
        p.nome,
        em.especialidade,
        COUNT(amc.data_hora) as totalCirurgias,
        ROUND(AVG(c.duracao_minutos), 1) as tempoMedio,
        ROUND((COUNT(CASE WHEN c.aprovada = true THEN 1 END) * 100.0 / COUNT(*)), 2) as taxaSucesso,
        m.disponivel
      FROM public."ALOCA_MEDICO_CIRURGIA" amc
      JOIN public."MEDICO" m ON amc.cpf_medico = m.cpf
      JOIN public."PESSOA" p ON m.cpf = p.cpf
      JOIN public."ESPECIALIDADE_MEDICO" em ON m.cpf = em.cpf_medico
      JOIN public."CIRURGIA" c ON amc.data_hora = c.data_hora AND amc.cpf_paciente = c.cpf_paciente
      WHERE c.data_hora >= NOW() - INTERVAL '1 month'
      GROUP BY p.nome, em.especialidade, m.disponivel
      ORDER BY totalCirurgias DESC
      LIMIT 10
    `;

    const cirurgioesResult = await pool.query(cirurgioesQuery);

    // Próximas cirurgias
    const proximasQuery = `
      SELECT 
        c.data_hora,
        p.nome as paciente_nome,
        'Procedimento Cirúrgico' as procedimento,
        med.nome as cirurgiao_nome,
        c.n_sala,
        CASE 
          WHEN c.aprovada = true THEN 'confirmada'
          ELSE 'agendada'
        END as status
      FROM public."CIRURGIA" c
      JOIN public."PESSOA" p ON c.cpf_paciente = p.cpf
      JOIN public."ALOCA_MEDICO_CIRURGIA" amc ON c.data_hora = amc.data_hora AND c.cpf_paciente = amc.cpf_paciente
      JOIN public."PESSOA" med ON amc.cpf_medico = med.cpf
      WHERE c.data_hora >= NOW()
      ORDER BY c.data_hora ASC
      LIMIT 10
    `;

    const proximasResult = await pool.query(proximasQuery);

    // Evolução mensal
    const evolucaoMensal = [
      { mes: 'Jan', cirurgias: 68 },
      { mes: 'Fev', cirurgias: 72 },
      { mes: 'Mar', cirurgias: 80 }
    ];

    const dados = {
      metricas,
      cirurgiasPorEspecialidade: especialidadesResult.rows,
      topCirurgioes: cirurgioesResult.rows,
      proximasCirurgias: proximasResult.rows,
      evolucaoMensal
    };

    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar dados cirúrgicos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportCirurgias = async (req, res) => {
  try {
    const { format, periodo, tipoCirurgia, especialidade } = req.query;
    
    res.setHeader('Content-Disposition', `attachment; filename=atividade-cirurgica-${periodo}.${format}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.send('Relatório cirúrgico exportado');
  } catch (error) {
    console.error('Erro ao exportar dados cirúrgicos:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};