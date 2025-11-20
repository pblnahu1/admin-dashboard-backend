// import { useState } from 'react';
import { Button } from './ui/Button';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Product } from '../lib/supabase';

interface ProductExportImportProps {
  products: Product[];
  onImport: (products: Product[]) => void;
}

// interface ValidationError {
//   row: number;
//   field?: string;
//   message: string;
// }

export const ProductExportImport = ({ products }: ProductExportImportProps) => {
  // const [previewRows, setPreviewRows] = useState<any[]>([]);
  // const [validRows, setValidRows] = useState<any[]>([]);
  // const [errors, setErrors] = useState<ValidationError[]>([]);
  // const [isImporting, setIsImporting] = useState(false);

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

  /*const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewRows([]);
    setValidRows([]);
    setErrors([]);

    const isCsv = file.name.toLowerCase().endsWith('.csv');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (!result) return;

        let workbook;
        if (isCsv && typeof result === 'string') {
          workbook = XLSX.read(result, { type: 'binary' });
        } else {
          const data = new Uint8Array(result as ArrayBuffer);
          workbook = XLSX.read(data, { type: 'array' });
        }

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: null }) as any[];

        if (!jsonData.length) {
          alert('El archivo está vacío');
          return;
        }

        const { validRows: valid, errors: validationErrors } = validateImportedData(jsonData);

        setPreviewRows(jsonData.slice(0, 20));
        setValidRows(valid);
        setErrors(validationErrors);

        if (validationErrors.length > 0) {
          alert('Se encontraron problemas en el archivo. Revisa el detalle debajo antes de importar.');
        }
      } catch (error) {
        console.error('Error al procesar el archivo:', error);
        alert('Error al procesar el archivo. Ver consola para más detalles.');
      }
    };

    if (isCsv) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };*/

  /*const validateImportedData = (rows: any[]) => {
    const requiredFields = ['name', 'price', 'slug'];
    const errors: ValidationError[] = [];
    const validRows: any[] = [];

    const seenSlug = new Map<string, number[]>();
    const seenSku = new Map<string, number[]>();

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      let hasError = false;

      requiredFields.forEach((field) => {
        const value = row[field];
        if (value === undefined || value === null || value === '') {
          errors.push({ row: rowNumber, field, message: `El campo "${field}" es obligatorio.` });
          hasError = true;
        }
      });

      if (row.stock !== undefined && row.stock !== null && Number(row.stock) < 0) {
        errors.push({ row: rowNumber, field: 'stock', message: 'El stock no puede ser negativo.' });
        hasError = true;
      }

      if (row.slug) {
        const slug = String(row.slug).trim();
        const existing = seenSlug.get(slug) || [];
        existing.push(rowNumber);
        seenSlug.set(slug, existing);
      }

      if (row.sku) {
        const sku = String(row.sku).trim();
        const existing = seenSku.get(sku) || [];
        existing.push(rowNumber);
        seenSku.set(sku, existing);
      }

      if (!hasError) {
        validRows.push(row);
      }
    });

    seenSlug.forEach((rowsIndex, slug) => {
      if (rowsIndex.length > 1) {
        rowsIndex.forEach((rowNumber) => {
          errors.push({
            row: rowNumber,
            field: 'slug',
            message: `Slug duplicado "${slug}" dentro del archivo.`,
          });
        });
      }
    });

    seenSku.forEach((rowsIndex, sku) => {
      if (rowsIndex.length > 1) {
        rowsIndex.forEach((rowNumber) => {
          errors.push({
            row: rowNumber,
            field: 'sku',
            message: `SKU duplicado "${sku}" dentro del archivo.`,
          });
        });
      }
    });

    return { validRows, errors };
  };*/

  /*const handleConfirmImport = async () => {
    if (!validRows.length) {
      alert('No hay filas válidas para importar.');
      return;
    }

    setIsImporting(true);
    try {
      onImport(validRows as Product[]);
    } finally {
      setIsImporting(false);
    }
  };*/

  return (
    <div className="mb-4 space-y-3">
      <div className="flex gap-2">
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
        {/* <div className="flex gap-2 ml-auto">
          <input
            type="file"
            id="file-upload"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="mr-2 w-4 h-4" />
            Importar CSV/Excel
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={!validRows.length || isImporting}
            onClick={handleConfirmImport}
          >
            {isImporting ? 'Importando...' : `Confirmar importación (${validRows.length})`}
          </Button>
        </div> */}
      </div>

      {/* {previewRows.length > 0 && (
        <div className="p-3 text-xs bg-white rounded border shadow-sm border-slate-200">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-slate-800">
              Preview de archivo (primeras {previewRows.length} filas)
            </span>
            <span className="text-slate-500">
              Válidas: {validRows.length} · Errores: {errors.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50">
                <tr>
                  {Object.keys(previewRows[0]).map((key) => (
                    <th
                      key={key}
                      className="px-2 py-1 font-semibold text-left border-b text-slate-700 border-slate-200"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    {Object.keys(previewRows[0]).map((key) => (
                      <td key={key} className="px-2 py-1 text-slate-700">
                        {row[key] as any}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )} */}

      {/* {errors.length > 0 && (
        <div className="p-3 text-xs bg-red-50 rounded border border-red-200">
          <div className="mb-1 font-semibold text-red-700">
            Errores encontrados en el archivo
          </div>
          <ul className="space-y-0.5 max-h-40 overflow-auto">
            {errors.slice(0, 200).map((error, index) => (
              <li key={`${error.row}-${error.field}-${index}`} className="text-red-700">
                Fila {error.row}
                {error.field ? ` · ${error.field}` : ''}: {error.message}
              </li>
            ))}
            {errors.length > 200 && (
              <li className="text-red-700">
                ... y {errors.length - 200} errores más
              </li>
            )}
          </ul>
        </div>
      )} */}
    </div>
  );
};