import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; 

class ExportRecursosHumanosService {
  static async exportData(format, dadosAtuais, periodo, departamento, turno) {
    console.log('🔄 Exportando RH:', format);
    console.log('📊 Dados recebidos:', {
      metricas: dadosAtuais.metricas,
      departamentosCount: dadosAtuais.distribuicaoDepartamentos?.length || 0,
      plantoesCount: dadosAtuais.plantoesAtivos?.length || 0
    });
    
    // Preparar dados para exportação
    const data = {
      periodo: periodo || 'mes',
      departamento: departamento === 'todos' ? 'Todos' : departamento,
      turno: turno === 'todos' ? 'Todos' : turno,
      metricas: dadosAtuais.metricas || {},
      distribuicaoDepartamentos: dadosAtuais.distribuicaoDepartamentos || [],
      plantoesAtivos: dadosAtuais.plantoesAtivos || [],
      funcionariosSobrecarga: dadosAtuais.funcionariosSobrecarga || [],
      previsaoDemandas: dadosAtuais.previsaoDemandas || [],
      evolucaoHoras: dadosAtuais.evolucaoHoras || []
    };

    const fileName = `recursos_humanos_${periodo}_${departamento}`;
    
    if (format === 'pdf') {
      return await this.exportToPdf(data, fileName);
    } else if (format === 'excel') {
      return this.exportToExcel(data, fileName);
    } else {
      throw new Error(`Formato não suportado: ${format}`);
    }
  }

  static async exportToPdf(data, fileName = 'relatorio_rh') {
    try {
      console.log('📄 Criando PDF de RH...');
      
      // Criar documento
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = margin;

      // Título
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185); // Azul
      doc.text('RELATÓRIO DE RECURSOS HUMANOS', pageWidth / 2, yPos, { align: 'center' });
      yPos += 12;

      // Subtítulo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const periodoTexto = {
        semana: 'Última Semana',
        mes: 'Último Mês',
        trimestre: 'Último Trimestre',
        ano: 'Último Ano'
      }[data.periodo] || data.periodo;
      
      doc.text(`Período: ${periodoTexto} | Departamento: ${data.departamento} | Turno: ${data.turno}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      // Data de geração
      const dataGeracao = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${dataGeracao}`, margin, yPos);
      yPos += 15;

