import pool from "../config/db.js";

export const conselhoPresidente = async (req, res) => {
  try {
    // Dashboard vazio - apenas para navegação
    const dashboardData = {
      mensagem: "Dashboard de navegação - selecione uma opção para ver dados detalhados"
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const exportDashboard = async (req, res) => {
  try {
    const { format, periodo } = req.query;
    
    res.setHeader('Content-Disposition', `attachment; filename=dashboard-${periodo}.${format}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.send('Dashboard exportado');
  } catch (error) {
    console.error('Erro ao exportar dashboard:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};