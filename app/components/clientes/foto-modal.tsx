'use client'

import { useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { useDropzone } from 'react-dropzone'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { Camera, Upload, RotateCcw, Check, X, ZoomIn, ZoomOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ─── helpers ────────────────────────────────────────────────────────────────

async function getCroppedBlob(imageSrc: string, croppedArea: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  const SIZE = 512
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    image,
    croppedArea.x,
    croppedArea.y,
    croppedArea.width,
    croppedArea.height,
    0,
    0,
    SIZE,
    SIZE,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('canvas.toBlob failed'))
    }, 'image/jpeg', 0.92)
  })
}

// ─── types ───────────────────────────────────────────────────────────────────

type Step = 'select' | 'crop'
type Tab = 'upload' | 'camera'

interface FotoModalProps {
  open: boolean
  onClose: () => void
  /** Called with the final cropped File, ready to send to the API */
  onConfirm: (file: File) => void
  /** Shape of the crop area. Default: 'round' */
  cropShape?: 'round' | 'rect'
}

// ─── component ───────────────────────────────────────────────────────────────

export function FotoModal({ open, onClose, onConfirm, cropShape = 'round' }: FotoModalProps) {
  const [step, setStep] = useState<Step>('select')
  const [tab, setTab] = useState<Tab>('upload')
  const [rawImage, setRawImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  const webcamRef = useRef<Webcam>(null)

  // reset whenever the dialog opens
  function handleOpenChange(open: boolean) {
    if (!open) {
      setStep('select')
      setRawImage(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      onClose()
    }
  }

  // ── upload via dropzone ──────────────────────────────────────────────────
  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted[0]) return
    const reader = new FileReader()
    reader.onload = () => {
      setRawImage(reader.result as string)
      setStep('crop')
    }
    reader.readAsDataURL(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
  })

  // ── webcam capture ───────────────────────────────────────────────────────
  function captureWebcam() {
    const screenshot = webcamRef.current?.getScreenshot()
    if (screenshot) {
      setRawImage(screenshot)
      setStep('crop')
    }
  }

  // ── confirm crop ─────────────────────────────────────────────────────────
  async function handleConfirm() {
    if (!rawImage || !croppedArea) return
    const blob = await getCroppedBlob(rawImage, croppedArea)
    const file = new File([blob], 'foto.jpg', { type: 'image/jpeg' })
    onConfirm(file)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)]">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-sm font-bold text-[var(--d2b-text-primary)]">
            {step === 'select' ? 'Adicionar foto' : 'Ajustar imagem'}
          </DialogTitle>
        </DialogHeader>

        {/* ── STEP: select ──────────────────────────────────────────────── */}
        {step === 'select' && (
          <div className="p-5 space-y-4">
            {/* tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-[var(--d2b-bg-elevated)]">
              {(['upload', 'camera'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-colors
                    ${tab === t
                      ? 'bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] shadow-sm'
                      : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]'}`}
                >
                  {t === 'upload' ? <Upload size={14} /> : <Camera size={14} />}
                  {t === 'upload' ? 'Upload' : 'Câmera'}
                </button>
              ))}
            </div>

            {/* upload */}
            {tab === 'upload' && (
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center gap-3 h-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors
                  ${isDragActive
                    ? 'border-[#7C4DFF] bg-[#7C4DFF]/5'
                    : 'border-[var(--d2b-border)] hover:border-[#7C4DFF] hover:bg-[var(--d2b-bg-elevated)]'}`}
              >
                <input {...getInputProps()} />
                <Upload size={28} className="text-[var(--d2b-text-muted)]" />
                <div className="text-center">
                  <p className="text-xs font-medium text-[var(--d2b-text-primary)]">
                    {isDragActive ? 'Solte aqui' : 'Arraste ou clique para selecionar'}
                  </p>
                  <p className="text-[10px] text-[var(--d2b-text-muted)] mt-0.5">JPG, PNG, WEBP — máx. 10 MB</p>
                </div>
              </div>
            )}

            {/* camera */}
            {tab === 'camera' && (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={0.92}
                    videoConstraints={{ facingMode: 'user', width: 512, height: 512 }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={captureWebcam}
                  className="w-full py-2 rounded-lg bg-[#7C4DFF] text-white text-xs font-semibold hover:bg-[#6B42E0] transition-colors flex items-center justify-center gap-2"
                >
                  <Camera size={14} /> Tirar foto
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP: crop ────────────────────────────────────────────────── */}
        {step === 'crop' && rawImage && (
          <div className="p-5 space-y-4">
            {/* cropper */}
            <div className="relative rounded-xl overflow-hidden bg-black" style={{ height: 280 }}>
              <Cropper
                image={rawImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape={cropShape}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedArea(areaPixels)}
              />
            </div>

            {/* zoom slider */}
            <div className="flex items-center gap-3">
              <ZoomOut size={14} className="text-[var(--d2b-text-muted)] flex-shrink-0" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-[#7C4DFF] h-1 cursor-pointer"
              />
              <ZoomIn size={14} className="text-[var(--d2b-text-muted)] flex-shrink-0" />
            </div>

            {/* actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setStep('select'); setRawImage(null); setCrop({ x: 0, y: 0 }); setZoom(1) }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-[var(--d2b-border)] text-xs font-medium text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors"
              >
                <RotateCcw size={13} /> Escolher outra
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#7C4DFF] text-white text-xs font-semibold hover:bg-[#6B42E0] transition-colors"
              >
                <Check size={13} /> Confirmar
              </button>
            </div>
          </div>
        )}

        {/* close button */}
        <button
          onClick={() => handleOpenChange(false)}
          className="absolute top-4 right-4 text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors"
        >
          <X size={16} />
        </button>
      </DialogContent>
    </Dialog>
  )
}
