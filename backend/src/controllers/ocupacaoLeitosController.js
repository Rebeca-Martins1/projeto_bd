import pool from "../config/db.js";

export const ocupacaoLeitos = async (req, res) => {
  const { periodo, unidade } = req.query;

  try {
    // Métricas principais 
    const metricasQuery = `
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
      ${unidade !== 'todas' ? `AND tipo = '${unidade}'` : ''}
      GROUP BY tipo
    `;

    const metricasResult = await pool.query(metricasQuery);
    
    // Processar resultados manualmente
    let totalOcupados = 0;
    let totalLeitos = 0;
    let somaOcupacao = 0;
    let countTipos = 0;

    metricasResult.rows.forEach(row => {
      const ocupados = parseInt(row.ocupados) || 0;
      const total = parseInt(row.total) || 0;
      const ocupacao = parseFloat(row.ocupacao) || 0;
      
      totalOcupados += ocupados;
      totalLeitos += total;
      somaOcupacao += ocupacao;
      countTipos++;
    });

    const ocupacaoMedia = countTipos > 0 ? somaOcupacao / countTipos : 0;

    // Encontrar UTI e Enfermaria
    let utiRow = null;
    let enfermariaRow = null;

    metricasResult.rows.forEach(row => {
      if (row.tipo === 'UTI') {
        utiRow = row;
      } else if (row.tipo === 'ENFERMARIA') {
        enfermariaRow = row;
      }
    });

    // Criar objetos com valores padrão se não encontrados
    const uti = utiRow || { 
      ocupados: 0, 
      total: 0, 
      ocupacao: 0
    };

    const enfermaria = enfermariaRow || { 
      ocupados: 0, 
      total: 0, 
      ocupacao: 0
    };

    const metricas = {
      uti: {
        ocupados: parseInt(uti.ocupados) || 0,
        total: parseInt(uti.total) || 0,
        ocupacao: parseFloat(uti.ocupacao) || 0,
        tendencia: 'neutral',
        variacao: '0%'
      },
      enfermaria: {
        ocupados: parseInt(enfermaria.ocupados) || 0,
        total: parseInt(enfermaria.total) || 0,
        ocupacao: parseFloat(enfermaria.ocupacao) || 0,
        tendencia: 'neutral',
        variacao: '0%'
      },
      total: {
        ocupados: totalOcupados,
        total: totalLeitos,
        ocupacao: ocupacaoMedia,
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
        CASE 
          WHEN capacidade = 0 THEN 0
          ELSE ROUND((quant_paciente * 100.0 / capacidade), 2)
        END as ocupacao,
        'stable' as tendencia,
        '0%' as variacao
      FROM public."LEITOS" 
      WHERE ativo = true
      ${unidade !== 'todas' ? `AND tipo = '${unidade}'` : ''}
      ORDER BY tipo, n_sala
    `;

    const setoresResult = await pool.query(setoresQuery);

    // Processar setores
    const detalhamentoSetores = setoresResult.rows.map(row => {
      return {
        setor: row.setor || 'Leito não identificado',
        tipo: row.tipo || 'ENFERMARIA',
        leitos_totais: parseInt(row.leitos_totais) || 0,
        leitos_ocupados: parseInt(row.leitos_ocupados) || 0,
        leitos_livres: parseInt(row.leitos_livres) || 0,
        ocupacao: parseFloat(row.ocupacao) || 0,
        tendencia: row.tendencia || 'stable',
        variacao: row.variacao || '0%'
      };
    });

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
      data: row.data ? new Date(row.data).toLocaleDateString('pt-BR') : 'Data não disponível',
      uti: Math.round(Math.random() * 100),
      enfermaria: Math.round(Math.random() * 100)
    }));

    // Total de leitos
    const totalLeitosQuery = `
      SELECT COUNT(*) as total_leitos 
      FROM public."LEITOS" 
      WHERE ativo = true
    `;

    const totalLeitosResult = await pool.query(totalLeitosQuery);
    let totalLeitosGeral = 1; // Valor padrão para evitar divisão por zero
    
    if (totalLeitosResult.rows.length > 0 && totalLeitosResult.rows[0].total_leitos) {
      totalLeitosGeral = parseInt(totalLeitosResult.rows[0].total_leitos) || 1;
    }

    // Distribuição por unidades
    const distribuicaoQuery = `
      SELECT 
        tipo,
        COUNT(*) as leitos,
        CASE 
          WHEN ${totalLeitosGeral} = 0 THEN 0
          ELSE ROUND((COUNT(*) * 100.0 / ${totalLeitosGeral}), 2)
        END as percentual,
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

    // Processar distribuição
    const distribuicaoUnidades = distribuicaoResult.rows.map(row => {
      let cor = '#6b7280';
      if (row.tipo === 'UTI') {
        cor = '#ef4444';
      } else if (row.tipo === 'ENFERMARIA') {
        cor = '#3b82f6';
      }

      return {
        tipo: row.tipo || 'Não especificado',
        leitos: parseInt(row.leitos) || 0,
        percentual: parseFloat(row.percentual) || 0,
        cor: cor
      };
    });

    const dados = {
      metricas,
      detalhamentoSetores,
      tendenciaOcupacao,
      distribuicaoUnidades
    };

    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar dados de leitos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportLeitos = async (req, res) => {
  const { formato, periodo, unidade } = req.query;

  try {
    // Buscar os mesmos dados da consulta principal
    const metricasQuery = `
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
      ${unidade !== 'todas' ? `AND tipo = '${unidade}'` : ''}
      GROUP BY tipo
    `;

    const metricasResult = await pool.query(metricasQuery);
    
    // Processar resultados
    let totalOcupados = 0;
    let totalLeitos = 0;
    let somaOcupacao = 0;
    let countTipos = 0;

    metricasResult.rows.forEach(row => {
      const ocupados = parseInt(row.ocupados) || 0;
      const total = parseInt(row.total) || 0;
      const ocupacao = parseFloat(row.ocupacao) || 0;
      
      totalOcupados += ocupados;
      totalLeitos += total;
      somaOcupacao += ocupacao;
      countTipos++;
    });

    const ocupacaoMedia = countTipos > 0 ? somaOcupacao / countTipos : 0;

    // Buscar detalhes dos setores
    const setoresQuery = `
      SELECT 
        CONCAT('Leito ', n_sala) as setor,
        tipo,
        capacidade as leitos_totais,
        quant_paciente as leitos_ocupados,
        (capacidade - quant_paciente) as leitos_livres,
        CASE 
          WHEN capacidade = 0 THEN 0
          ELSE ROUND((quant_paciente * 100.0 / capacidade), 2)
        END as ocupacao
      FROM public."LEITOS" 
      WHERE ativo = true
      ${unidade !== 'todas' ? `AND tipo = '${unidade}'` : ''}
      ORDER BY tipo, n_sala
    `;

    const setoresResult = await pool.query(setoresQuery);

    // Buscar distribuição por unidades
    const totalLeitosQuery = `
      SELECT COUNT(*) as total_leitos 
      FROM public."LEITOS" 
      WHERE ativo = true
    `;

    const totalLeitosResult = await pool.query(totalLeitosQuery);
    let totalLeitosGeral = 1;
    
    if (totalLeitosResult.rows.length > 0 && totalLeitosResult.rows[0].total_leitos) {
      totalLeitosGeral = parseInt(totalLeitosResult.rows[0].total_leitos) || 1;
    }

    const distribuicaoQuery = `
      SELECT 
        tipo,
        COUNT(*) as leitos,
        CASE 
          WHEN ${totalLeitosGeral} = 0 THEN 0
          ELSE ROUND((COUNT(*) * 100.0 / ${totalLeitosGeral}), 2)
        END as percentual
      FROM public."LEITOS" 
      WHERE ativo = true
      GROUP BY tipo
    `;

    const distribuicaoResult = await pool.query(distribuicaoQuery);

    // Preparar dados para exportação
    const dadosExportacao = {
      periodo: periodo || 'mes',
      unidade: unidade || 'todas',
      dataGeracao: new Date().toISOString(),
      metricas: {
        totalOcupados,
        totalLeitos,
        ocupacaoMedia,
        tipos: metricasResult.rows
      },
      setores: setoresResult.rows,
      distribuicao: distribuicaoResult.rows
    };

    if (formato === 'json') {
      res.json(dadosExportacao);
    } else if (formato === 'excel') {
      // O Excel será gerado no frontend com os dados JSON
      res.json(dadosExportacao);
    } else if (formato === 'pdf') {
      // O PDF será gerado no frontend com os dados JSON
      res.json(dadosExportacao);
    } else {
      res.status(400).json({ error: 'Formato inválido' });
    }

  } catch (error) {
    console.error('Erro ao exportar dados de leitos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};