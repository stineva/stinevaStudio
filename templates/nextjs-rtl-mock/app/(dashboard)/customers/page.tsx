import CustomersTable from "../../../features/customers/CustomersTable";

export default function CustomersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">مدیریت مشتریان</h1>
      <CustomersTable showControls />
    </div>
  );
}
