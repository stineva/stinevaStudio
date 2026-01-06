import SettingsForm from "../../../features/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">تنظیمات</h1>
      <SettingsForm />
    </div>
  );
}
