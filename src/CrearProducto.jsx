import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './CrearProducto.css'

function CrearProducto() {
  const navigate = useNavigate()

  const [Nombre, setNombre] = useState('')
  const [Descripcion, setDescripcion] = useState('')
  const [ImagenUrl, setImagenUrl] = useState('')
  const [ImagenFile, setImagenFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState("")
  const [idCategoria, setIdCategoria] = useState("")

  useEffect(() => {
    traerCategorias()
  }, [])

  useEffect(() => {
    if (!ImagenFile) {
      setPreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(ImagenFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [ImagenFile])

  async function traerCategorias() {
    const { data, error } = await supabase
      .from('categorias')
      .select('idcategoria, nombre')
      .order('nombre', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setCategorias(data || [])
  }

  async function crearCategoria() {
    if (!nuevaCategoria.trim()) {
      alert('Escribí un nombre para la categoría.')
      return
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert({
        nombre: nuevaCategoria.trim()
      })
      .select('idcategoria, nombre')
      .single()

    if (error) {
      alert('Error al crear la categoría.')
      console.error(error)
      return
    }

    await traerCategorias()

    if (data?.idcategoria) {
      setIdCategoria(data.idcategoria.toString())
    }
    setNuevaCategoria('')
    setMostrarNuevaCategoria(false)
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
    console.log('Intentando crear producto:', producto)

    try {
      const { error } = await supabase
        .from('Productos')
        .insert([producto], { returning: 'minimal' })

      if (error) {
        console.error('Error al crear producto en Supabase:', error)
        alert(`Error al crear producto: ${error.message}`)
        return false
      }

      return true
    } catch (error) {
      console.error('Excepción al crear producto:', error)
      alert('Error inesperado al crear el producto. Mira la consola para más detalles.')
      return false
    }
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()

    if (!Nombre || !Descripcion || !idCategoria) {
      alert("Completa todos los campos antes de enviar.")
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

    const categoriaSeleccionada = categorias.find(
      (categoria) => categoria.idcategoria?.toString() === idCategoria
    )

    const producto = {
      Nombre,
      Descripcion,
      idCategoria: Number(idCategoria),
      ImagenUrl: imagenFinal,
      enStock: true,
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
          <label>Categoría</label>

          <select
            className="campo-input"
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
          >
            <option value="">Seleccionar categoría</option>

            {categorias.map((categoria) => (
              <option
                key={categoria.idcategoria}
                value={categoria.idcategoria}
              >
                {categoria.nombre}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setMostrarNuevaCategoria(true)}
          >
            + Nueva categoría
          </button>
          {mostrarNuevaCategoria && (
            <div className="form-campo">

              <label>Nueva categoría</label>

              <input
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                placeholder="Ej. Camperas"
              />

              <button
                type="button"
                className="btn btn-primary"
                onClick={crearCategoria}
              >
                Crear categoría
              </button>

            </div>
          )}
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