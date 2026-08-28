import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { convertirArchivoABase64 } from './utils/imageUtils'
import { useIsAdmin } from './hooks/useIsAdmin'
import './DetalleProducto.css'

function DetalleProducto() {

  const navigate = useNavigate()
  const { id } = useParams()
  const esAdmin = useIsAdmin()
  
  const [producto, setProducto] = useState(null)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [categorias, setCategorias] = useState([])

  const [fotos, setFotos] = useState([])
  const [fotoActual, setFotoActual] = useState(0)
  const [cargandoFotos, setCargandoFotos] = useState(true)
  const [fotosNuevas, setFotosNuevas] = useState([])
  const [fotosReemplazadas, setFotosReemplazadas] = useState({})
  const [fotosAEliminar, setFotosAEliminar] = useState([])
  const [origenZoom, setOrigenZoom] = useState('50% 50%')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    traerProducto()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const traerCategorias = useCallback(async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('idcategoria, nombre')
      .order('nombre', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setCategorias(data || [])
  }, [])

  useEffect(() => {
    if (editando) {
      traerCategorias()
    }
  }, [editando, traerCategorias])

  async function traerProducto() {
    const { data, error } = await supabase
      .from('Productos')
      .select('idProducto, Nombre, Descripcion, ImagenUrl, idCategoria, enStock')
      .eq('idProducto', id)

    if (error) {
      console.log(error)
      return
    }

    const p = data[0]

    const productoInicial = {
      ...p,
      categoriaNombre: undefined
    }

    setProducto(productoInicial)
    setForm(productoInicial)
    setPreviewUrl(productoInicial.ImagenUrl || '')

    const categoriaPromise = supabase
      .from('categorias')
      .select('nombre')
      .eq('idcategoria', p.idCategoria)
      .single()

    const fotosPromise = supabase
      .from('FotosProducto')
      .select('idFoto, ImagenUrl, orden')
      .eq('idProducto', p.idProducto)
      .order('orden', { ascending: true })

    const [{ data: categoria }, { data: fotosData, error: fotosError }] =
      await Promise.all([categoriaPromise, fotosPromise])

    setProducto((actual) => actual
      ? { ...actual, categoriaNombre: categoria?.nombre }
      : actual
    )

    if (fotosError) {
      console.error(fotosError)
    } else {
      setFotos(fotosData || [])
    }

    Object.values(fotosReemplazadas).forEach((reemplazo) => {
      URL.revokeObjectURL(reemplazo.preview)
    })
    fotosNuevas.forEach((foto) => URL.revokeObjectURL(foto.preview))
    setFotosNuevas([])
    setFotosReemplazadas({})
    setFotosAEliminar([])
    setCargandoFotos(false)
  }

  const manejarFotoAdicional = (e, idFoto) => {
    const file = e.target.files?.[0]
    if (!file) return

    const preview = URL.createObjectURL(file)
    setFotosReemplazadas((actuales) => {
      const reemplazoAnterior = actuales[idFoto]
      if (reemplazoAnterior) URL.revokeObjectURL(reemplazoAnterior.preview)

      return {
        ...actuales,
        [idFoto]: { file, preview }
      }
    })
    setFotos((actuales) => actuales.map((foto) =>
      foto.idFoto === idFoto
        ? { ...foto, ImagenUrl: preview }
        : foto
    ))
    e.target.value = ''
  }

  const eliminarFotoExistente = (idFoto) => {
    const reemplazo = fotosReemplazadas[idFoto]
    if (reemplazo) URL.revokeObjectURL(reemplazo.preview)

    setFotos((actuales) => actuales.filter((foto) => foto.idFoto !== idFoto))
    setFotosAEliminar((actuales) => [...actuales, idFoto])
    setFotosReemplazadas((actuales) => {
      const restantes = { ...actuales }
      delete restantes[idFoto]
      return restantes
    })
    setFotoActual(0)
  }

  const manejarNuevasFotos = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setFotosNuevas((actuales) => [
      ...actuales,
      ...files.map((file) => ({
        file,
        preview: URL.createObjectURL(file)
      }))
    ])
    e.target.value = ''
  }

  const eliminarFotoNueva = (index) => {
    URL.revokeObjectURL(fotosNuevas[index].preview)
    setFotosNuevas((actuales) =>
      actuales.filter((_, fotoIndex) => fotoIndex !== index)
    )
  }

  async function cancelarEdicion() {
    setEditando(false)
    await traerProducto()
  }

  const manejarArchivo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await convertirArchivoABase64(file)
      setForm({ ...form, ImagenUrl: base64 })
      setPreviewUrl(base64)
    } catch (err) {
      console.error('Error procesando imagen:', err)
      alert('No se pudo procesar la imagen. Intentá con otro archivo.')
    }
  }

  async function guardarCambios() {
    if (!esAdmin || guardando) {
      alert('Debes iniciar sesión para editar este producto.')
      return
    }

    setGuardando(true)

    try {
    const { data: productoActualizado, error } = await supabase
      .from('Productos')
      .update({
        Nombre: form.Nombre,
        Descripcion: form.Descripcion,
        ImagenUrl: form.ImagenUrl,
        idCategoria: form.idCategoria,
        enStock: Boolean(form.enStock),
      })
      .eq('idProducto', id)
      .select('idProducto, Nombre, Descripcion, ImagenUrl, idCategoria, enStock')
      .maybeSingle()

    if (error || !productoActualizado) {
      alert('No se pudo guardar el producto. Revisá que la sesión tenga permisos de administración e intentá de nuevo.')
      console.error(error)
      return
    }

    setProducto((actual) => actual
      ? { ...actual, ...productoActualizado }
      : actual
    )
    setForm((actual) => actual
      ? { ...actual, ...productoActualizado }
      : actual
    )

    for (const idFoto of fotosAEliminar) {
      const { error: eliminarError } = await supabase
        .from('FotosProducto')
        .delete()
        .eq('idFoto', idFoto)

      if (eliminarError) {
        alert('El producto se guardó, pero no se pudo eliminar una foto.')
        console.error(eliminarError)
        return
      }
    }

    for (const [idFoto, reemplazo] of Object.entries(fotosReemplazadas)) {
      const imagen = await convertirArchivoABase64(reemplazo.file)
      const { error: reemplazarError } = await supabase
        .from('FotosProducto')
        .update({ ImagenUrl: imagen })
        .eq('idFoto', idFoto)

      if (reemplazarError) {
        alert('El producto se guardó, pero no se pudo reemplazar una foto.')
        console.error(reemplazarError)
        return
      }
    }

    // Los órdenes pueden tener huecos cuando se eliminó una foto. Usar la
    // cantidad de fotos podría repetir un orden existente y la base rechaza
    // el insert si ese orden debe ser único para el producto.
    const ultimoOrden = fotos.reduce(
      (mayor, foto) => Math.max(mayor, Number(foto.orden) || 0),
      0
    )

    for (let i = 0; i < fotosNuevas.length; i++) {
      const imagen = await convertirArchivoABase64(fotosNuevas[i].file)
      const { error: agregarError } = await supabase
        .from('FotosProducto')
        .insert({
          idProducto: id,
          ImagenUrl: imagen,
          orden: ultimoOrden + i + 1
        })

      if (agregarError) {
        alert('El producto se guardó, pero no se pudo agregar una foto.')
        console.error(agregarError)
        return
      }
    }

    alert('Guardado ✅')
    setEditando(false)
    // refrescar
    await traerProducto()
    } catch (error) {
      console.error('Error guardando producto:', error)
      alert('OcurriÃ³ un error al guardar el producto.')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminarProducto() {
    if (!esAdmin) {
      alert('Debes iniciar sesión para eliminar este producto.')
      return
    }

    const confirmar = window.confirm(`¿Seguro que querés eliminar ${producto.Nombre}?`)
    if (!confirmar) return

    // verificamos si tiene ventas asociadas
    const { data: detalles } = await supabase
      .from('DetalleVentas')
      .select('idDetalle')
      .eq('idProducto', id)

    if (detalles && detalles.length > 0) {
      alert('No podés eliminar este producto porque tiene ventas registradas.')
      return
    }

    const { error } = await supabase
      .from('Productos')
      .delete()
      .eq('idProducto', id)

    if (error) {
      alert('Error al eliminar')
      return
    }

    alert('Producto eliminado ✅')
    navigate('/')
  }

  function actualizarOrigenZoom(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigenZoom(`${x}% ${y}%`)
  }

  if (!producto) return <p>Cargando...</p>

  return (
    <div className="detalle-producto">

      {guardando && (
        <div className="guardando-producto" role="status" aria-live="polite">
          <div className="guardando-producto__spinner" />
          <p>Guardando cambios...</p>
        </div>
      )}


      <div className="detalle-producto-contenido">

        <div className="detalle-producto-imagen">

          {producto.ImagenUrl || fotos.length > 0 ? (

            <div
              className="carrusel"
              onMouseMove={actualizarOrigenZoom}
              onMouseLeave={() => setOrigenZoom('50% 50%')}
            >

              {cargandoFotos && (
                <div className="cargando-fotos" role="status" aria-label="Cargando fotos" />
              )}

              <button
                className="carrusel-btn carrusel-anterior"
                onClick={() => {
                  const totalFotos = fotos.length + 1

                  setFotoActual(
                    fotoActual === 0
                      ? totalFotos - 1
                      : fotoActual - 1
                  )
                }}
              >
                ‹
              </button>

              <img
                src={
                  fotoActual === 0
                    ? producto.ImagenUrl
                    : fotos[fotoActual - 1]?.ImagenUrl
                }
                alt={`${producto.Nombre} - Foto ${fotoActual + 1}`}
                style={{ '--origen-zoom': origenZoom }}
              />

              <button
                className="carrusel-btn carrusel-siguiente"
                onClick={() => {
                  const totalFotos = fotos.length + 1

                  setFotoActual(
                    fotoActual === totalFotos - 1
                      ? 0
                      : fotoActual + 1
                  )
                }}
              >
                ›
              </button>

              <div className="carrusel-indicadores">

                <button
                  className={
                    fotoActual === 0
                      ? "indicador activo"
                      : "indicador"
                  }
                  onClick={() => setFotoActual(0)}
                >
                  ●
                </button>

                {fotos.map((foto, index) => (
                  <button
                    key={foto.idFoto}
                    className={
                      fotoActual === index + 1
                        ? "indicador activo"
                        : "indicador"
                    }
                    onClick={() => setFotoActual(index + 1)}
                  >
                    ●
                  </button>
                ))}

              </div>

            </div>

          ) : (

            <p className="sin-imagen">Sin imagen</p>

          )}

        </div>


        <div className="detalle-producto-campos">

          <div className="campo-fila">
            <span className="campo-label">Nombre</span>

            {editando ? (
              <input
                className="campo-input"
                value={form.Nombre}
                onChange={(e) =>
                  setForm({ ...form, Nombre: e.target.value })
                }
              />
            ) : (
              <p className="campo-valor">
                {producto.Nombre}
              </p>
            )}

          </div>

          <div className="campo-fila">
            <span className="campo-label">Descripción</span>

            {editando ? (
              <textarea
                className="campo-input"
                value={form.Descripcion}
                onChange={(e) =>
                  setForm({ ...form, Descripcion: e.target.value })
                }
              />
            ) : (
              <p className="campo-valor descripcion-valor">
                {producto.Descripcion}
              </p>
            )}
          </div>
          <div className="campo-fila">
            <span className="campo-label">Categoría</span>
            {editando ? (
              <select
                className="campo-input"
                value={form.idCategoria}
                onChange={(e) =>
                  setForm({
                    ...form,
                    idCategoria: Number(e.target.value)
                  })
                }
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
            ) : (
              <p className="campo-valor">
                {producto.categoriaNombre || 'Sin categoría'}
              </p>
            )}

          </div>
          <div className="campo-fila">
            <span className="campo-label">En stock</span>

            {editando ? (
              <select
                className="campo-input"
                value={form.enStock ? "true" : "false"}
                onChange={(e) =>
                  setForm({
                    ...form, enStock: e.target.value === "true"
                  })
                }
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            ) : (
              <p className={`campo-valor ${producto.enStock ? '' : 'sin-stock'}`}>
                {producto.enStock ? 'En stock' : 'Sin stock'}
              </p>
            )}


            {editando && (

              <div className="campo-fila">

                <span className="campo-label">
                  Cambiar imagen
                </span>


                <div className="imagen-editor">

                  <label className="selector-imagen">
                    Elegir imagen desde el dispositivo
                    <input
                      className="input-file"
                      type="file"
                      accept="image/*"
                      onChange={manejarArchivo}
                    />
                  </label>


                  <input
                    className="campo-input"
                    placeholder="O pegá una URL"
                    value={form.ImagenUrl?.startsWith('data:') ? '' : form.ImagenUrl || ''}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        ImagenUrl: e.target.value
                      })
                      setPreviewUrl(e.target.value)
                    }}
                  />


                  {previewUrl && (
                    <img
                      className="imagen-preview"
                      src={previewUrl}
                      alt="Vista previa"
                    />
                  )}

                </div>

              </div>

            )}

          </div>

        </div>

        {editando && (
          <div className="fotos-adicionales-editor">
            <span className="campo-label">Fotos adicionales</span>

            <div className="fotos-editor-lista">
              {fotos.map((foto, index) => (
                <div className="foto-editor" key={foto.idFoto}>
                  <img src={foto.ImagenUrl} alt={`Foto adicional ${index + 1}`} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => manejarFotoAdicional(e, foto.idFoto)}
                    aria-label={`Reemplazar foto adicional ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-eliminar-foto"
                    onClick={() => eliminarFotoExistente(foto.idFoto)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ))}

              {fotosNuevas.map((foto, index) => (
                <div className="foto-editor" key={foto.preview}>
                  <img src={foto.preview} alt={`Foto nueva ${index + 1}`} />
                  <button
                    type="button"
                    className="btn btn-danger btn-eliminar-foto"
                    onClick={() => eliminarFotoNueva(index)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ))}
            </div>

            <label className="agregar-fotos-label">
              Agregar fotos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={manejarNuevasFotos}
              />
            </label>
          </div>
        )}


        <div className="detalle-producto-acciones">

          {editando ? (
            <>
              <button
                className="btn btn-primary"
                onClick={guardarCambios}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>

              <button
                className="btn btn-secondary"
                onClick={cancelarEdicion}
                disabled={guardando}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              {esAdmin && (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditando(true)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={eliminarProducto}
                  >
                    Eliminar
                  </button>
                </>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  )
}


export default DetalleProducto
