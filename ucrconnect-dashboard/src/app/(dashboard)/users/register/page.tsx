'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getSecondaryAuth } from '@/lib/firebase';
import { deleteApp } from 'firebase/app';

// Form error types
type FormErrors = {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
};

// Validation status Types
type ValidationState = {
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
};

export default function RegisterUser() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<ValidationState>({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmationPassword, setShowConfirmationPassword] = useState(false);

    // Configuring Validation
    const validationConfig = {
        name: {
            required: true,
            minLength: 3,
            maxLength: 25,
            pattern: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/  // Only letters and spaces
        },
        email: {
            required: true,
            maxLength: 100,
            pattern: /^[^\s@]+@ucr\.ac\.cr$/
        },
        password: {
            required: true,
            minLength: 8,
            maxLength: 50,
        },
        confirmPassword: {
            required: true
        }
    };

    // Check specific form entry
    const validateField = (name: string, value: string, allFormData = formData): string => {
        const config = validationConfig[name as keyof typeof validationConfig];

        if (!value && config?.required) {
            const requiredMessages: Record<string, string> = {
                name: 'El nombre es obligatorio.',
                email: 'El correo es obligatorio.',
                password: 'La contraseña es obligatoria.',
                confirmPassword: 'Debes confirmar tu contraseña.',
            };

            return requiredMessages[name] || 'Este campo es obligatorio.';
        }

        if (name === 'name') {
            if ('pattern' in config && !config.pattern.test(value)) {
                return 'El nombre solo debe contener letras o espacios.';
            }
            if ('minLength' in config && value.length < config.minLength) {
                return `El nombre debe tener al menos ${config.minLength} caracteres.`;
            }
            if ('maxLength' in config && value.length > config.maxLength) {
                return `El nombre no puede tener más de ${config.maxLength} caracteres.`;
            }
        }

        if (name === 'email') {
            if ('pattern' in config && value && !config.pattern.test(value)) {
                return 'Formato de correo electrónico inválido.';
            }
            if ('maxLength' in config && value.length > config.maxLength) {
                return `El correo no puede tener más de ${config.maxLength} caracteres.`;
            }
        }

        if (name === 'password') {
            if ('minLength' in config && value.length < config.minLength) {
                return `La contraseña debe tener al menos ${config.minLength} caracteres.`;
            }
            if ('maxLength' in config && value.length > config.maxLength) {
                return `La contraseña no puede tener más de ${config.maxLength} caracteres.`;
            }
        }

        if (name === 'confirmPassword' && value !== allFormData.password) {
            return 'Las contraseñas no coinciden.';
        }

        return '';
    };

    // Effect to validate confirmPassword when password changes and vice versa
    useEffect(() => {
        if (touched.confirmPassword && formData.confirmPassword) {
            const error = validateField('confirmPassword', formData.confirmPassword);
            setErrors(prev => ({
                ...prev,
                confirmPassword: error,
            }));
        }

        if (touched.password && touched.confirmPassword && formData.confirmPassword) {
            const error = validateField('confirmPassword', formData.confirmPassword);
            setErrors(prev => ({
                ...prev,
                confirmPassword: error,
            }));
        }
    }, [formData.password, formData.confirmPassword, touched.confirmPassword, touched.password]);

    // Validate all entries in form
    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};

        Object.keys(formData).forEach((key) => {
            const fieldName = key as keyof typeof formData;
            const error = validateField(fieldName, formData[fieldName], formData);
            if (error) {
                newErrors[fieldName] = error;
            }
        });

        return newErrors;
    };

    // Check if its valid
    const isFormValid = (): boolean => {
        const formErrors = validateForm();
        return Object.keys(formErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Create updated form data for validation
        const updatedFormData = {
            ...formData,
            [name]: value,
        };

        setFormData(updatedFormData);

        // Validate when detecting change with the updated form data
        if (touched[name as keyof ValidationState]) {
            const error = validateField(name, value, updatedFormData);
            setErrors(prev => ({
                ...prev,
                [name]: error,
            }));
        }
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;

        setTouched(prev => ({
            ...prev,
            [name]: true,
        }));

        const error = validateField(name, formData[name as keyof typeof formData], formData);
        setErrors(prev => ({
            ...prev,
            [name]: error,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Set all entries as touched
        setTouched({
            name: true,
            email: true,
            password: true,
            confirmPassword: true,
        });

        const formErrors = validateForm();
        setErrors(formErrors);

        // No errors
        if (Object.keys(formErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        try {

            const { auth: secondaryAuth, app: secondaryApp } = getSecondaryAuth();

            // Parse email to lowercase
            const parsedEmail = formData.email.toLowerCase().trim();

            // Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                parsedEmail,
                formData.password
            );

            const newUser = userCredential.user;
            const authId = newUser.uid;
            const newUserToken = await newUser.getIdToken();

            // Send user data to backend api
            const response = await fetch(`/api/admin/auth/register`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: parsedEmail,
                    full_name: formData.name,
                    auth_id: authId,
                    auth_token: newUserToken,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                await deleteUser(newUser); // Delete the user from Firebase if the backend registration fails

                let errorMessage = "Ocurrió un error al registrar el usuario.";

                switch (response.status) {
                    case 400: // Validation error
                        if (Array.isArray(err.details)) {
                            errorMessage = err.details.join(" ");
                        } else {
                            errorMessage = "Algunos datos no son válidos. Verifica e intenta de nuevo.";
                        }
                        break;

                    case 401: // Not authorized
                        errorMessage = "No estás autorizado para realizar esta acción.";
                        break;

                    case 409: // Conflict (Email already in use)
                        errorMessage = "El correo electrónico ya está registrado como administrador.";
                        break;

                    case 500: // Internal Server Error
                        errorMessage = "Hubo un problema en el servidor. Intenta nuevamente más tarde.";
                        break;

                    default:
                        // Not cotemplated cases
                        errorMessage = err.message || "Ocurrió un error inesperado.";
                        break;
                }
                throw new Error(errorMessage);
            }

            // If the backend registration is successful, sign out the new user from Firebase
            await secondaryAuth.signOut();
            await deleteApp(secondaryApp);

            setSuccessMessage("Usuario registrado correctamente.");
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
            setErrors({});
            setTouched({
                name: false,
                email: false,
                password: false,
                confirmPassword: false,
            });

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err: any) {

            let message = "Ocurrió un error al registrar el usuario.";

            if (err.code === "auth/email-already-in-use") {
                message = "El correo electrónico ya está en uso.";
            } else if (err.code === "auth/invalid-email") {
                message = "El correo electrónico no es válido.";
            } else if (err.code === "auth/weak-password") {
                message = "La contraseña es demasiado débil. Debe tener al menos 8 caracteres.";
            } else if (err instanceof Error && err.message) {
                message = err.message;
            }

            setErrors(prev => ({
                ...prev,
                form: message,
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white shadow-xl rounded-2xl p-10">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-10">Registrar nuevo usuario administrador</h3>
            <div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-gray-800">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-[#249dd8] mb-1">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Nombre completo"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                                errors.name
                                ? 'border-red-500 ring-red-300'
                                : 'border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]'
                            } text-gray-800`}
                        />
                        {errors.name && touched.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-[#249dd8] mb-1">
                            Correo electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="ejemplo@ucr.ac.cr"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                                errors.email
                                ? 'border-red-500 ring-red-300'
                                : 'border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]'
                            } text-gray-800`}
                        />
                        {errors.email && touched.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-[#249dd8] mb-1">
                            Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 8 caracteres"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                                errors.password
                                ? 'border-red-500 ring-red-300'
                                : 'border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]'
                            } text-gray-800`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                aria-label="toggle password visibility"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && touched.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#249dd8] mb-1">
                            Confirmar Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmationPassword ? "text" : "password"}
                                placeholder="Repite tu contraseña"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 ${
                                errors.confirmPassword
                                ? 'border-red-500 ring-red-300'
                                : 'border-gray-300 focus:ring-[#249dd8] focus:border-[#249dd8]'
                            } text-gray-800`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmationPassword(!showConfirmationPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                aria-label="toggle confirmPassword visibility"
                            >
                                {showConfirmationPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && touched.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="w-auto py-3 px-10 rounded-full shadow text-white bg-[#249dd8] cursor-pointer hover:bg-[#1b87b9] disabled:opacity-50 disabled:cursor-not-allowed transition"
                            disabled={!isFormValid() || isSubmitting}
                            title={!isFormValid() ? 'Complete todos los campos correctamente.' : ''}
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrar usuario'}
                        </button>
                    </div>

                    {errors.form && (
                        <p className="text-red-500 text-sm mt-2 text-center">{errors.form}</p>
                    )}

                    {successMessage && (
                        <p className="text-green-600 text-sm mt-2 text-center">{successMessage}</p>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                        <p><span className="text-red-500">*</span> Campos obligatorios.</p>
                    </div>
                </form>
            </div>
        </div>
    );
}