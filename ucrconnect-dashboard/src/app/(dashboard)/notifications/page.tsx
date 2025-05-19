import NotificationForm from '@/components/notificationForm';

export default function Notifications() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-white">Enviar Notificación</h1>
      <NotificationForm />
    </div>
  );
}