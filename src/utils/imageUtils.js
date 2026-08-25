/**
 * Convierte un archivo a base64
 * @param {File} file - Archivo a convertir
 * @returns {Promise<string>} - Promise que resuelve a string base64
 */
export const convertirArchivoABase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Error convirtiendo el archivo a base64'))
    reader.readAsDataURL(file)
  })
}
