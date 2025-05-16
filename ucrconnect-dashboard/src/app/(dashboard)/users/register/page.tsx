'use client';

import { useState } from 'react';
import { useEffect } from 'react';

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
    const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        return Object.keys(formErrors).length === 0 && emailAvailable === true;
    };

    // Check email
    useEffect(() => {
        setEmailAvailable(null);

        if (!formData.email || validateField('email', formData.email)) {
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                // Uncomment and adapt the following lines to use the actual API endpoint
                //const res = await fetch(`/api/users/check-email?email=${formData.email}`);
                //const data = await res.json();
                //setEmailAvailable(data.available);

                // Simulating an API call with a timeout
                const res = await new Promise<{ available: boolean }>((resolve) => {
                    const yaRegistrados = ['admin@ucr.ac.cr', 'user@ucr.ac.cr'];
                    setTimeout(() => {
                        resolve({ available: !yaRegistrados.includes(formData.email.toLowerCase()) });
                    }, 500);
                });

                setEmailAvailable(res.available);
                //---------------------------------------

            } catch (error) {
                console.error("Error al verificar el correo.", error);
                setEmailAvailable(null);
            }
        }, 500); // wait 500ms after the last keystroke

        return () => clearTimeout(timeoutId);
    }, [formData.email]);


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

        // No errors and Email available
        if (Object.keys(formErrors).length > 0 || emailAvailable !== true) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Fetch API to register user
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
        } catch (err) {
            console.error('Error al registrar usuario.', err);
            setErrors(prev => ({
                ...prev,
                form: "Ocurrió un error al registrar el usuario.",
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="mt-2 text-gray-600">Registrar nuevo usuario</h2>
            <div className="mt-10 w-full sm:w-11/12 md:w-3/4 lg:w-1/3">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-gray-800">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
                            className={`mt-1 w-full block px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.name && touched.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                            className={`mt-1 w-full block px-3 py-2 border ${errors.email || emailAvailable === false ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.email && touched.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                        {formData.email && !errors.email && touched.email && (
                            <p className={`text-sm mt-1 ${emailAvailable === true ? 'text-green-500' : emailAvailable === false ? 'text-red-500' : 'text-gray-500'}`}>
                                {emailAvailable === true
                                    ? 'Correo disponible.'
                                    : emailAvailable === false
                                        ? 'Este correo ya está registrado.'
                                        : 'Verificando disponibilidad...'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`mt-1 w-full block px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.password && touched.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirmar Contraseña <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Repite tu contraseña"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`mt-1 w-full block px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.confirmPassword && touched.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="mt-2 w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <p>* Campos obligatorios.</p>
                    </div>
                </form>
            </div>
        </div>
    );
}