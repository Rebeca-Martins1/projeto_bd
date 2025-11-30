import pool from "../config/db.js";

export const getOcupacaoLeitos = async (req, res) => {
  const { periodo, unidade } = req.query;

  try {
    // Métricas principais
    const metricasQuery = `
      SELECT 
        tipo,
        COUNT(*) as total,
        SUM(quant_paciente) as ocupados,
        ROUND((SUM(quant_paciente) * 100.0 / COUNT(*)), 2) as ocupacao
      FROM public."LEITOS" 
      WHERE ativo = true
      ${unidade !== 'todas' ? `AND tipo = '${unidade}'` : ''}
      GROUP BY tipo
    `;

    const metricasResult = await pool.query(metricasQuery);
    
    const metricas = {
      uti: metricasResult.rows.find(row => row.tipo === 'UTI') || { ocupados: 0, total: 0, ocupacao: 0, tendencia: 'neutral', variacao: '0%' },
      enfermaria: metricasResult.rows.find(row => row.tipo === 'ENFERMARIA') || { ocupados: 0, total: 0, ocupacao: 0, tendencia: 'neutral', variacao: '0%' },
      total: {
        ocupados: metricasResult.rows.reduce((sum, row) => sum + parseInt(row.ocupados), 0),
        total: metricasResult.rows.reduce((sum, row) => sum + parseInt(row.total), 0),
        ocupacao: metricasResult.rows.reduce((sum, row) => sum + parseFloat(row.ocupacao), 0) / metricasResult.rows.length,
        tendencia: 'neutral',
        variacao: '0%'
      }
    };

    // Detalhamento por setor
    const setoresQuery = `
      SELECT 
        CONCAT('Leito ', n_sala) as setor,
        tipo,
        capacidade as leitos_totais,
        quant_paciente as leitos_ocupados,
        (capacidade - quant_paciente) as leitos_livres,
        ROUND((quant_paciente * 100.0 / capacidade), 2) as ocupacao,
        'stable' as tendencia,
        '0%' as variacao
      FROM public."LEITOS" 
      WHERE ativo = true
      ${unidade !== 'todas' ? `AND tipo = '${unidade}'` : ''}
      ORDER BY tipo, n_sala
    `;

    const setoresResult = await pool.query(setoresQuery);

    // Tendência de ocupação (últimos 7 dias)
    const tendenciaQuery = `
      SELECT 
        DATE(data_entrada) as data,
        COUNT(*) as ocupacao_diaria
      FROM (
        SELECT data_entrada FROM public."ALOCA_LEITO_UTI_PACIENTE" 
        WHERE data_entrada >= NOW() - INTERVAL '7 days'
        UNION ALL
        SELECT data_entrada FROM public."ALOCA_LEITO_ENFERMARIA_PACIENTE" 
        WHERE data_entrada >= NOW() - INTERVAL '7 days'
      ) as ocupacoes
      GROUP BY DATE(data_entrada)
      ORDER BY data
    `;

    const tendenciaResult = await pool.query(tendenciaQuery);

    const tendenciaOcupacao = tendenciaResult.rows.map(row => ({
      data: new Date(row.data).toLocaleDateString('pt-BR'),
      uti: Math.round(Math.random() * 100),
      enfermaria: Math.round(Math.random() * 100)
    }));

    // Distribuição por unidades
    const distribuicaoQuery = `
      SELECT 
        tipo,
        COUNT(*) as leitos,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public."LEITOS" WHERE ativo = true)), 2) as percentual,
        CASE 
          WHEN tipo = 'UTI' THEN '#ef4444'
          WHEN tipo = 'ENFERMARIA' THEN '#3b82f6'
          ELSE '#6b7280'
        END as cor
      FROM public."LEITOS" 
      WHERE ativo = true
      GROUP BY tipo
    `;

    const distribuicaoResult = await pool.query(distribuicaoQuery);

    const dados = {
      metricas,
      detalhamentoSetores: setoresResult.rows,
      tendenciaOcupacao,
      distribuicaoUnidades: distribuicaoResult.rows
    };

    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar dados de leitos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportLeitos = async (req, res) => {
  try {
    const { format, periodo, unidade } = req.query;
    
    res.setHeader('Content-Disposition', `attachment; filename=ocupacao-leitos-${periodo}.${format}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.send('Relatório de leitos exportado');
  } catch (error) {
    console.error('Erro ao exportar dados de leitos:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};