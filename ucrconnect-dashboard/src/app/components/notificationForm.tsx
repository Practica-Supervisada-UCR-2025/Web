"use client";

import { useState, useEffect } from "react";
import { Dropdown } from "@/components/ui/dropdown";
import { TextField } from "@/components/ui/textFields";
import { TextArea } from "@/components/ui/textArea";
import { Button } from '@/components/ui/button';

export default function NotificationForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("all-users");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [touched, setTouched] = useState({
    title: false,
    description: false,
  });

  useEffect(() => {
    const newErrors: typeof errors = {};

    if (title.trim().length < 5) {
      newErrors.title = "El título debe tener al menos 5 caracteres.";
    } else if (title.length > 100) {
      newErrors.title = "El título no debe superar los 100 caracteres.";
    }

    if (description.trim().length < 10) {
      newErrors.description = "La descripción debe tener al menos 10 caracteres.";
    } else if (description.length > 1000) {
      newErrors.description = "La descripción no debe superar los 1000 caracteres.";
    }

    setErrors(newErrors);
  }, [title, description]);

  const isFormValid =
    !loading &&
    Object.keys(errors).length === 0 &&
    title.trim() !== "" &&
    description.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    setTouched({
      title: true,
      description: true,
    });

    setLoading(true);

    try {
      if (!isFormValid) {
        throw new Error("Formulario inválido: completa los campos requeridos.");
      }

      const adminName = "Administrador";

      const res = await fetch("/api/admin/auth/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body: description, name: adminName, topic }),
      });

      if (!res.ok) throw new Error("Error al enviar notificación");

      setSuccessMessage("Notificación enviada correctamente.");
      setTitle("");
      setDescription("");
      setTouched({ title: false, description: false });
      setErrors({});

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-10">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">Enviar Notificación</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-gray-800">
        <TextField
          id="title"
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={touched.title ? errors.title : undefined}
          required
          onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
        />

        <TextArea
          id="description"
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={touched.description ? errors.description : undefined}
          required
          onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
          rows={4}
        />

        <Dropdown
          label="Tópico"
          id="topic"
          value={topic}
          options={[{ label: "Todos los usuarios", value: "all-users" }]}
          onChange={setTopic}
        />

        <div className="flex justify-center">
          <Button
            type="submit"
            isLoading={loading}
            disabled={!isFormValid}
            className=""
         >
            Enviar Notificación
         </Button>
        </div>

        {successMessage && (
          <p className="text-green-600 text-sm mt-2 text-center">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2 text-center">{errorMessage}</p>
        )}

        <div className="text-xs text-gray-500 mt-2">
          <p>
            <span className="text-red-500">*</span> Campos obligatorios.
          </p>
        </div>
      </form>
    </div>
  );
}
