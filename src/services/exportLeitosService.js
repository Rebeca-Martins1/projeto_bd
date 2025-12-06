import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; 

class ExportLeitosService {
  static async exportToPdf(data, fileName = 'relatorio_leitos') {
    try {
      console.log('📄 Criando PDF...');
      
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
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE OCUPAÇÃO DE LEITOS', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Subtítulo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const periodoTexto = {
        semana: 'Última Semana',
        mes: 'Último Mês',
        trimestre: 'Último Trimestre',
        ano: 'Último Ano'
      }[data.periodo] || data.periodo;
      
      doc.text(`Período: ${periodoTexto} | Unidade: ${data.unidade}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      // Data
      const dataGeracao = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Gerado em: ${dataGeracao}`, margin, yPos);
      yPos += 15;

      // MÉTRICAS PRINCIPAIS
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('MÉTRICAS PRINCIPAIS', margin, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      // UTI
      if (data.metricas.uti) {
        doc.text(`• UTI: ${data.metricas.uti.ocupados || 0}/${data.metricas.uti.total || 0} leitos (${data.metricas.uti.ocupacao || 0}%)`, margin + 5, yPos);
        yPos += 7;
      }

      // Enfermaria
      if (data.metricas.enfermaria) {
        doc.text(`• Enfermaria: ${data.metricas.enfermaria.ocupados || 0}/${data.metricas.enfermaria.total || 0} leitos (${data.metricas.enfermaria.ocupacao || 0}%)`, margin + 5, yPos);
        yPos += 7;
      }

      // Total
      if (data.metricas.total) {
        doc.text(`• Total Hospitalar: ${data.metricas.total.ocupados || 0}/${data.metricas.total.total || 0} leitos (${data.metricas.total.ocupacao || 0}%)`, margin + 5, yPos);
        yPos += 10;
      }

      // DISTRIBUIÇÃO POR UNIDADE
      if (data.distribuicao && data.distribuicao.length > 0) {
        console.log('📊 Adicionando distribuição por unidade...');
        
        // Verificar se precisa de nova página
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DISTRIBUIÇÃO POR UNIDADE', margin, yPos);
        yPos += 10;

        // Preparar dados da tabela de distribuição
        const distribData = {
          head: [['Tipo de Leito', 'Quantidade de Leitos', 'Percentual (%)', 'Status']],
          body: data.distribuicao.map(item => {
            // Determinar status baseado no percentual
            let status = 'Normal';
            if (item.percentual >= 90) status = 'Crítico';
            else if (item.percentual >= 80) status = 'Alerta';
            else if (item.percentual >= 60) status = 'Estável';
            
            return [
              item.tipo || 'N/A',
              item.leitos?.toString() || '0',
              `${item.percentual || 0}%`,
              status
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: distribData.head,
          body: distribData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [106, 17, 203], // Cor roxa para diferenciar
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            3: { cellWidth: 30 } // Coluna Status mais estreita
          }
        });

        // Atualizar posição Y após tabela
        yPos = doc.lastAutoTable.finalY + 10;
      }

      // TENDÊNCIA DE OCUPAÇÃO (ÚLTIMOS 7 DIAS)
      if (data.tendencia && data.tendencia.length > 0) {
        console.log('📈 Adicionando tendência de ocupação...');
        
        // Verificar se precisa de nova página
        if (yPos > 200) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TENDÊNCIA DE OCUPAÇÃO (ÚLTIMOS 7 DIAS)', margin, yPos);
        yPos += 10;

        // Preparar dados da tabela de tendência
        const tendenciaData = {
          head: [['Data', 'Ocupação UTI (%)', 'Ocupação Enfermaria (%)', 'Média Geral (%)', 'Status']],
          body: data.tendencia.slice(0, 7).map(item => {
            const media = ((item.uti || 0) + (item.enfermaria || 0)) / 2;
            let status = 'Normal';
            if (media >= 90) status = 'Crítico';
            else if (media >= 80) status = 'Alerta';
            else if (media >= 60) status = 'Estável';
            
            return [
              item.data || item.dia || 'N/A',
              `${item.uti || 0}%`,
              `${item.enfermaria || 0}%`,
              `${media.toFixed(1)}%`,
              status
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: tendenciaData.head,
          body: tendenciaData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [219, 39, 119], // Cor rosa para diferenciar
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 40 }, // Coluna Data
            4: { cellWidth: 25 }  // Coluna Status
          }
        });

        // Atualizar posição Y após tabela
        yPos = doc.lastAutoTable.finalY + 10;
      }

      // DETALHAMENTO POR SETOR
      if (data.setores && data.setores.length > 0) {
        console.log('📋 Adicionando detalhamento por setor...');
        
        // Verificar se precisa de nova página
        if (yPos > 180) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALHAMENTO POR SETOR', margin, yPos);
        yPos += 10;

        // Preparar dados da tabela de setores
        const setoresData = {
          head: [['Setor', 'Tipo', 'Leitos Totais', 'Leitos Ocupados', 'Leitos Livres', 'Ocupação (%)', 'Status']],
          body: data.setores.map(item => {
            let status = 'Normal';
            if (item.ocupacao >= 90) status = 'Crítico';
            else if (item.ocupacao >= 80) status = 'Alerta';
            else if (item.ocupacao >= 60) status = 'Estável';
            
            return [
              item.setor || 'N/A',
              item.tipo || 'N/A',
              item.leitos_totais?.toString() || '0',
              item.leitos_ocupados?.toString() || '0',
              item.leitos_livres?.toString() || '0',
              `${item.ocupacao || 0}%`,
              status
            ];
          })
        };

        autoTable(doc, {
          startY: yPos,
          head: setoresData.head,
          body: setoresData.body,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 8, // Fonte menor para caber mais colunas
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [41, 128, 185], // Cor azul original
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 35 }, // Setor
            1: { cellWidth: 25 }, // Tipo
            6: { cellWidth: 20 }  // Status
          }
        });
      }

      // RESUMO E OBSERVAÇÕES
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : yPos + 15;
      
      if (finalY < 250) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVAÇÕES E RECOMENDAÇÕES:', margin, finalY);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        let obsY = finalY + 8;
        
        // Análise baseada nos dados
        const taxaUTI = data.metricas.uti?.ocupacao || 0;
        const taxaEnfermaria = data.metricas.enfermaria?.ocupacao || 0;
        
        if (taxaUTI >= 90) {
          doc.text('• UTI em nível crítico - considerar abertura de novos leitos ou transferências', margin + 5, obsY);
          obsY += 6;
        } else if (taxaUTI >= 80) {
          doc.text('• UTI em nível de alerta - monitorar continuamente', margin + 5, obsY);
          obsY += 6;
        }
        
        if (taxaEnfermaria >= 90) {
          doc.text('• Enfermaria em nível crítico - avaliar necessidade de ampliação', margin + 5, obsY);
          obsY += 6;
        } else if (taxaEnfermaria >= 80) {
          doc.text('• Enfermaria em nível de alerta - planejar contingência', margin + 5, obsY);
          obsY += 6;
        }
        
        if ((data.metricas.total?.ocupados || 0) > 0) {
          doc.text('• Total de leitos ocupados: ' + (data.metricas.total?.ocupados || 0), margin + 5, obsY);
          obsY += 6;
          doc.text('• Total de leitos livres: ' + ((data.metricas.total?.total || 0) - (data.metricas.total?.ocupados || 0)), margin + 5, obsY);
          obsY += 6;
        }
      }

