export async function fetchProfile() {
  const res = await fetch('/data/profile.json');
  const data = await res.json();

  return {
    message: 'Admin profile retrieved successfully',
    data,
  };
}