// Renderiza um diagrama Mermaid (arquivo HTML em docs/) num iframe oculto,
// captura o <svg> resultante e o converte em PNG para embutir em PDFs.
// Reutiliza os mesmos arquivos dos botões DER/MER (fonte única, sem duplicar).

function esperarPor(fn, timeout = 6000, intervalo = 100) {
  return new Promise((resolve, reject) => {
    const inicio = Date.now()
    const tick = () => {
      let r
      try { r = fn() } catch (_) { r = null }
      if (r) return resolve(r)
      if (Date.now() - inicio > timeout) return reject(new Error('timeout aguardando render'))
      setTimeout(tick, intervalo)
    }
    tick()
  })
}

function carregarImagem(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Abre `url` (HTML com diagrama Mermaid) num iframe oculto, espera renderizar
 * e devolve { dataUrl, width, height } com a imagem PNG do diagrama.
 * Lança erro se o render não acontecer dentro do timeout.
 */
export async function capturarDiagramaPng(url, { scale = 2, timeout = 6000 } = {}) {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;left:-99999px;top:0;width:1200px;height:900px;border:0;'
  document.body.appendChild(iframe)
  try {
    await new Promise((resolve, reject) => {
      iframe.onload = resolve
      iframe.onerror = () => reject(new Error('falha ao carregar iframe'))
      iframe.src = url
    })
    const doc = iframe.contentDocument
    // mermaid substitui o <pre class="mermaid"> por um <svg> ao terminar
    const svg = await esperarPor(() => doc.querySelector('.mermaid svg'), timeout)

    // dimensões reais a partir do viewBox (fallback para o bounding box)
    const vb = svg.viewBox && svg.viewBox.baseVal
    const rect = svg.getBoundingClientRect()
    const w = Math.ceil((vb && vb.width) || rect.width || 1000)
    const h = Math.ceil((vb && vb.height) || rect.height || 700)
    svg.setAttribute('width', w)
    svg.setAttribute('height', h)

    const xml = new XMLSerializer().serializeToString(svg)
    const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml)
    const img = await carregarImagem(src)

    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    return { dataUrl: canvas.toDataURL('image/png'), width: w, height: h }
  } finally {
    iframe.remove()
  }
}