      // RESUMO EXECUTIVO
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('RESUMO EXECUTIVO', margin, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Funcionários
      doc.text(`• Total de Funcionários: ${data.metricas.totalFuncionarios || 0}`, margin + 5, yPos);
      yPos += 6;
      
      // Horas Trabalhadas
      doc.text(`• Horas Trabalhadas: ${data.metricas.horasTrabalhadas || 0}h`, margin + 5, yPos);
      yPos += 6;
      
      // Plantões Ativos
      doc.text(`• Plantões Ativos: ${data.metricas.plantoesAtivos || 0}`, margin + 5, yPos);
      yPos += 6;
      
      // Absenteísmo
      doc.text(`• Taxa de Absenteísmo: ${data.metricas.taxaAbsenteismo || 0}%`, margin + 5, yPos);
      yPos += 6;
      
      // Turnover
      doc.text(`• Turnover: ${data.metricas.turnover || 0}%`, margin + 5, yPos);
      yPos += 10;

      // DISTRIBUIÇÃO POR DEPARTAMENTO
      if (data.distribuicaoDepartamentos && data.distribuicaoDepartamentos.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DISTRIBUIÇÃO POR DEPARTAMENTO', margin, yPos);
        yPos += 10;
        
        const deptoData = {
          head: [['Departamento', 'Funcionários', 'Média Horas', 'Plantões Ativos', 'Capacidade (%)', 'Status']],
          body: data.distribuicaoDepartamentos.map(item => {
            const capacidade = item.capacidade || 0;
            return [
              item.departamento || 'Não especificado',
              item.totalFuncionarios?.toString() || '0',
              `${item.mediaHoras || 0}h`,
              item.plantoesAtivos?.toString() || '0',
              `${capacidade}%`,
              this.getStatusCapacidade(capacidade)
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: deptoData.head,
          body: deptoData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: [41, 128, 185], // Azul
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 40 }, // Departamento
            1: { cellWidth: 25, halign: 'center' }, // Funcionários
            2: { cellWidth: 25, halign: 'center' }, // Média Horas
            3: { cellWidth: 25, halign: 'center' }, // Plantões
            4: { cellWidth: 25, halign: 'center' }, // Capacidade
            5: { cellWidth: 25, halign: 'center' }  // Status
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // PLANTÕES ATIVOS
      if (data.plantoesAtivos && data.plantoesAtivos.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PLANTÕES ATIVOS - HOJE', margin, yPos);
        yPos += 10;
        
        const plantoesData = {
          head: [['Setor', 'Turno', 'Profissionais', 'Horário', 'Capacidade', 'Status']],
          body: data.plantoesAtivos.map(item => {
            const capacidade = item.percentualCapacidade || 0;
            return [
              item.setor || 'Não especificado',
              item.turno || 'Não especificado',
              item.profissionais?.toString() || '0',
              item.horario || 'N/A',
              `${item.capacidadeAtual || 0}/${item.capacidadeTotal || 0}`,
              this.getStatusCapacidade(capacidade)
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: plantoesData.head,
          body: plantoesData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: [106, 17, 203], // Roxo
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 35 }, // Setor
            1: { cellWidth: 25, halign: 'center' }, // Turno
            2: { cellWidth: 25, halign: 'center' }, // Profissionais
            3: { cellWidth: 30, halign: 'center' }, // Horário
            4: { cellWidth: 25, halign: 'center' }, // Capacidade
            5: { cellWidth: 25, halign: 'center' }  // Status
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // FUNCIONÁRIOS EM SOBRECARGA
      if (data.funcionariosSobrecarga && data.funcionariosSobrecarga.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ALERTAS - FUNCIONÁRIOS EM SOBRECARGA', margin, yPos);
        yPos += 10;
        
        const sobrecargaData = {
          head: [['Funcionário', 'Departamento', 'Horas Trabalhadas', 'Limite', 'Excesso', 'Status']],
          body: data.funcionariosSobrecarga.map(item => {
            const excesso = item.excesso || 0;
            return [
              item.nome || 'Não identificado',
              item.departamento || 'Não especificado',
              `${item.horasTrabalhadas || 0}h`,
              `${item.limiteHoras || 0}h`,
              `+${excesso}h`,
              this.getStatusSobrecarga(excesso)
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: sobrecargaData.head,
          body: sobrecargaData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: [220, 53, 69], // Vermelho
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 40 }, // Funcionário
            1: { cellWidth: 35 }, // Departamento
            2: { cellWidth: 25, halign: 'center' }, // Horas
            3: { cellWidth: 20, halign: 'center' }, // Limite
            4: { cellWidth: 20, halign: 'center' }, // Excesso
            5: { cellWidth: 25, halign: 'center' }  // Status
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // PREVISÃO DE DEMANDAS
      if (data.previsaoDemandas && data.previsaoDemandas.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PREVISÃO DE DEMANDAS - PRÓXIMA SEMANA', margin, yPos);
        yPos += 10;
        
        const demandaData = {
          head: [['Setor', 'Demanda Prevista', 'Recursos Atuais', 'Gap', 'Status', 'Recomendação']],
          body: data.previsaoDemandas.map(item => {
            return [
              item.setor || 'Não especificado',
              `${item.demandaPrevista || 0} prof.`,
              `${item.recursosAtuais || 0} prof.`,
              (item.gap || 0) > 0 ? `+${item.gap}` : item.gap?.toString() || '0',
              item.status === 'alerta' ? 'Alerta' : 'Normal',
              item.recomendacao || 'Nenhuma'
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: demandaData.head,
          body: demandaData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: [255, 193, 7], // Amarelo
            textColor: 0,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 35 }, // Setor
            1: { cellWidth: 25, halign: 'center' }, // Demanda
            2: { cellWidth: 25, halign: 'center' }, // Recursos
            3: { cellWidth: 20, halign: 'center' }, // Gap
            4: { cellWidth: 20, halign: 'center' }, // Status
            5: { cellWidth: 45 }  // Recomendação
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // EVOLUÇÃO DE HORAS
      if (data.evolucaoHoras && data.evolucaoHoras.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('EVOLUÇÃO DE HORAS TRABALHADAS', margin, yPos);
        yPos += 10;
        
        const evolucaoData = {
          head: [['Período', 'Horas Trabalhadas', 'Variação', 'Tendência']],
          body: data.evolucaoHoras.map(item => {
            let tendencia = 'Estável';
            if (item.variacao?.includes('+')) tendencia = 'Crescimento';
            else if (item.variacao?.includes('-')) tendencia = 'Queda';
            
            return [
              item.periodo || 'Não especificado',
              `${item.horas || 0}h`,
              item.variacao || '0%',
              tendencia
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: evolucaoData.head,
          body: evolucaoData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: [40, 167, 69], // Verde
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 40 }, // Período
            1: { cellWidth: 35, halign: 'center' }, // Horas
            2: { cellWidth: 25, halign: 'center' }, // Variação
            3: { cellWidth: 30, halign: 'center' }  // Tendência
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // OBSERVAÇÕES E RECOMENDAÇÕES
      if (yPos > 200) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES E RECOMENDAÇÕES', margin, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      let obsY = yPos;
      
      // Análise baseada nos dados
      const taxaAbsenteismo = data.metricas.taxaAbsenteismo || 0;
      const turnover = data.metricas.turnover || 0;
      
      if (taxaAbsenteismo > 8) {
        doc.text('• ALERTA: Taxa de Absenteísmo Elevada (>8%)', margin, obsY);
        obsY += 6;
        doc.text('  - Avaliar políticas de bem-estar', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Revisar carga horária', margin + 5, obsY);
        obsY += 8;
      } else if (taxaAbsenteismo > 5) {
        doc.text('• Taxa de absenteísmo em nível de atenção (5-8%)', margin, obsY);
        obsY += 6;
        doc.text('  - Monitorar tendências', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Incentivar trabalho remoto quando possível', margin + 5, obsY);
        obsY += 8;
      }
      
      if (turnover > 10) {
        doc.text('• ALERTA CRÍTICO: Turnover Elevado (>10%)', margin, obsY);
        obsY += 6;
        doc.text('  - Revisar políticas de retenção', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Melhorar benefícios', margin + 5, obsY);
        obsY += 8;
      } else if (turnover > 5) {
        doc.text('• Turnover em nível moderado (5-10%)', margin, obsY);
        obsY += 6;
        doc.text('  - Avaliar clima organizacional', margin + 5, obsY);
        obsY += 6;
        doc.text('  - Implementar programas de desenvolvimento', margin + 5, obsY);
        obsY += 8;
      }
      
      // Recomendações gerais
      doc.text('• RECOMENDAÇÕES GERAIS:', margin, obsY);
      obsY += 6;
      doc.text('  - Manter monitoramento contínuo da carga horária', margin + 5, obsY);
      obsY += 6;
      doc.text('  - Planejar escalas com antecedência', margin + 5, obsY);
      obsY += 6;
      doc.text('  - Implementar programas de capacitação', margin + 5, obsY);
      
      // RODAPÉ EM TODAS AS PÁGINAS
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        
        // Texto à esquerda
        doc.text('Sistema Hospitalar - Relatório de RH', margin, doc.internal.pageSize.getHeight() - 10);
        
        // Número da página no centro
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        
        // Data à direita
        doc.text(dataGeracao, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      }

      // Salvar arquivo
      const finalFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(finalFileName);
      
      console.log('✅ PDF de RH salvo com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao gerar PDF de RH:', error);
      throw error;
    }
  }

  static exportToExcel(data, fileName = 'relatorio_rh') {
    console.log('📊 Criando Excel de RH...');
    
    try {
      // Criar um novo workbook
      const wb = XLSX.utils.book_new();
      
      // CAPA DO RELATÓRIO
      const cabecalho = [
        ['RELATÓRIO DE RECURSOS HUMANOS'],
        [''],
        ['Período:', data.periodo === 'semana' ? 'Última Semana' : 
                     data.periodo === 'mes' ? 'Último Mês' :
                     data.periodo === 'trimestre' ? 'Último Trimestre' : 
                     data.periodo === 'ano' ? 'Último Ano' : data.periodo],
        ['Departamento:', data.departamento],
        ['Turno:', data.turno],
        ['Gerado em:', new Date().toLocaleString('pt-BR')],
        [''],
        ['RESUMO EXECUTIVO'],
        [''],
        ['Total de Funcionários:', data.metricas.totalFuncionarios || 0],
        ['Horas Trabalhadas:', `${data.metricas.horasTrabalhadas || 0}h`],
        ['Plantões Ativos:', data.metricas.plantoesAtivos || 0],
        ['Taxa de Absenteísmo:', `${data.metricas.taxaAbsenteismo || 0}%`],
        ['Turnover:', `${data.metricas.turnover || 0}%`],
        [''],
        ['']
      ];
      
      const wsCapa = XLSX.utils.aoa_to_sheet(cabecalho);
      
      // Estilizar a capa (largura das colunas)
      wsCapa['!cols'] = [
        { wch: 25 }, // Coluna A
        { wch: 40 }  // Coluna B
      ];
      
      // Mesclar células do título
      wsCapa['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Título
        { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } }  // RESUMO EXECUTIVO
      ];
      
      XLSX.utils.book_append_sheet(wb, wsCapa, "Capa");
      
      // DISTRIBUIÇÃO POR DEPARTAMENTO
      if (data.distribuicaoDepartamentos && data.distribuicaoDepartamentos.length > 0) {
        const deptoData = [
          ['DISTRIBUIÇÃO POR DEPARTAMENTO'],
          [''],
          ['Departamento', 'Funcionários', 'Média Horas', 'Plantões Ativos', 'Capacidade (%)', 'Status'],
        ];
        
        data.distribuicaoDepartamentos.forEach(item => {
          deptoData.push([
            item.departamento || 'Não especificado',
            item.totalFuncionarios || 0,
            item.mediaHoras || 0,
            item.plantoesAtivos || 0,
            item.capacidade || 0,
            this.getStatusCapacidade(item.capacidade || 0)
          ]);
        });
        
        const wsDepto = XLSX.utils.aoa_to_sheet(deptoData);
        wsDepto['!cols'] = [
          { wch: 25 }, // Departamento
          { wch: 15 }, // Funcionários
          { wch: 15 }, // Média Horas
          { wch: 15 }, // Plantões
          { wch: 15 }, // Capacidade
          { wch: 15 }  // Status
        ];
        
        wsDepto['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsDepto, "Departamentos");
      }
      
      // PLANTÕES ATIVOS
      if (data.plantoesAtivos && data.plantoesAtivos.length > 0) {
        const plantoesData = [
          ['PLANTÕES ATIVOS - HOJE'],
          [''],
          ['Setor', 'Turno', 'Profissionais', 'Horário', 'Capacidade', 'Status'],
        ];
        
        data.plantoesAtivos.forEach(item => {
          plantoesData.push([
            item.setor || 'Não especificado',
            item.turno || 'Não especificado',
            item.profissionais || 0,
            item.horario || 'N/A',
            `${item.capacidadeAtual || 0}/${item.capacidadeTotal || 0}`,
            this.getStatusCapacidade(item.percentualCapacidade || 0)
          ]);
        });
        
        const wsPlantoes = XLSX.utils.aoa_to_sheet(plantoesData);
        wsPlantoes['!cols'] = [
          { wch: 25 }, // Setor
          { wch: 15 }, // Turno
          { wch: 15 }, // Profissionais
          { wch: 20 }, // Horário
          { wch: 15 }, // Capacidade
          { wch: 15 }  // Status
        ];
        
        wsPlantoes['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsPlantoes, "Plantões");
      }
      
      // FUNCIONÁRIOS EM SOBRECARGA
      if (data.funcionariosSobrecarga && data.funcionariosSobrecarga.length > 0) {
        const sobrecargaData = [
          ['ALERTAS - FUNCIONÁRIOS EM SOBRECARGA'],
          [''],
          ['Funcionário', 'Departamento', 'Horas Trabalhadas', 'Limite', 'Excesso', 'Status'],
        ];
        
        data.funcionariosSobrecarga.forEach(item => {
          sobrecargaData.push([
            item.nome || 'Não identificado',
            item.departamento || 'Não especificado',
            item.horasTrabalhadas || 0,
            item.limiteHoras || 0,
            `+${item.excesso || 0}`,
            this.getStatusSobrecarga(item.excesso || 0)
          ]);
        });
        
        const wsSobrecarga = XLSX.utils.aoa_to_sheet(sobrecargaData);
        wsSobrecarga['!cols'] = [
          { wch: 30 }, // Funcionário
          { wch: 20 }, // Departamento
          { wch: 18 }, // Horas
          { wch: 15 }, // Limite
          { wch: 15 }, // Excesso
          { wch: 15 }  // Status
        ];
        
        wsSobrecarga['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsSobrecarga, "Sobrecarga");
      }
      
      // PREVISÃO DE DEMANDAS
      if (data.previsaoDemandas && data.previsaoDemandas.length > 0) {
        const demandaData = [
          ['PREVISÃO DE DEMANDAS - PRÓXIMA SEMANA'],
          [''],
          ['Setor', 'Demanda Prevista', 'Recursos Atuais', 'Gap', 'Status', 'Recomendação'],
        ];
        
        data.previsaoDemandas.forEach(item => {
          demandaData.push([
            item.setor || 'Não especificado',
            item.demandaPrevista || 0,
            item.recursosAtuais || 0,
            item.gap || 0,
            item.status === 'alerta' ? 'Alerta' : 'Normal',
            item.recomendacao || 'Nenhuma'
          ]);
        });
        
        const wsDemanda = XLSX.utils.aoa_to_sheet(demandaData);
        wsDemanda['!cols'] = [
          { wch: 25 }, // Setor
          { wch: 18 }, // Demanda
          { wch: 18 }, // Recursos
          { wch: 15 }, // Gap
          { wch: 15 }, // Status
          { wch: 30 }  // Recomendação
        ];
        
        wsDemanda['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsDemanda, "Demandas");
      }
      
      // EVOLUÇÃO DE HORAS
      if (data.evolucaoHoras && data.evolucaoHoras.length > 0) {
        const evolucaoData = [
          ['EVOLUÇÃO DE HORAS TRABALHADAS'],
          [''],
          ['Período', 'Horas Trabalhadas', 'Variação', 'Tendência'],
        ];
        
        data.evolucaoHoras.forEach(item => {
          let tendencia = 'Estável';
          if (item.variacao?.includes('+')) tendencia = 'Crescimento';
          else if (item.variacao?.includes('-')) tendencia = 'Queda';
          
          evolucaoData.push([
            item.periodo || 'Não especificado',
            item.horas || 0,
            item.variacao || '0%',
            tendencia
          ]);
        });
        
        const wsEvolucao = XLSX.utils.aoa_to_sheet(evolucaoData);
        wsEvolucao['!cols'] = [
          { wch: 20 }, // Período
          { wch: 20 }, // Horas
          { wch: 15 }, // Variação
          { wch: 15 }  // Tendência
        ];
        
        wsEvolucao['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
        ];
        
        XLSX.utils.book_append_sheet(wb, wsEvolucao, "Evolução");
      }
      
      // OBSERVAÇÕES
      const observacoesData = [
        ['OBSERVAÇÕES E RECOMENDAÇÕES'],
        [''],
      ];
      
      const taxaAbsenteismo = data.metricas.taxaAbsenteismo || 0;
      const turnover = data.metricas.turnover || 0;
      
      if (taxaAbsenteismo > 8) {
        observacoesData.push(['• ALERTA: Taxa de Absenteísmo Elevada (>8%)']);
        observacoesData.push(['  - Avaliar políticas de bem-estar']);
        observacoesData.push(['  - Revisar carga horária']);
        observacoesData.push(['']);
      } else if (taxaAbsenteismo > 5) {
        observacoesData.push(['• Taxa de absenteísmo em nível de atenção (5-8%)']);
        observacoesData.push(['  - Monitorar tendências']);
        observacoesData.push(['  - Incentivar trabalho remoto quando possível']);
        observacoesData.push(['']);
      }
      
      if (turnover > 10) {
        observacoesData.push(['• ALERTA CRÍTICO: Turnover Elevado (>10%)']);
        observacoesData.push(['  - Revisar políticas de retenção']);
        observacoesData.push(['  - Melhorar benefícios']);
        observacoesData.push(['']);
      } else if (turnover > 5) {
        observacoesData.push(['• Turnover em nível moderado (5-10%)']);
        observacoesData.push(['  - Avaliar clima organizacional']);
        observacoesData.push(['  - Implementar programas de desenvolvimento']);
        observacoesData.push(['']);
      }
      
      // Recomendações gerais
      observacoesData.push(['• RECOMENDAÇÕES GERAIS:']);
      observacoesData.push(['  - Manter monitoramento contínuo da carga horária']);
      observacoesData.push(['  - Planejar escalas com antecedência']);
      observacoesData.push(['  - Implementar programas de capacitação']);
      
      const wsObservacoes = XLSX.utils.aoa_to_sheet(observacoesData);
      wsObservacoes['!cols'] = [{ wch: 80 }]; // Coluna única larga
      
      wsObservacoes['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
      ];
      
      XLSX.utils.book_append_sheet(wb, wsObservacoes, "Observações");
      
      // GERAR E SALVAR ARQUIVO
      const finalFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Gerar arquivo XLSX
      XLSX.writeFile(wb, finalFileName);
      
      console.log('✅ Excel (XLSX) exportado com sucesso!');
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao exportar Excel:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  static getStatusCapacidade(percentual) {
    if (percentual >= 90) return 'Crítico';
    if (percentual >= 80) return 'Alerta';
    if (percentual >= 60) return 'Estável';
    return 'Baixo';
  }

  static getStatusSobrecarga(excesso) {
    if (excesso > 30) return 'Crítico';
    if (excesso > 20) return 'Alerta';
    if (excesso > 10) return 'Moderado';
    return 'Baixo';
  }
}

export { ExportRecursosHumanosService };
export default ExportRecursosHumanosService;