import pool from "../config/db.js";

export const getRecursosHumanos = async (req, res) => {
  const { periodo, departamento, turno } = req.query;

  try {
    // Métricas principais
    const metricasQuery = `
      SELECT 
        (SELECT COUNT(*) FROM public."MEDICO" WHERE ativo = true) as totalMedicos,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE ativo = true) as totalEnfermeiros,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE disponivel = false) as plantoesAtivos,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE disponivel = false AND EXTRACT(HOUR FROM inicio_plantao) BETWEEN 6 AND 18) as sobrecargaCount
    `;

    const metricasResult = await pool.query(metricasQuery);

    const metricas = {
      horasTrabalhadas: 8432,
      trendHoras: 'up',
      variacaoHoras: '+320h',
      plantoesAtivos: parseInt(metricasResult.rows[0]?.plantoesativos) || 0,
      trendPlantoes: 'neutral',
      variacaoPlantoes: '0',
      alertasSobrecarga: parseInt(metricasResult.rows[0]?.sobrecargacount) || 0,
      trendAlertas: 'down',
      variacaoAlertas: '-2',
      mediaEnfermeiro: 42,
      trendMediaEnfermeiro: 'down',
      variacaoMediaEnfermeiro: '-3h',
      taxaAbsenteismo: 4.2,
      trendAbsenteismo: 'down',
      variacaoAbsenteismo: '-0.8%',
      horasExtras: 320,
      trendHorasExtras: 'up',
      variacaoHorasExtras: '+45h',
      turnover: 8,
      trendTurnover: 'down',
      variacaoTurnover: '-2%',
      capacidadeOciosa: 15,
      trendCapacidadeOciosa: 'up',
      variacaoCapacidadeOciosa: '+3%'
    };

    // Distribuição por departamento
    const departamentosQuery = `
      SELECT 
        'Enfermagem' as departamento,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE ativo = true) as totalFuncionarios,
        4250 as horasTrabalhadas,
        50 as mediaHoras,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE disponivel = false) as plantoesAtivos,
        85 as capacidade
      UNION ALL
      SELECT 
        'Médicos' as departamento,
        (SELECT COUNT(*) FROM public."MEDICO" WHERE ativo = true) as totalFuncionarios,
        2880 as horasTrabalhadas,
        64 as mediaHoras,
        8 as plantoesAtivos,
        90 as capacidade
      UNION ALL
      SELECT 
        'Administrativo' as departamento,
        32 as totalFuncionarios,
        1280 as horasTrabalhadas,
        40 as mediaHoras,
        4 as plantoesAtivos,
        60 as capacidade
    `;

    const departamentosResult = await pool.query(departamentosQuery);

    const distribuicaoDepartamentos = departamentosResult.rows.map(depto => ({
      ...depto,
      cor: depto.departamento === 'Enfermagem' ? '#3b82f6' : 
           depto.departamento === 'Médicos' ? '#ef4444' : '#10b981',
      percentual: Math.round((depto.plantoesativos / departamentosResult.rows.reduce((sum, d) => sum + parseInt(d.plantoesativos), 0)) * 100)
    }));

    // Plantões ativos
    const plantoesQuery = `
      SELECT 
        p.nome,
        e.inicio_plantao,
        e.inicio_folga,
        ee.especialidade
      FROM public."ENFERMEIRO" e
      JOIN public."PESSOA" p ON e.cpf = p.cpf
      LEFT JOIN public."ESPECIALIDADE_ENFERMEIRO" ee ON e.cpf = ee.cpf_enfermeiro
      WHERE e.disponivel = false
      AND e.ativo = true
    `;

    const plantoesResult = await pool.query(plantoesQuery);

    const plantoesAtivos = [
      {
        setor: 'UTI Adulto',
        turno: 'Manhã',
        profissionais: 8,
        horario: '07:00 - 19:00',
        capacidadeAtual: 10,
        capacidadeTotal: 12,
        percentualCapacidade: 83
      },
      {
        setor: 'Pronto Socorro',
        turno: 'Tarde',
        profissionais: 12,
        horario: '13:00 - 01:00',
        capacidadeAtual: 15,
        capacidadeTotal: 15,
        percentualCapacidade: 100
      }
    ];

    // Funcionários em sobrecarga
    const sobrecargaQuery = `
      SELECT 
        p.nome,
        p.cpf,
        'Enfermagem' as departamento,
        72 as horasTrabalhadas,
        60 as limiteHoras,
        12 as excesso
      FROM public."PESSOA" p
      JOIN public."ENFERMEIRO" e ON p.cpf = e.cpf
      WHERE e.disponivel = false
      LIMIT 3
    `;

    const sobrecargaResult = await pool.query(sobrecargaQuery);

    // Previsão de demandas
    const previsaoDemandas = [
      {
        setor: 'Pronto Socorro',
        demandaPrevista: 18,
        recursosAtuais: 15,
        gap: -3,
        status: 'alerta',
        recomendacao: 'Contratar Plantonistas'
      },
      {
        setor: 'UTI',
        demandaPrevista: 12,
        recursosAtuais: 10,
        gap: -2,
        status: 'alerta',
        recomendacao: 'Redistribuir'
      }
    ];

    // Evolução de horas
    const evolucaoHoras = [
      { periodo: 'Jan', horas: 7800, variacao: '+5%' },
      { periodo: 'Fev', horas: 8200, variacao: '+3%' },
      { periodo: 'Mar', horas: 8432, variacao: '+2%' }
    ];

    const dados = {
      metricas,
      distribuicaoDepartamentos,
      plantoesAtivos,
      funcionariosSobrecarga: sobrecargaResult.rows,
      previsaoDemandas,
      evolucaoHoras
    };

    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar dados de RH:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportRH = async (req, res) => {
  try {
    const { format, periodo, departamento, turno } = req.query;
    
    res.setHeader('Content-Disposition', `attachment; filename=recursos-humanos-${periodo}.${format}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.send('Relatório de RH exportado');
  } catch (error) {
    console.error('Erro ao exportar dados de RH:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};