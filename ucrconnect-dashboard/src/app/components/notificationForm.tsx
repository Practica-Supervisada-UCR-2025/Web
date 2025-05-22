"use client";

import { useState, useEffect } from "react";

export default function NotificationForm() {
    // State variables for form inputs
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [topic, setTopic] = useState("all-users");

    // State variables for loading and error messages
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
            
            const res = await fetch("/api/admin/auth/notification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, description, topic }),
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
                <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-[#249dd8] mb-1">Título <span className="text-red-500">*</span></label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                        required
                        className={`mt-1 w-full block px-3 py-2 border ${touched.title && errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.title && touched.title && (
                        <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-[#249dd8] mb-1">Descripción <span className="text-red-500">*</span></label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
                        required
                        rows={4}
                        className={`mt-1 w-full block px-3 py-2 border ${touched.description && errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.description && touched.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="topic" className="block text-sm font-semibold text-[#249dd8] mb-1">Tópico <span className="text-red-500">*</span></label>
                    <select
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="mt-1 w-full block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all-users">Todos los usuarios</option>
                        {/* Add more options on the future */}
                    </select>
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={!isFormValid}
                        className="w-auto py-3 px-10 rounded-full shadow text-white bg-[#249dd8] cursor-pointer hover:bg-[#1b87b9] disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? "Enviando..." : "Enviar Notificación"}
                    </button>
                </div>

                {successMessage && <p className="text-green-600 text-sm mt-2 text-center">{successMessage}</p>}
                {errorMessage && <p className="text-red-500 text-sm mt-2 text-center">{errorMessage}</p>}

                <div className="text-xs text-gray-500 mt-2">
                    <p><span className="text-red-500">*</span> Campos obligatorios.</p>
                </div>
            </form>
        </div>
    );
}
