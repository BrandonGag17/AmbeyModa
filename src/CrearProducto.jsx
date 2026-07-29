import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './CrearProducto.css'

function CrearProducto() {
  const navigate = useNavigate()

  const [Nombre, setNombre] = useState('')
  const [Descripcion, setDescripcion] = useState('')
  const [Precio, setPrecio] = useState('')
  const [Categoria, setCategoria] = useState('')
  const [ImagenUrl, setImagenUrl] = useState('')
  const [ImagenFile, setImagenFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    if (!ImagenFile) {
      setPreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(ImagenFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [ImagenFile])

  const convertirPrecio = (precio) => {
    if (!precio) return 0
    return Number(precio.toString().replace(',', '.'))
  }

  const convertirArchivoABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Error convirtiendo el archivo a base64'))
      reader.readAsDataURL(file)
    })
  }

  async function agregarProducto(producto) {
    const { error } = await supabase
      .from('Productos')
      .insert([producto])
      .select()

    if (error) {
      alert('Error al crear producto')
      return false
    }

    return true
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()

    if (!Nombre || !Descripcion || !Precio || !Categoria) {
      alert('Completa todos los campos antes de enviar.')
      return
    }

    setSubiendo(true)
    let imagenFinal = ImagenUrl

    if (ImagenFile) {
      try {
        imagenFinal = await convertirArchivoABase64(ImagenFile)
      } catch (error) {
        console.error('Error al convertir la imagen:', error)
        alert('No se pudo procesar la imagen. Intenta con otro archivo.')
        setSubiendo(false)
        return
      }
    }

    if (!imagenFinal) {
      alert('Sube una imagen o pega una URL válida.')
      setSubiendo(false)
      return
    }

    const producto = {
      Nombre,
      Descripcion,
      Precio: convertirPrecio(Precio),
      Categoria,
      ImagenUrl: imagenFinal
    }

    const creado = await agregarProducto(producto)
    setSubiendo(false)

    if (creado) {
      alert('Producto creado ✅')
      navigate('/')
    }
  }

  const manejarArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImagenFile(file)
    setImagenUrl('')
  }

  return (
    <div className="crear-producto-page">

      <form className="crear-producto-card" onSubmit={manejarSubmit}>

        <h1>Nuevo producto</h1>
        <p>Completá la información de la prenda</p>

        <div className="form-campo">
          <label>Nombre</label>
          <input
            placeholder="Ej. Remera Oversize"
            value={Nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="form-campo">
          <label>Descripción</label>
          <textarea
            rows="4"
            placeholder="Descripción del producto..."
            value={Descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="form-campo">
          <label>Precio</label>
          <input
            type="text"
            placeholder="$0"
            value={Precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>

        <div className="form-campo">
          <label>Categoría</label>
          <input
            placeholder="Ej. Remeras"
            value={Categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>

        <div className="form-campo">
          <label>Imagen</label>

          <input
            type="file"
            accept="image/*"
            onChange={manejarArchivo}
          />

          <small>
            Elegí una imagen desde tu dispositivo.
          </small>
        </div>

        {previewUrl && (
          <div className="preview-imagen">
            <img
              src={previewUrl}
              alt="Vista previa"
            />
          </div>
        )}

        <button
          className="guardar-btn"
          type="submit"
          disabled={subiendo}
        >
          {subiendo ? "Subiendo..." : "Agregar producto"}
        </button>

      </form>

    </div>
  )
}

export default CrearProducto 