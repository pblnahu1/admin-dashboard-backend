import imageCompression from 'browser-image-compression';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import { supabase } from '../lib/supabase';

// Función para generar un UUID
function generateUUID(): string {
  return crypto.randomUUID();
}


// Configuración de compresión
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1, // Tamaño máximo del archivo en MB
  maxWidthOrHeight: 1600, // Ancho o alto máximo
  useWebWorker: true, // Usar WebWorker para no bloquear el hilo principal
  maxIteration: 10, // Número máximo de iteraciones para reducir el tamaño
};

// Límite de subidas simultáneas
const UPLOAD_CONCURRENCY = 3;
const uploadQueue = pLimit(UPLOAD_CONCURRENCY);

// Tipos
type UploadOptions = {
  userId: string;
  productId: string;
  file: File;
  onProgress?: (progress: number) => void;
};

type UploadResult = {
  url: string;
  path: string;
  width: number;
  height: number;
  size: number;
};

/**
 * Comprime una imagen antes de subirla
 */
async function compressImage(file: File): Promise<File> {
  try {
    console.log(`Comprimiendo imagen: ${file.name}, tamaño original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    const compressedFile = await imageCompression(file, {
      ...COMPRESSION_OPTIONS,
      onProgress: (progress) => {
        console.log(`Progreso de compresión: ${Math.round(progress)}%`);
      },
    });

    console.log(`Imagen comprimida: ${file.name}, tamaño final: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    return new File(
      [compressedFile],
      file.name.replace(/\.(jpe?g|png|gif|bmp|webp)$/i, '.webp'),
      { type: 'image/webp' }
    );
  } catch (error) {
    console.error('Error al comprimir la imagen:', error);
    throw new Error('No se pudo comprimir la imagen');
  }
}

/**
 * Sube un archivo a Supabase Storage con reintentos
 */
async function uploadFileWithRetry(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ path: string; publicUrl: string }> {
  try {
    const { data, error } = await pRetry(
      async () => {
        const result = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            contentType: file.type,
            upsert: false,
            cacheControl: '3600',
          });

        if (result.error) {
          throw result.error;
        }

        return result;
      },
      {
        retries: 3,
        onFailedAttempt: (error) => {
          console.warn(
            `Intento fallido de subida (${error.attemptNumber}/3): ${error.message}`
          );
          if (error.attemptNumber >= 3) {
            console.error('Se agotaron los intentos de subida');
          }
        },
      }
    );

    if (!data) {
      throw new Error('No se pudo subir el archivo');
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      path: data.path,
      publicUrl,
    };
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    throw new Error('Error al subir la imagen');
  }
}

/**
 * Obtiene las dimensiones de una imagen
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
      URL.revokeObjectURL(objectUrl);
    };
    
    img.onerror = () => {
      // Si hay un error, devolvemos valores por defecto
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(objectUrl);
    };
    
    img.src = objectUrl;
  });
}

/**
 * Sube una imagen a Supabase Storage con compresión
 */
export async function uploadProductImage({
  userId,
  productId,
  file,
  onProgress,
}: UploadOptions): Promise<UploadResult> {
  try {
    // 1. Validar el tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Formato de archivo no soportado');
    }

    // 2. Comprimir la imagen
    const compressedFile = await compressImage(file);
    
    // 3. Generar un nombre de archivo único
    const fileExt = compressedFile.name.split('.').pop()?.toLowerCase() || 'webp';
    const fileName = `${generateUUID()}.${fileExt}`;
    const filePath = `products/${userId}/${productId}/${fileName}`;

    // 4. Subir el archivo
    const uploadResult = await uploadQueue(() =>
      uploadFileWithRetry('product-images', filePath, compressedFile, onProgress)
    );

    // 5. Obtener dimensiones de la imagen
    const dimensions = await getImageDimensions(compressedFile);

    // 6. Devolver el resultado
    return {
      url: uploadResult.publicUrl,
      path: uploadResult.path,
      width: dimensions.width,
      height: dimensions.height,
      size: compressedFile.size,
    };
  } catch (error) {
    console.error('Error en uploadProductImage:', error);
    throw error;
  }
}

/**
 * Elimina una imagen de Supabase Storage
 */
export async function deleteProductImage(imagePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('product-images')
      .remove([imagePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    throw new Error('No se pudo eliminar la imagen');
  }
}

/**
 * Genera una miniatura de una imagen
 */
export async function generateThumbnail(
  file: File,
  maxWidth = 200,
  maxHeight = 200
): Promise<File> {
  try {
    const options = {
      maxSizeMB: 0.2, // Tamaño máximo más pequeño para miniaturas
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      useWebWorker: true,
      fileType: 'image/webp',
    };

    const compressedFile = await imageCompression(file, options);
    
    return new File(
      [compressedFile],
      `thumb-${file.name.replace(/\.(jpe?g|png|gif|bmp|webp)$/i, '.webp')}`,
      { type: 'image/webp' }
    );
  } catch (error) {
    console.error('Error al generar miniatura:', error);
    throw new Error('No se pudo generar la miniatura');
  }
}
