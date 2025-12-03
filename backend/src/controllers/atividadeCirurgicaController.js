import pool from "../config/db.js";

export const atividadeCirurgica = async (req, res) => {
  const { periodo, tipoCirurgia, especialidade } = req.query;

  try {
    // Métricas principais - SEM COALESCE
    const metricasQuery = `
      SELECT 
        COUNT(*) as totalCirurgias,
        COUNT(CASE WHEN aprovada = true THEN 1 END) as aprovadas,
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND(AVG(duracao_minutos), 1)
        END as tempoMedio,
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN aprovada = true THEN 1 END) * 100.0 / COUNT(*)), 2)
        END as taxaAprovacao,
        CASE 
          WHEN (SELECT COUNT(*) FROM public."SALAS" WHERE tipo = 'CIRURGIA' AND ativo = true) = 0 THEN 0
          ELSE ROUND((COUNT(*) * 100.0 / (
            SELECT COUNT(*) FROM public."SALAS" WHERE tipo = 'CIRURGIA' AND ativo = true
          )), 2)
        END as taxaOcupacao
      FROM public."CIRURGIA" 
      WHERE data_hora >= NOW() - INTERVAL '1 month'
      ${tipoCirurgia !== 'todas' ? `AND status = '${tipoCirurgia}'` : ''}
    `;

    const metricasResult = await pool.query(metricasQuery);
    const metricasRow = metricasResult.rows[0] || {};

    const metricas = {
      totalCirurgias: parseInt(metricasRow.totalcirurgias) || 0,
      trendTotal: 'up',
      variacaoTotal: '+15%',
      taxaAprovacao: parseFloat(metricasRow.taxaaprovacao) || 0,
      trendAprovacao: 'up',
      variacaoAprovacao: '+3%',
      tempoMedio: parseFloat(metricasRow.tempomedio) || 0,
      trendTempo: 'down',
      variacaoTempo: '-8min',
      taxaOcupacao: parseFloat(metricasRow.taxaocupacao) || 0,
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

    // Cirurgias por especialidade - SEM COALESCE
    const especialidadesQuery = `
      SELECT 
        em.especialidade,
        COUNT(c.data_hora) as totalCirurgias,
        COUNT(CASE WHEN c.status = 'eletiva' THEN 1 END) as eletivas,
        COUNT(CASE WHEN c.status = 'emergencia' THEN 1 END) as emergencia,
        CASE 
          WHEN COUNT(c.data_hora) = 0 THEN 0
          ELSE ROUND(AVG(c.duracao_minutos), 1)
        END as tempoMedio,
        CASE 
          WHEN COUNT(c.data_hora) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN c.aprovada = true THEN 1 END) * 100.0 / COUNT(c.data_hora)), 2)
        END as taxaSucesso
      FROM public."ESPECIALIDADE_MEDICO" em
      LEFT JOIN public."MEDICO" m ON em.cpf_medico = m.cpf
      LEFT JOIN public."ALOCA_MEDICO_CIRURGIA" amc ON m.cpf = amc.cpf_medico
      LEFT JOIN public."CIRURGIA" c ON amc.data_hora = c.data_hora AND amc.cpf_paciente = c.cpf_paciente
        AND c.data_hora >= NOW() - INTERVAL '1 month'
      ${especialidade !== 'todas' ? `WHERE em.especialidade = '${especialidade}'` : ''}
      GROUP BY em.especialidade
      HAVING COUNT(c.data_hora) > 0
      ORDER BY totalCirurgias DESC
    `;

    const especialidadesResult = await pool.query(especialidadesQuery);

    // Processar especialidades manualmente
    const cirurgiasPorEspecialidade = especialidadesResult.rows.map(esp => {
      return {
        especialidade: esp.especialidade || 'Não especificada',
        totalCirurgias: parseInt(esp.totalcirurgias) || 0,
        eletivas: parseInt(esp.eletivas) || 0,
        emergencia: parseInt(esp.emergencia) || 0,
        tempoMedio: parseFloat(esp.tempomedio) || 0,
        taxaSucesso: parseFloat(esp.taxasucesso) || 0
      };
    });

    // Top cirurgiões - SEM COALESCE
    const cirurgioesQuery = `
      SELECT 
        p.nome,
        em.especialidade,
        COUNT(amc.data_hora) as totalCirurgias,
        CASE 
          WHEN COUNT(amc.data_hora) = 0 THEN 0
          ELSE ROUND(AVG(c.duracao_minutos), 1)
        END as tempoMedio,
        CASE 
          WHEN COUNT(amc.data_hora) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN c.aprovada = true THEN 1 END) * 100.0 / COUNT(amc.data_hora)), 2)
        END as taxaSucesso,
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

    // Processar cirurgiões manualmente
    const topCirurgioes = cirurgioesResult.rows.map(cirurgiao => {
      return {
        nome: cirurgiao.nome || 'Cirurgião não identificado',
        especialidade: cirurgiao.especialidade || 'Não especificada',
        totalCirurgias: parseInt(cirurgiao.totalcirurgias) || 0,
        tempoMedio: parseFloat(cirurgiao.tempomedio) || 0,
        taxaSucesso: parseFloat(cirurgiao.taxasucesso) || 0,
        disponivel: cirurgiao.disponivel === true
      };
    });

    // Próximas cirurgias - SEM COALESCE (não precisa)
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

    // Processar próximas cirurgias manualmente
    const proximasCirurgias = proximasResult.rows.map(cirurgia => {
      return {
        data_hora: cirurgia.data_hora || new Date(),
        paciente_nome: cirurgia.paciente_nome || 'Paciente não identificado',
        procedimento: cirurgia.procedimento || 'Procedimento Cirúrgico',
        cirurgiao_nome: cirurgia.cirurgiao_nome || 'Cirurgião não identificado',
        n_sala: parseInt(cirurgia.n_sala) || 0,
        status: cirurgia.status || 'agendada'
      };
    });

    // Evolução mensal
    const evolucaoMensal = [
      { mes: 'Jan', cirurgias: 68 },
      { mes: 'Fev', cirurgias: 72 },
      { mes: 'Mar', cirurgias: 80 }
    ];

    const dados = {
      metricas,
      cirurgiasPorEspecialidade,
      topCirurgioes,
      proximasCirurgias,
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