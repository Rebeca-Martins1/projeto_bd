import pool from "../config/db.js";

export const getHistoricoPacientes = async (req, res) => {
  const { periodo, tipoAtendimento, faixaEtaria } = req.query;

  try {
    // Métricas principais
    const metricasQuery = `
      SELECT 
        (SELECT COUNT(*) FROM public."CONSULTA" 
         WHERE data_hora >= NOW() - INTERVAL '1 month') as totalAtendidos,
        (SELECT COUNT(*) FROM public."PACIENTE") as totalPacientes,
        (SELECT COUNT(*) FROM public."ALOCA_LEITO_UTI_PACIENTE" WHERE data_saida IS NULL) + 
        (SELECT COUNT(*) FROM public."ALOCA_LEITO_ENFERMARIA_PACIENTE" WHERE data_saida IS NULL) as internadosAtivos,
        ROUND(AVG(
          EXTRACT(EPOCH FROM (data_saida - data_entrada)) / 86400
        ), 1) as permanenciaMedia
      FROM public."ALOCA_LEITO_UTI_PACIENTE" 
      WHERE data_saida IS NOT NULL
      UNION ALL
      SELECT 
        ROUND(AVG(
          EXTRACT(EPOCH FROM (data_saida - data_entrada)) / 86400
        ), 1) as permanenciaMedia
      FROM public."ALOCA_LEITO_ENFERMARIA_PACIENTE" 
      WHERE data_saida IS NOT NULL
    `;

    const metricasResult = await pool.query(metricasQuery);

    const metricas = {
      totalAtendidos: parseInt(metricasResult.rows[0]?.totalatendidos) || 0,
      trendAtendidos: 'up',
      variacaoAtendidos: '+12%',
      taxaRemarcacao: 8.5,
      trendRemarcacao: 'down',
      variacaoRemarcacao: '-1.2%',
      permanenciaMedia: parseFloat(metricasResult.rows[0]?.permanenciamedia) || 0,
      trendPermanencia: 'neutral',
      variacaoPermanencia: '0 dias',
      taxaRetorno: 65.3,
      trendRetorno: 'up',
      variacaoRetorno: '+3.2%',
      taxaOcupacaoLeitos: 75.2,
      trendOcupacao: 'up',
      variacaoOcupacao: '+2.1%',
      totalAltas: 124,
      trendAltas: 'up',
      variacaoAltas: '+8',
      tempoMedioEspera: 28,
      trendEspera: 'down',
      variacaoEspera: '-5 min',
      taxaSatisfacao: 92.1,
      trendSatisfacao: 'up',
      variacaoSatisfacao: '+1.5%'
    };

    // Atendimentos por especialidade
    const especialidadesQuery = `
      SELECT 
        em.especialidade,
        COUNT(c.data_hora) as totalAtendimentos,
        COUNT(DISTINCT c.cpf_paciente) as novosPacientes,
        (COUNT(c.data_hora) - COUNT(DISTINCT c.cpf_paciente)) as retornos,
        ROUND(AVG(
          EXTRACT(YEAR FROM AGE(NOW(), pc.data_nascimento))
        ), 1) as mediaIdade,
        ROUND((COUNT(c.data_hora) * 100.0 / (
          SELECT COUNT(*) FROM public."CONSULTA" 
          WHERE data_hora >= NOW() - INTERVAL '1 month'
        )), 2) as percentual
      FROM public."ESPECIALIDADE_MEDICO" em
      LEFT JOIN public."MEDICO" m ON em.cpf_medico = m.cpf
      LEFT JOIN public."CONSULTA" c ON m.cpf = c.cpf_medico
      LEFT JOIN public."PACIENTE" pc ON c.cpf_paciente = pc.cpf
      WHERE c.data_hora >= NOW() - INTERVAL '1 month'
      GROUP BY em.especialidade
      ORDER BY totalAtendimentos DESC
      LIMIT 10
    `;

    const especialidadesResult = await pool.query(especialidadesQuery);

    const atendimentosPorEspecialidade = especialidadesResult.rows.map(esp => ({
      ...esp,
      crescimento: Math.round(Math.random() * 20 - 10)
    }));

    // Internações ativas
    const internacoesQuery = `
      SELECT 
        p.nome as paciente_nome,
        pc.data_nascimento,
        'UTI' as tipo_leito,
        alu.n_sala,
        'Em observação' as diagnostico_principal,
        EXTRACT(DAYS FROM AGE(NOW(), alu.data_entrada)) as dias_internado,
        CASE 
          WHEN EXTRACT(DAYS FROM AGE(NOW(), alu.data_entrada)) > 10 THEN 'critico'
          WHEN EXTRACT(DAYS FROM AGE(NOW(), alu.data_entrada)) > 5 THEN 'melhorando'
          ELSE 'estavel'
        END as status
      FROM public."ALOCA_LEITO_UTI_PACIENTE" alu
      JOIN public."PESSOA" p ON alu.cpf_paciente = p.cpf
      JOIN public."PACIENTE" pc ON alu.cpf_paciente = pc.cpf
      WHERE alu.data_saida IS NULL
      UNION ALL
      SELECT 
        p.nome as paciente_nome,
        pc.data_nascimento,
        'ENFERMARIA' as tipo_leito,
        ale.n_sala,
        'Em observação' as diagnostico_principal,
        EXTRACT(DAYS FROM AGE(NOW(), ale.data_entrada)) as dias_internado,
        CASE 
          WHEN EXTRACT(DAYS FROM AGE(NOW(), ale.data_entrada)) > 10 THEN 'critico'
          WHEN EXTRACT(DAYS FROM AGE(NOW(), ale.data_entrada)) > 5 THEN 'melhorando'
          ELSE 'estavel'
        END as status
      FROM public."ALOCA_LEITO_ENFERMARIA_PACIENTE" ale
      JOIN public."PESSOA" p ON ale.cpf_paciente = p.cpf
      JOIN public."PACIENTE" pc ON ale.cpf_paciente = pc.cpf
      WHERE ale.data_saida IS NULL
      LIMIT 10
    `;

    const internacoesResult = await pool.query(internacoesQuery);

    // Procedimentos realizados
    const procedimentosQuery = `
      SELECT 
        'Consulta de Rotina' as procedimento,
        COUNT(*) as quantidade,
        'Clínica Geral' as especialidade,
        15 as tempo_medio,
        12 as crescimento
      FROM public."CONSULTA" 
      WHERE data_hora >= NOW() - INTERVAL '1 month'
      AND tipo_consulta = 'rotina'
      UNION ALL
      SELECT 
        'Cirurgia Eletiva' as procedimento,
        COUNT(*) as quantidade,
        'Cirurgia Geral' as especialidade,
        120 as tempo_medio,
        8 as crescimento
      FROM public."CIRURGIA" 
      WHERE data_hora >= NOW() - INTERVAL '1 month'
      AND status = 'realizada'
    `;

    const procedimentosResult = await pool.query(procedimentosQuery);

    // Dados de distribuição
    const distribuicaoFaixaEtaria = [
      { faixa: '0-12 anos', quantidade: 120, percentual: 15, cor: '#3b82f6' },
      { faixa: '13-17 anos', quantidade: 85, percentual: 11, cor: '#ef4444' },
      { faixa: '18-59 anos', quantidade: 450, percentual: 56, cor: '#10b981' },
      { faixa: '60+ anos', quantidade: 245, percentual: 31, cor: '#f59e0b' }
    ];

    const evolucaoAtendimentos = [
      { mes: 'Jan', atendimentos: 680 },
      { mes: 'Fev', atendimentos: 720 },
      { mes: 'Mar', atendimentos: 810 }
    ];

    const origemPacientes = [
      { origem: 'Encaminhamento', quantidade: 320, percentual: 40, crescimento: 5, tipo_principal: 'Consultas' },
      { origem: 'Pronto Socorro', quantidade: 280, percentual: 35, crescimento: 12, tipo_principal: 'Emergência' },
      { origem: 'Particular', quantidade: 200, percentual: 25, crescimento: -2, tipo_principal: 'Consultas' }
    ];

    const dados = {
      metricas,
      atendimentosPorEspecialidade,
      internacoesAtivas: internacoesResult.rows,
      procedimentosRealizados: procedimentosResult.rows,
      origemPacientes,
      distribuicaoFaixaEtaria,
      evolucaoAtendimentos
    };

    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar dados de pacientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportPacientes = async (req, res) => {
  try {
    const { format, periodo, tipoAtendimento, faixaEtaria } = req.query;
    
    res.setHeader('Content-Disposition', `attachment; filename=historico-pacientes-${periodo}.${format}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.send('Relatório de pacientes exportado');
  } catch (error) {
    console.error('Erro ao exportar dados de pacientes:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};