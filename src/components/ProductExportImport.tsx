import { Button } from './ui/Button';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Product } from '../lib/supabase';

interface ProductExportImportProps {
  products: Product[];
  onImport: (products: Product[]) => void;
}

export const ProductExportImport = ({ products, onImport }: ProductExportImportProps) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
    XLSX.writeFile(workbook, 'productos.xlsx');
  };

  const exportToPDF = async () => {
  // Columnas que queremos incluir
  const columns = ['id', 'name', 'description', 'price', 'stock'];
  const columnTitles = {
    id: 'ID',
    name: 'Nombre',
    description: 'Descripción',
    price: 'Precio',
    stock: 'Stock'
  };

  // Anchos personalizados para cada columna (en porcentaje)
  const columnWidths = {
    id: '10%',
    name: '25%',
    description: '40%',
    price: '15%',
    stock: '10%'
  };

  // Crear contenedor principal
  const container = document.createElement('div');
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';

  // Agregar título
  const title = document.createElement('h1');
  title.textContent = 'Reporte de Productos';
  title.style.textAlign = 'center';
  title.style.marginBottom = '20px';
  title.style.fontSize = '24px';
  title.style.color = '#2c3e50';
  container.appendChild(title);

  // Agregar fecha
  const date = document.createElement('div');
  date.textContent = `Generado el: ${new Date().toLocaleDateString()}`;
  date.style.textAlign = 'right';
  date.style.marginBottom = '20px';
  date.style.color = '#7f8c8d';
  container.appendChild(date);

  // Crear tabla
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginTop = '10px';
  table.style.fontSize = '12px';

  // Crear encabezados
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.backgroundColor = '#f8f9fa';
  
  // Asegurarse de que hay productos
  if (products.length === 0) {
    alert('No hay productos para exportar');
    return;
  }

  // Agregar encabezados
  columns.forEach(column => {
    const th = document.createElement('th');
    th.style.border = '1px solid #dee2e6';
    th.style.padding = '10px';
    th.style.textAlign = 'left';
    th.style.backgroundColor = '#f8f9fa';
    th.style.fontWeight = 'bold';
    th.style.width = columnWidths[column as keyof typeof columnWidths] || 'auto';
    th.textContent = columnTitles[column as keyof typeof columnTitles] || column;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Agregar filas de datos
  const tbody = document.createElement('tbody');
  products.forEach((product, index) => {
    const row = document.createElement('tr');
    row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
    
    columns.forEach(column => {
      const td = document.createElement('td');
      td.style.border = '1px solid #dee2e6';
      td.style.padding = '8px';
      td.style.wordBreak = 'break-word';
      td.style.verticalAlign = 'top';
      
      // @ts-expect-error - Acceso dinámico a las propiedades
      let value = product[column];
      
      // Formatear valores específicos
      if (column === 'price' && value !== null && value !== undefined) {
        value = `$${parseFloat(value).toFixed(2)}`;
      }
      
      td.textContent = value !== null && value !== undefined ? String(value) : 'N/A';
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  // Agregar al documento temporalmente
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.appendChild(container);
  document.body.appendChild(tempDiv);

  try {
    // Configurar el PDF en orientación horizontal para mejor visualización
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Ajustar el tamaño del contenedor para que sea más grande
    container.style.width = '1200px';
    container.style.padding = '30px';
    
    // Aumentar el tamaño de la fuente
    const allTextElements = container.querySelectorAll('*');
    allTextElements.forEach(el => {
      if (el.style) {
        const currentSize = parseInt(el.style.fontSize || '12', 10);
        el.style.fontSize = `${currentSize * 1.5}px`;
      }
    });
    
    // Convertir el contenido a imagen con mayor resolución
    const canvas = await html2canvas(container, {
      scale: 3, // Aumentar la escala para mejor calidad
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200 // Ancho de la ventana para el renderizado
    });
    
    // Ajustar la imagen al ancho de la página manteniendo la relación de aspecto
    const imgData = canvas.toDataURL('image/png', 1.0);
    let imgWidth = pageWidth - 20; // margen de 10mm a cada lado
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Si la altura es mayor que la página, ajustar al alto de la página
    if (imgHeight > pageHeight - 20) {
      imgHeight = pageHeight - 20;
      imgWidth = (canvas.width * imgHeight) / canvas.height;
    }
    
    // Agregar la imagen al PDF
    doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    
    // Guardar el PDF
    doc.save(`productos_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    alert('Error al generar el PDF. Por favor, intente exportar a Excel o intente nuevamente.');
  } finally {
    // Limpiar el elemento temporal
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }
};

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as Product[];

        // Validar estructura
        if (validateExcelStructure(jsonData)) {
          onImport(jsonData);
        } else {
          alert('El archivo no tiene el formato correcto');
        }
      } catch (error) {
        console.error('Error al procesar el archivo:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateExcelStructure = (data: any[]): boolean => {
    if (!data.length) return false;
    
    const requiredFields = ['name', 'price', 'slug'];
    const firstRow = data[0];
    
    return requiredFields.every(field => field in firstRow);
  };

  return (
    <div className="flex gap-2 mb-4">
      <div className="flex gap-2">
        <Button onClick={exportToExcel} variant="outline" size="sm">
          <Download className="mr-2 w-4 h-4" />
          Exportar Excel
        </Button>
        <Button onClick={exportToPDF} variant="outline" size="sm">
          <FileSpreadsheet className="mr-2 w-4 h-4" />
          Exportar PDF
        </Button>
      </div>
      <div>
        <input
          type="file"
          id="file-upload"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className="mr-2 w-4 h-4" />
          Importar Excel
        </Button>
      </div>
    </div>
  );
};