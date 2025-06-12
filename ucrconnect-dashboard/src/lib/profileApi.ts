export async function fetchProfileFromApiRoute() {
  const res = await fetch('/api/admin/auth/profile')

  if (!res.ok) throw new Error('Error fetching profile')

  const data = await res.json()
  return data.data
}

export async function updateProfile(formData: FormData) {
  const res = await fetch('/api/admin/auth/profile', {
    method: 'PATCH',
    body: formData,
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || 'Error updating profile')
  }

  const data = await res.json()
  return data.data
}