      // RODAPÉ EM TODAS AS PÁGINAS
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        
        // Texto à esquerda
        doc.text('Sistema Hospitalar - Relatório Gerencial', margin, doc.internal.pageSize.getHeight() - 10);
        
        // Número da página no centro
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        
        // Data à direita
        doc.text(dataGeracao, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      }

      // Salvar
      const finalFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(finalFileName);
      
      console.log('✅ PDF salvo com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      throw error;
    }
  }

    static async exportData(format, dadosAtuais, periodo, unidade) {
      console.log('🔄 Exportando:', format);
      
      // Preparar dados para exportação
      const data = {
        periodo: periodo || 'mes',
        unidade: unidade === 'todas' ? 'Todas' : unidade,
        metricas: {
          uti: dadosAtuais.metricas?.uti || { ocupados: 0, total: 0, ocupacao: 0 },
          enfermaria: dadosAtuais.metricas?.enfermaria || { ocupados: 0, total: 0, ocupacao: 0 },
          total: dadosAtuais.metricas?.total || { ocupados: 0, total: 0, ocupacao: 0 }
        },
        setores: dadosAtuais.detalhamentoSetores || [],
        distribuicao: dadosAtuais.distribuicaoUnidades || [],
        tendencia: dadosAtuais.tendenciaOcupacao || []
      };
  
      console.log('📦 Dados preparados:', {
        setores: data.setores.length,
        distribuicao: data.distribuicao.length,
        tendencia: data.tendencia.length
      });
  
      const fileName = `ocupacao_leitos_${periodo}_${unidade}`;
      
      if (format === 'pdf') {
        return await this.exportToPdf(data, fileName);
      } else if (format === 'excel') {
        return await this.exportToExcel(data, fileName);
      }
      
      return false;
    }
  
    static exportToExcel(data, fileName = 'relatorio_leitos') {
      console.log('📊 Criando Excel...');
      
      try {
        // Criar um novo workbook
        const wb = XLSX.utils.book_new();
        
        // CAPA DO RELATÓRIO
        const cabecalho = [
          ['RELATÓRIO DE OCUPAÇÃO DE LEITOS'],
          [''],
          ['Período:', data.periodo === 'semana' ? 'Última Semana' : 
                       data.periodo === 'mes' ? 'Último Mês' :
                       data.periodo === 'trimestre' ? 'Último Trimestre' : 
                       data.periodo === 'ano' ? 'Último Ano' : data.periodo],
          ['Unidade:', data.unidade || 'Todas'],
          ['Gerado em:', new Date().toLocaleString('pt-BR')],
          [''],
          [''] // Linha em branco para separar
        ];
        
        const wsCapa = XLSX.utils.aoa_to_sheet(cabecalho);
        
        // Estilizar a capa (largura das colunas)
        wsCapa['!cols'] = [
          { wch: 20 }, // Coluna A
          { wch: 30 }  // Coluna B
        ];
        
        XLSX.utils.book_append_sheet(wb, wsCapa, "Capa");
        
        // MÉTRICAS PRINCIPAIS
        const metricasData = [
          ['MÉTRICAS PRINCIPAIS'],
          ['Tipo', 'Leitos Ocupados', 'Leitos Totais', 'Ocupação (%)', 'Status'],
        ];
        
        if (data.metricas.uti) {
          const status = data.metricas.uti.ocupacao >= 90 ? 'Crítico' : 
                        data.metricas.uti.ocupacao >= 80 ? 'Alerta' : 
                        data.metricas.uti.ocupacao >= 60 ? 'Estável' : 'Normal';
          
          metricasData.push([
            'UTI',
            data.metricas.uti.ocupados,
            data.metricas.uti.total,
            data.metricas.uti.ocupacao,
            status
          ]);
        }
        
        if (data.metricas.enfermaria) {
          const status = data.metricas.enfermaria.ocupacao >= 90 ? 'Crítico' : 
                        data.metricas.enfermaria.ocupacao >= 80 ? 'Alerta' : 
                        data.metricas.enfermaria.ocupacao >= 60 ? 'Estável' : 'Normal';
          
          metricasData.push([
            'Enfermaria',
            data.metricas.enfermaria.ocupados,
            data.metricas.enfermaria.total,
            data.metricas.enfermaria.ocupacao,
            status
          ]);
        }
        
        if (data.metricas.total) {
          const status = data.metricas.total.ocupacao >= 90 ? 'Crítico' : 
                        data.metricas.total.ocupacao >= 80 ? 'Alerta' : 
                        data.metricas.total.ocupacao >= 60 ? 'Estável' : 'Normal';
          
          metricasData.push([
            'Total Hospitalar',
            data.metricas.total.ocupados,
            data.metricas.total.total,
            data.metricas.total.ocupacao,
            status
          ]);
        }
        
        const wsMetricas = XLSX.utils.aoa_to_sheet(metricasData);
        
        // Aplicar larguras das colunas
        wsMetricas['!cols'] = [
          { wch: 20 }, // Tipo
          { wch: 15 }, // Ocupados
          { wch: 12 }, // Totais
          { wch: 15 }, // Ocupação
          { wch: 12 }  // Status
        ];
        
        XLSX.utils.book_append_sheet(wb, wsMetricas, "Métricas");
        
        // DISTRIBUIÇÃO POR UNIDADE
        if (data.distribuicao && data.distribuicao.length > 0) {
          const distribuicaoData = [
            ['DISTRIBUIÇÃO POR UNIDADE'],
            ['Tipo de Leito', 'Quantidade de Leitos', 'Percentual (%)', 'Status'],
          ];
          
          data.distribuicao.forEach(item => {
            let status = 'Normal';
            if (item.percentual >= 90) status = 'Crítico';
            else if (item.percentual >= 80) status = 'Alerta';
            else if (item.percentual >= 60) status = 'Estável';
            
            distribuicaoData.push([
              item.tipo || 'N/A',
              item.leitos || 0,
              item.percentual || 0,
              status
            ]);
          });
          
          const wsDistribuicao = XLSX.utils.aoa_to_sheet(distribuicaoData);
          wsDistribuicao['!cols'] = [
            { wch: 25 }, // Tipo
            { wch: 20 }, // Quantidade
            { wch: 15 }, // Percentual
            { wch: 15 }  // Status
          ];
          
          XLSX.utils.book_append_sheet(wb, wsDistribuicao, "Distribuição");
        }
        
        // TENDÊNCIA DE OCUPAÇÃO
        if (data.tendencia && data.tendencia.length > 0) {
          const tendenciaData = [
            ['TENDÊNCIA DE OCUPAÇÃO (ÚLTIMOS 7 DIAS)'],
            ['Data', 'Ocupação UTI (%)', 'Ocupação Enfermaria (%)', 'Média Geral (%)', 'Status'],
          ];
          
          data.tendencia.slice(0, 7).forEach(item => {
            const media = ((item.uti || 0) + (item.enfermaria || 0)) / 2;
            let status = 'Normal';
            if (media >= 90) status = 'Crítico';
            else if (media >= 80) status = 'Alerta';
            else if (media >= 60) status = 'Estável';
            
            tendenciaData.push([
              item.data || item.dia || 'N/A',
              item.uti || 0,
              item.enfermaria || 0,
              media.toFixed(1),
              status
            ]);
          });
          
          const wsTendencia = XLSX.utils.aoa_to_sheet(tendenciaData);
          wsTendencia['!cols'] = [
            { wch: 20 }, // Data
            { wch: 18 }, // UTI
            { wch: 22 }, // Enfermaria
            { wch: 18 }, // Média
            { wch: 15 }  // Status
          ];
          
          XLSX.utils.book_append_sheet(wb, wsTendencia, "Tendência");
        }
        
        // DETALHAMENTO POR SETOR
        if (data.setores && data.setores.length > 0) {
          const setoresData = [
            ['DETALHAMENTO POR SETOR'],
            ['Setor', 'Tipo', 'Leitos Totais', 'Leitos Ocupados', 'Leitos Livres', 'Ocupação (%)', 'Status'],
          ];
          
          data.setores.forEach(item => {
            let status = 'Normal';
            if (item.ocupacao >= 90) status = 'Crítico';
            else if (item.ocupacao >= 80) status = 'Alerta';
            else if (item.ocupacao >= 60) status = 'Estável';
            
            setoresData.push([
              item.setor || 'N/A',
              item.tipo || 'N/A',
              item.leitos_totais || 0,
              item.leitos_ocupados || 0,
              item.leitos_livres || 0,
              item.ocupacao || 0,
              status
            ]);
          });
          
          const wsSetores = XLSX.utils.aoa_to_sheet(setoresData);
          wsSetores['!cols'] = [
            { wch: 25 }, // Setor
            { wch: 15 }, // Tipo
            { wch: 12 }, // Totais
            { wch: 15 }, // Ocupados
            { wch: 12 }, // Livres
            { wch: 15 }, // Ocupação
            { wch: 12 }  // Status
          ];
          
          XLSX.utils.book_append_sheet(wb, wsSetores, "Setores");
        }
        
        // OBSERVAÇÕES
        const observacoesData = [
          ['OBSERVAÇÕES E RECOMENDAÇÕES'],
          [''],
        ];
        
        const taxaUTI = data.metricas.uti?.ocupacao || 0;
        const taxaEnfermaria = data.metricas.enfermaria?.ocupacao || 0;
        
        if (taxaUTI >= 90) {
          observacoesData.push(['• UTI em nível crítico - considerar abertura de novos leitos ou transferências']);
        } else if (taxaUTI >= 80) {
          observacoesData.push(['• UTI em nível de alerta - monitorar continuamente']);
        }
        
        if (taxaEnfermaria >= 90) {
          observacoesData.push(['• Enfermaria em nível crítico - avaliar necessidade de ampliação']);
        } else if (taxaEnfermaria >= 80) {
          observacoesData.push(['• Enfermaria em nível de alerta - planejar contingência']);
        }
        
        if ((data.metricas.total?.ocupados || 0) > 0) {
          observacoesData.push(['• Total de leitos ocupados: ' + (data.metricas.total?.ocupados || 0)]);
          observacoesData.push(['• Total de leitos livres: ' + ((data.metricas.total?.total || 0) - (data.metricas.total?.ocupados || 0))]);
        }
        
        const wsObservacoes = XLSX.utils.aoa_to_sheet(observacoesData);
        wsObservacoes['!cols'] = [{ wch: 80 }]; // Coluna única larga
        XLSX.utils.book_append_sheet(wb, wsObservacoes, "Observações");
        
        // GERAR E SALVAR ARQUIVO
        // Nome do arquivo com data
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
  }
  
  export { ExportLeitosService };
  export default ExportLeitosService;