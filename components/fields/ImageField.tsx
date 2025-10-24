"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image"; // renombrado para evitar conflicto
import { Form, Modal, Button } from "react-bootstrap";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import { useController, Control } from "react-hook-form";
import { useModals } from "@/context/ModalContext";
import { createImage } from "@/app/actions/image-field-actions";

type TImageProps = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  folder: string | null;
  remove?: boolean;
  height: number;
  width: number;
  editable?: boolean;
  invisible?: boolean;
};

export function ImageField({
  name,
  control,
  folder,
  remove = true,
  width,
  height,
  editable = true,
  invisible,
}: TImageProps) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  const { modalError } = useModals();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSource, setImageSource] = useState<string | null>(value ?? null);
  const [rawFile, setRawFile] = useState<File | null>(null);

  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    setImageSource(value ?? null);
  }, [value]);

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setImageSource(null);
    onChange(null); // actualiza RHF
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // if (imageSource) {
    //   modalError("Elimina la imagen actual para editar");
    //   return;
    // }

    const objectUrl = URL.createObjectURL(file);
    setRawFile(file);
    setImageSource(objectUrl);
    setShowCropper(true);
  };

  // Crear un objeto Image nativo para el cropper
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCroppedImg = async (imageSrc: string, cropPixels: any) => {
    const image = new window.Image(); // constructor nativo
    image.src = imageSrc;
    await new Promise((res) => (image.onload = res));

    const canvas = document.createElement("canvas");
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        resolve(
          new File([blob], rawFile?.name ?? "cropped.jpg", {
            type: "image/jpeg",
          })
        );
      }, "image/jpeg");
    });
  };

  const handleCropConfirm = async () => {
    if (!imageSource || !croppedAreaPixels) return;

    const croppedFile = await getCroppedImg(imageSource, croppedAreaPixels);
    if (!croppedFile) return;

    const toastId = toast.loading("Subiendo imagen...", {
      position: "bottom-right",
    });

    const formData = new FormData();
    formData.append("image", croppedFile);

    const res = await createImage({ formData, folder });

    if (res.success) {
      // ✅ data ya viene en formato base64
      const url = res.data || null;
      setImageSource(url);
      onChange(url);
      toast.success(res.message, { id: toastId });
    } else {
      modalError(res.message);
      toast.dismiss(toastId);
    }

    setShowCropper(false);
  };

  if (invisible) return null;

  return (
    <>
      {/* Imagen clickable */}
      <div
        role="button"
        onClick={() => {
          if (editable) fileInputRef.current?.click();
        }}
        className="position-relative d-inline-block mb-3"
        title={name}
      >
        <NextImage
          src={imageSource ?? "/image/avatar_default.svg"}
          alt="user_image"
          className="img-fluid rounded border"
          width={width}
          height={height}
          unoptimized
          style={{
            cursor: editable ? "pointer" : "default",
            objectFit: "cover",
            width: `${width}px`,
            height: `${height}px`,
          }}
        />
        {imageSource && remove && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="btn btn-danger btn-sm rounded-circle position-absolute"
            style={{
              top: "-8px",
              right: "-8px",
              width: `25px`,
              height: `25px`,
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
            }}
          >
            <i className="bi bi-trash-fill"></i>
          </button>
        )}
        <Form.Control
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImage}
          className="d-none"
        />
      </div>

      {/* Cropper Modal */}
      <Modal show={showCropper} onHide={() => setShowCropper(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Recortar imagen</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ position: "relative", height: "400px" }}>
          {imageSource && (
            <Cropper
              image={imageSource}
              crop={crop}
              zoom={zoom}
              aspect={1} // cuadrado
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedPixels) =>
                setCroppedAreaPixels(croppedPixels)
              }
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCropper(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCropConfirm}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {error && <p className="text-danger small mt-1">{error.message}</p>}
    </>
  );
}
