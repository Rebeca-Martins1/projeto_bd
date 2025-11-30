import pool from "../config/db.js";

export const getDashboard = async (req, res) => {
  const { periodo } = req.query;

  try {
    // Dados de ocupação de leitos
    const leitosQuery = `
      SELECT 
        tipo,
        COUNT(*) as total,
        SUM(quant_paciente) as ocupados,
        ROUND((SUM(quant_paciente) * 100.0 / COUNT(*)), 2) as ocupacao
      FROM public."LEITOS" 
      WHERE ativo = true
      GROUP BY tipo
    `;

    const leitosResult = await pool.query(leitosQuery);
    
    const ocupacaoLeitos = {
      uti: leitosResult.rows.find(row => row.tipo === 'UTI') || { ocupados: 0, total: 0, ocupacao: 0 },
      enfermaria: leitosResult.rows.find(row => row.tipo === 'ENFERMARIA') || { ocupados: 0, total: 0, ocupacao: 0 }
    };

    // Dados de ocupação de salas
    const salasQuery = `
      SELECT 
        tipo,
        COUNT(*) as total
      FROM public."SALAS" 
      WHERE ativo = true
      GROUP BY tipo
    `;

    const salasResult = await pool.query(salasQuery);
    
    const ocupacaoSalas = {
      consultorios: salasResult.rows.find(row => row.tipo === 'CONSULTORIO') || { total: 0 },
      cirurgia: salasResult.rows.find(row => row.tipo === 'CIRURGIA') || { total: 0 }
    };

    // Dados de atividade médica
    const consultasQuery = `
      SELECT COUNT(*) as totalConsultas
      FROM public."CONSULTA" 
      WHERE data_hora >= NOW() - INTERVAL '1 month'
    `;

    const consultasResult = await pool.query(consultasQuery);

    const medicosQuery = `
      SELECT COUNT(*) as medicosAtivos
      FROM public."MEDICO" 
      WHERE ativo = true AND disponivel = true
    `;

    const medicosResult = await pool.query(medicosQuery);

    // Dados de atividade cirúrgica
    const cirurgiasQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN aprovada = true THEN 1 END) as aprovadas,
        COUNT(CASE WHEN aprovada IS NULL OR aprovada = false THEN 1 END) as pendentes
      FROM public."CIRURGIA" 
      WHERE data_hora >= NOW() - INTERVAL '1 month'
    `;

    const cirurgiasResult = await pool.query(cirurgiasQuery);

    // Dados de recursos humanos
    const rhQuery = `
      SELECT 
        (SELECT COUNT(*) FROM public."MEDICO" WHERE ativo = true) as totalMedicos,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE ativo = true) as totalEnfermeiros,
        (SELECT COUNT(*) FROM public."ENFERMEIRO" WHERE disponivel = false) as plantoesAtivos
    `;

    const rhResult = await pool.query(rhQuery);

    // Dados de pacientes
    const pacientesQuery = `
      SELECT 
        (SELECT COUNT(*) FROM public."PACIENTE") as total,
        (SELECT COUNT(*) FROM public."ALOCA_LEITO_UTI_PACIENTE" WHERE data_saida IS NULL) + 
        (SELECT COUNT(*) FROM public."ALOCA_LEITO_ENFERMARIA_PACIENTE" WHERE data_saida IS NULL) as internados,
        (SELECT COUNT(*) FROM public."ALOCA_LEITO_UTI_PACIENTE" WHERE data_saida >= NOW() - INTERVAL '1 day') + 
        (SELECT COUNT(*) FROM public."ALOCA_LEITO_ENFERMARIA_PACIENTE" WHERE data_saida >= NOW() - INTERVAL '1 day') as alta
    `;

    const pacientesResult = await pool.query(pacientesQuery);

    // Resumo estatístico
    const resumoQuery = `
      SELECT 
        ROUND(AVG(
          (SELECT SUM(quant_paciente) FROM public."LEITOS") * 100.0 / 
          (SELECT COUNT(*) FROM public."LEITOS" WHERE ativo = true)
        ), 2) as taxaOcupacaoLeitos,
        ROUND((
          SELECT COUNT(*) FROM public."CONSULTA" 
          WHERE data_hora >= NOW() - INTERVAL '30 days'
        ) / 30.0, 1) as mediaConsultasDia,
        ROUND((
          SELECT COUNT(CASE WHEN aprovada = true THEN 1 END) * 100.0 / COUNT(*)
          FROM public."CIRURGIA" 
          WHERE data_hora >= NOW() - INTERVAL '1 month'
        ), 2) as taxaAprovacaoCirurgias,
        ROUND(AVG(
          EXTRACT(EPOCH FROM (data_saida - data_entrada)) / 86400
        ), 1) as tempoMedioPermanencia
      FROM public."ALOCA_LEITO_UTI_PACIENTE" 
      WHERE data_saida IS NOT NULL
      UNION ALL
      SELECT 
        ROUND(AVG(
          EXTRACT(EPOCH FROM (data_saida - data_entrada)) / 86400
        ), 1) as tempoMedioPermanencia
      FROM public."ALOCA_LEITO_ENFERMARIA_PACIENTE" 
      WHERE data_saida IS NOT NULL
    `;

    const resumoResult = await pool.query(resumoQuery);

    const dashboardData = {
      ocupacaoLeitos,
      ocupacaoSalas,
      atividadeMedica: {
        totalConsultas: parseInt(consultasResult.rows[0]?.totalconsultas) || 0,
        medicosAtivos: parseInt(medicosResult.rows[0]?.medicosativos) || 0
      },
      atividadeCirurgica: {
        total: parseInt(cirurgiasResult.rows[0]?.total) || 0,
        aprovadas: parseInt(cirurgiasResult.rows[0]?.aprovadas) || 0,
        pendentes: parseInt(cirurgiasResult.rows[0]?.pendentes) || 0
      },
      recursosHumanos: {
        totalMedicos: parseInt(rhResult.rows[0]?.totalmedicos) || 0,
        totalEnfermeiros: parseInt(rhResult.rows[0]?.totalenfermeiros) || 0,
        plantoesAtivos: parseInt(rhResult.rows[0]?.plantoesativos) || 0
      },
      pacientes: {
        total: parseInt(pacientesResult.rows[0]?.total) || 0,
        internados: parseInt(pacientesResult.rows[0]?.internados) || 0,
        alta: parseInt(pacientesResult.rows[0]?.alta) || 0
      },
      resumo: {
        taxaOcupacaoLeitos: parseFloat(resumoResult.rows[0]?.taxaocupacaoleitos) || 0,
        mediaConsultasDia: parseFloat(resumoResult.rows[0]?.mediaconsultasdia) || 0,
        taxaAprovacaoCirurgias: parseFloat(resumoResult.rows[0]?.taxaaprovacaocirurgias) || 0,
        tempoMedioPermanencia: parseFloat(resumoResult.rows[0]?.tempomediopermanencia) || 0
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportDashboard = async (req, res) => {
  try {
    const { format, periodo } = req.query;
    
    // Lógica para exportação do dashboard
    res.setHeader('Content-Disposition', `attachment; filename=dashboard-${periodo}.${format}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Retornar arquivo (implementar geração real de PDF/Excel)
    res.send('Dashboard exportado');
  } catch (error) {
    console.error('Erro ao exportar dashboard:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};